from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid
import boto3
from botocore.client import Config
import os

from database import get_db
from models.models import User, Order, OrderItem, Product, Coupon, BankAccount, Category, Brand, StockNotification
from deps import get_admin_user
from serializers import order_to_dict, product_to_dict, user_to_dict
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

router = APIRouter()


# ─── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    revenue_query = await session.execute(
        select(func.sum(Order.total)).where(Order.payment_status == "paid")
    )
    total_revenue = revenue_query.scalar() or 0.0

    orders_query = await session.execute(select(func.count(Order.id)))
    total_orders = orders_query.scalar() or 0

    pending_query = await session.execute(
        select(func.count(Order.id)).where(Order.payment_status == "pending")
    )
    pending_orders = pending_query.scalar() or 0

    users_query = await session.execute(select(func.count(User.id)))
    total_users = users_query.scalar() or 0

    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_users": total_users
    }


@router.get("/recent-orders")
async def get_recent_orders(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Son 10 sipariş - dashboard için"""
    from sqlalchemy.orm import selectinload
    result = await session.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    return [order_to_dict(o) for o in result.scalars().all()]


# ─── Orders ───────────────────────────────────────────────────────────────────

@router.get("/orders")
async def get_all_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    stmt = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    if payment_status:
        stmt = stmt.where(Order.payment_status == payment_status)
    result = await session.execute(stmt)
    return [order_to_dict(o) for o in result.scalars().all()]


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: uuid.UUID,
    status: str,
    payment_status: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    order.status = status
    order.payment_status = payment_status
    await session.commit()
    return {"message": "Sipariş güncellendi"}


@router.patch("/orders/{order_id}/tracking")
async def update_tracking_number(
    order_id: uuid.UUID,
    request: Request,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Kargo takip numarası ekle"""
    data = await request.json()
    result = await session.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    # tracking_number sütunu startup'ta ALTER TABLE ile ekleniyor
    try:
        order.tracking_number = data.get("tracking_number", "")
        # Kargo takip no girilince status'u shipped yap
        if data.get("tracking_number") and order.status == "processing":
            order.status = "shipped"
    except AttributeError:
        pass
    await session.commit()
    return {"message": "Takip numarası güncellendi"}


@router.post("/orders/{order_id}/approve-payment")
async def approve_eft_payment(
    order_id: uuid.UUID,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """EFT/Havale ödemesini manuel onayla"""
    result = await session.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    order.payment_status = "paid"
    order.status = "processing"
    await session.commit()
    return {"message": "Ödeme onaylandı, sipariş hazırlanıyor"}


# ─── Products ─────────────────────────────────────────────────────────────────

@router.get("/products")
async def get_all_products(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Product).order_by(Product.created_at.desc()))
    return [product_to_dict(p) for p in result.scalars().all()]


@router.post("/products")
async def create_product(
    product_data: dict,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    image_url = product_data.get("image_url") or product_data.get("image", "")
    new_product = Product(
        name=product_data.get("name"),
        slug=product_data.get("slug", str(uuid.uuid4())[:8]),
        price=product_data.get("price", 0),
        original_price=product_data.get("original_price"),
        category=product_data.get("category"),
        brand=product_data.get("brand"),
        stock=product_data.get("stock", 0),
        description=product_data.get("description", ""),
        image=image_url,
        images=[image_url] if image_url else [],
        is_featured=product_data.get("is_featured", False),
        sku=product_data.get("sku"),
        oem_kodu=product_data.get("oem_kodu"),
        model=product_data.get("model"),
        model_id=product_data.get("model_id"),
        year_range=product_data.get("year_range"),
    )
    session.add(new_product)
    await session.commit()
    await session.refresh(new_product)
    return product_to_dict(new_product)


@router.patch("/products/{product_id}")
async def update_product(
    product_id: str,
    product_data: dict,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Ürün güncelle: stok, fiyat, featured, açıklama vs."""
    try:
        pid = uuid.UUID(product_id)
        result = await session.execute(select(Product).where(Product.id == pid))
    except ValueError:
        result = await session.execute(select(Product).where(Product.slug == product_id))

    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    updatable = ["name", "price", "original_price", "stock", "category", "brand",
                 "description", "is_featured", "sku", "oem_kodu", "model", "model_id", "year_range"]
    for field in updatable:
        if field in product_data:
            setattr(product, field, product_data[field])

    # image_url -> image + images
    if "image_url" in product_data:
        product.image = product_data["image_url"]
        product.images = [product_data["image_url"]] if product_data["image_url"] else []

    await session.commit()
    await session.refresh(product)
    return product_to_dict(product)


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    try:
        pid = uuid.UUID(product_id)
        result = await session.execute(select(Product).where(Product.id == pid))
    except ValueError:
        result = await session.execute(select(Product).where(Product.slug == product_id))

    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    await session.delete(product)
    await session.commit()
    return {"message": "Ürün silindi"}


# ─── Coupons ──────────────────────────────────────────────────────────────────

@router.get("/coupons")
async def get_all_coupons(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Coupon))
    coupons = result.scalars().all()
    return [
        {
            "id": str(c.id), "code": c.code, "type": c.type,
            "value": float(c.value), "min_order": float(c.min_order),
            "description": c.description, "active": c.active,
        }
        for c in coupons
    ]


@router.post("/coupons")
async def create_coupon(
    coupon_data: dict,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    new_coupon = Coupon(
        code=coupon_data.get("code").upper(),
        type=coupon_data.get("type", "fixed"),
        value=coupon_data.get("value", 0),
        min_order=coupon_data.get("min_order", 0),
        description=coupon_data.get("description", ""),
        active=coupon_data.get("active", True)
    )
    session.add(new_coupon)
    await session.commit()
    return {"message": "Kupon oluşturuldu"}


@router.patch("/coupons/{coupon_id}/toggle")
async def toggle_coupon(
    coupon_id: uuid.UUID,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")
    coupon.active = not coupon.active
    await session.commit()
    return {"message": "Kupon durumu güncellendi", "active": coupon.active}


@router.delete("/coupons/{coupon_id}")
async def delete_coupon(
    coupon_id: uuid.UUID,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon bulunamadı")
    await session.delete(coupon)
    await session.commit()
    return {"message": "Kupon silindi"}


# ─── S3 / Image Upload ────────────────────────────────────────────────────────

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=os.environ.get('SERVICE_URL_S3', 'http://s3.motoprof.com.tr'),
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID', ''),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY', ''),
        config=Config(signature_version='s3v4'),
        region_name='us-east-1'
    )


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin_user: User = Depends(get_admin_user)
):
    s3 = get_s3_client()
    bucket_name = 'motoprof-images'

    try:
        s3.head_bucket(Bucket=bucket_name)
    except Exception:
        s3.create_bucket(Bucket=bucket_name)
        import json
        policy = {
            "Version": "2012-10-17",
            "Statement": [{"Sid": "PublicRead", "Effect": "Allow", "Principal": "*",
                           "Action": ["s3:GetObject"], "Resource": [f"arn:aws:s3:::{bucket_name}/*"]}]
        }
        try:
            s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
        except Exception:
            pass

    ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4().hex}.{ext}"

    try:
        s3.upload_fileobj(file.file, bucket_name, unique_filename,
                          ExtraArgs={'ContentType': file.content_type})
        s3_url = os.environ.get('SERVICE_URL_S3', 'http://s3.motoprof.com.tr')
        public_url = f"{s3_url}/{bucket_name}/{unique_filename}"
        return {"url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resim yüklenemedi: {str(e)}")


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def get_all_users(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    return [user_to_dict(u) for u in result.scalars().all()]


@router.get("/users/{user_id}/orders")
async def get_user_orders(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Bir müşterinin tüm siparişleri"""
    from sqlalchemy.orm import selectinload
    result = await session.execute(
        select(Order)
        .where(Order.user_id == uuid.UUID(user_id))
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return [order_to_dict(o) for o in result.scalars().all()]


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    user = await session.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Admin silinemez")
    await session.delete(user)
    await session.commit()
    return {"message": "Kullanıcı silindi"}


# ─── Categories & Brands ──────────────────────────────────────────────────────

@router.get("/categories")
async def get_categories(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Category).order_by(Category.name.asc()))
    return [{"id": str(c.id), "name": c.name, "slug": c.slug} for c in result.scalars().all()]


@router.post("/categories")
async def add_category(
    request: Request,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    data = await request.json()
    cat = Category(name=data["name"], slug=data["slug"])
    session.add(cat)
    await session.commit()
    return {"message": "Kategori eklendi", "id": str(cat.id)}


@router.delete("/categories/{cat_id}")
async def delete_category(
    cat_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    cat = await session.get(Category, uuid.UUID(cat_id))
    if cat:
        await session.delete(cat)
        await session.commit()
    return {"message": "Kategori silindi"}


@router.get("/brands")
async def get_brands(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Brand).order_by(Brand.name.asc()))
    return [{"id": str(b.id), "name": b.name, "slug": b.slug} for b in result.scalars().all()]


@router.post("/brands")
async def add_brand(
    request: Request,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    data = await request.json()
    brand = Brand(name=data["name"], slug=data["slug"])
    session.add(brand)
    await session.commit()
    return {"message": "Marka eklendi", "id": str(brand.id)}


@router.delete("/brands/{brand_id}")
async def delete_brand(
    brand_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    brand = await session.get(Brand, uuid.UUID(brand_id))
    if brand:
        await session.delete(brand)
        await session.commit()
    return {"message": "Marka silindi"}


# ─── Banks ────────────────────────────────────────────────────────────────────

@router.get("/banks")
async def get_banks(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(BankAccount))
    return [
        {"id": str(b.id), "bank_name": b.bank_name, "iban": b.iban,
         "account_holder": b.account_holder, "is_active": b.is_active}
        for b in result.scalars().all()
    ]


@router.post("/banks")
async def add_bank(
    request: Request,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    data = await request.json()
    bank = BankAccount(
        bank_name=data["bank_name"],
        iban=data["iban"],
        account_holder=data["account_holder"],
        branch_name=data.get("branch_name"),
        account_number=data.get("account_number"),
        is_active=data.get("is_active", True),
    )
    session.add(bank)
    await session.commit()
    return {"message": "Banka eklendi", "id": str(bank.id)}


@router.patch("/banks/{bank_id}/toggle")
async def toggle_bank(
    bank_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    bank = await session.get(BankAccount, uuid.UUID(bank_id))
    if not bank:
        raise HTTPException(status_code=404, detail="Banka bulunamadı")
    bank.is_active = not bank.is_active
    await session.commit()
    return {"message": "Güncellendi", "is_active": bank.is_active}


@router.delete("/banks/{bank_id}")
async def delete_bank(
    bank_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    bank = await session.get(BankAccount, uuid.UUID(bank_id))
    if bank:
        await session.delete(bank)
        await session.commit()
    return {"message": "Banka silindi"}



# ─── Stock Notifications ──────────────────────────────────────────────────────

@router.get("/stock-notifications")
async def get_notifications(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(
        select(StockNotification).order_by(StockNotification.created_at.desc())
    )
    return [
        {"id": str(n.id), "email": n.email, "product_id": n.product_id,
         "created_at": n.created_at.isoformat()}
        for n in result.scalars().all()
    ]


@router.post("/notify-stock/{product_id}")
async def send_stock_notification(
    product_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(
        select(StockNotification).where(StockNotification.product_id == product_id)
    )
    notifs = result.scalars().all()
    count = len(notifs)
    for n in notifs:
        await session.delete(n)
    await session.commit()
    # TODO: Gerçek e-posta entegrasyonu (SMTP/SendGrid) buraya eklenecek
    return {"message": f"{count} kişiye stok bildirimi gönderildi ve listeden çıkarıldı."}


# ─── Export ───────────────────────────────────────────────────────────────────

@router.get("/export/orders")
async def export_orders(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Order).order_by(Order.created_at.desc()))
    orders = result.scalars().all()

    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(["Siparis ID", "Tarih", "Musteri", "Email", "Telefon",
                     "Tutar", "Odeme Yontemi", "Odeme Durumu", "Siparis Durumu",
                     "Adres", "Il", "Kargo Takip No"])

    for o in orders:
        writer.writerow([
            str(o.id),
            o.created_at.strftime("%Y-%m-%d %H:%M"),
            o.shipping_name or "-",
            o.guest_email or "-",
            o.shipping_phone or "-",
            float(o.total),
            getattr(o, "payment_method", "-"),
            o.payment_status,
            o.status,
            o.shipping_address or "-",
            o.shipping_city or "-",
            getattr(o, "tracking_number", "") or "-",
        ])

    f.seek(0)
    response = StreamingResponse(iter([f.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=siparisler.csv"
    return response


# ─── Sync: Ürünlerden Kategori/Marka Senkronizasyonu ─────────────────────────

@router.post("/sync-categories-brands")
async def sync_categories_brands_from_products(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Ürün tablosundaki mevcut brand/category değerlerini okuyup
    Category ve Brand tablolarına eksik olanları ekler.
    """
    from sqlalchemy import distinct as sql_distinct

    existing_cats = {r[0] for r in (await session.execute(select(Category.name))).all()}
    cat_rows = (await session.execute(
        select(sql_distinct(Product.category)).where(Product.category.isnot(None))
    )).all()

    added_cats = []
    for (cat_name,) in cat_rows:
        if not cat_name or not cat_name.strip() or cat_name in existing_cats:
            continue
        slug = cat_name.lower().replace(" & ", "-ve-").replace("&", "-ve-").replace(" ", "-")
        existing_slug = await session.scalar(select(Category).where(Category.slug == slug))
        if existing_slug:
            slug = f"{slug}-2"
        session.add(Category(name=cat_name, slug=slug))
        existing_cats.add(cat_name)
        added_cats.append(cat_name)

    existing_brands = {r[0] for r in (await session.execute(select(Brand.name))).all()}
    brand_rows = (await session.execute(
        select(sql_distinct(Product.brand)).where(Product.brand.isnot(None))
    )).all()

    added_brands = []
    for (brand_name,) in brand_rows:
        if not brand_name or not brand_name.strip() or brand_name in existing_brands:
            continue
        slug = brand_name.lower().replace(" ", "-")
        existing_slug = await session.scalar(select(Brand).where(Brand.slug == slug))
        if existing_slug:
            slug = f"{slug}-2"
        session.add(Brand(name=brand_name, slug=slug))
        existing_brands.add(brand_name)
        added_brands.append(brand_name)

    await session.commit()
    return {
        "message": "Senkronizasyon tamamlandı",
        "added_categories": added_cats,
        "added_brands": added_brands
    }

