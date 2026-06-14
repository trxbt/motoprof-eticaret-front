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
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import or_, cast, Date as SADate

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)

    # Toplam ciro (ödendi)
    total_revenue = (await session.execute(
        select(func.sum(Order.total)).where(Order.payment_status == "paid")
    )).scalar() or 0.0

    # Bugünkü ciro
    today_revenue = (await session.execute(
        select(func.sum(Order.total)).where(
            Order.payment_status == "paid",
            Order.created_at >= today_start
        )
    )).scalar() or 0.0

    # Bu haftaki ciro
    week_revenue = (await session.execute(
        select(func.sum(Order.total)).where(
            Order.payment_status == "paid",
            Order.created_at >= week_start
        )
    )).scalar() or 0.0

    # Bu ayki ciro
    month_revenue = (await session.execute(
        select(func.sum(Order.total)).where(
            Order.payment_status == "paid",
            Order.created_at >= month_start
        )
    )).scalar() or 0.0

    # Toplam sipariş
    total_orders = (await session.execute(select(func.count(Order.id)))).scalar() or 0

    # Bugünkü sipariş
    today_orders = (await session.execute(
        select(func.count(Order.id)).where(Order.created_at >= today_start)
    )).scalar() or 0

    # Bu haftaki sipariş
    week_orders = (await session.execute(
        select(func.count(Order.id)).where(Order.created_at >= week_start)
    )).scalar() or 0

    # Onay bekleyen (pending + pending_transfer)
    pending_orders = (await session.execute(
        select(func.count(Order.id)).where(
            or_(Order.payment_status == "pending", Order.payment_status == "pending_transfer")
        )
    )).scalar() or 0

    # EFT/Havale bekleyen ayrı
    eft_pending = (await session.execute(
        select(func.count(Order.id)).where(
            or_(
                Order.payment_status == "pending_transfer",
                Order.payment_method == "bank_transfer"
            ),
            Order.payment_status != "paid"
        )
    )).scalar() or 0

    # Toplam üye
    total_users = (await session.execute(select(func.count(User.id)))).scalar() or 0

    # Kritik stok (stok <= 3)
    critical_stock = (await session.execute(
        select(func.count(Product.id)).where(Product.stock <= 3, Product.stock >= 0)
    )).scalar() or 0

    # Sıfır stok
    out_of_stock = (await session.execute(
        select(func.count(Product.id)).where(Product.stock == 0)
    )).scalar() or 0

    # Kritik stok ürünleri listesi
    critical_products = (await session.execute(
        select(Product).where(Product.stock <= 5).order_by(Product.stock.asc()).limit(10)
    )).scalars().all()

    return {
        "total_revenue": float(total_revenue),
        "today_revenue": float(today_revenue),
        "week_revenue": float(week_revenue),
        "month_revenue": float(month_revenue),
        "total_orders": total_orders,
        "today_orders": today_orders,
        "week_orders": week_orders,
        "pending_orders": pending_orders,
        "eft_pending": eft_pending,
        "total_users": total_users,
        "critical_stock": critical_stock,
        "out_of_stock": out_of_stock,
        "critical_products": [
            {"id": str(p.id), "name": p.name, "stock": p.stock, "image_url": p.image, "brand": p.brand}
            for p in critical_products
        ]
    }


@router.get("/alerts")
async def get_alerts(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Sidebar badge verileri — hafif endpoint, sık çağrılır"""
    from sqlalchemy import or_
    pending_orders = (await session.execute(
        select(func.count(Order.id)).where(
            or_(Order.payment_status == "pending", Order.payment_status == "pending_transfer")
        )
    )).scalar() or 0

    eft_pending = (await session.execute(
        select(func.count(Order.id)).where(
            Order.payment_method == "bank_transfer",
            Order.payment_status != "paid"
        )
    )).scalar() or 0

    critical_stock = (await session.execute(
        select(func.count(Product.id)).where(Product.stock <= 3, Product.stock >= 0)
    )).scalar() or 0

    stock_notifications = (await session.execute(
        select(func.count(StockNotification.id))
    )).scalar() or 0

    return {
        "pending_orders": pending_orders,
        "eft_pending": eft_pending,
        "critical_stock": critical_stock,
        "stock_notifications": stock_notifications,
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


@router.get("/dashboard/chart")
async def get_chart_data(
    days: int = 7,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Son N gün günlük sipariş sayısı ve ciro"""
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import text as sql_text
    days = min(max(days, 1), 90)
    # INTERVAL içinde bind param PostgreSQL'de çalışmaz; Python tarafında hesapla
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")
    result = await session.execute(
        sql_text("""
            SELECT
                DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul') as day,
                COUNT(*) as order_count,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as revenue
            FROM orders
            WHERE created_at >= :cutoff
            GROUP BY day
            ORDER BY day ASC
        """).bindparams(cutoff=cutoff_str)
    )
    rows = result.fetchall()
    return [
        {"date": str(r[0]), "orders": r[1], "revenue": float(r[2])}
        for r in rows
    ]


# ─── Orders ───────────────────────────────────────────────────────────────────

@router.get("/orders")
async def get_all_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    date_range: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    from datetime import datetime, timezone, timedelta

    stmt = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())

    if status:
        stmt = stmt.where(Order.status == status)
    if payment_status:
        stmt = stmt.where(Order.payment_status == payment_status)

    # Tarih aralığı filtresi
    now = datetime.now(timezone.utc)
    if date_range == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        stmt = stmt.where(Order.created_at >= start)
    elif date_range == "week":
        start = now - timedelta(days=7)
        stmt = stmt.where(Order.created_at >= start)
    elif date_range == "month":
        start = now - timedelta(days=30)
        stmt = stmt.where(Order.created_at >= start)
    elif date_range == "custom" and date_from and date_to:
        try:
            df = datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc)
            dt = datetime.fromisoformat(date_to).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            stmt = stmt.where(Order.created_at >= df, Order.created_at <= dt)
        except ValueError:
            pass

    result = await session.execute(stmt)
    return [order_to_dict(o) for o in result.scalars().all()]


@router.post("/orders/bulk-status")
async def bulk_update_order_status(
    request: Request,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Toplu sipariş durum güncelleme"""
    data = await request.json()
    order_ids = data.get("order_ids", [])
    new_status = data.get("status")
    new_payment_status = data.get("payment_status")

    if not order_ids or not new_status:
        raise HTTPException(status_code=400, detail="order_ids ve status gerekli")

    updated = 0
    for oid in order_ids:
        try:
            result = await session.execute(select(Order).where(Order.id == uuid.UUID(oid)))
            order = result.scalar_one_or_none()
            if order:
                order.status = new_status
                if new_payment_status:
                    order.payment_status = new_payment_status
                updated += 1
        except (ValueError, Exception):
            continue

    await session.commit()
    return {"message": f"{updated} sipariş güncellendi", "updated": updated}


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: uuid.UUID,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    """Siparişi iptal et ve stok iade et"""
    from sqlalchemy.orm import selectinload
    result = await session.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    if order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Sipariş zaten iptal edilmiş")

    # Stok iade et
    for item in order.items:
        try:
            prod = await session.get(Product, uuid.UUID(item.product_id))
            if prod:
                prod.stock = (prod.stock or 0) + item.quantity
        except (ValueError, Exception):
            pass

    order.status = "cancelled"
    order.payment_status = "refunded" if order.payment_status == "paid" else "cancelled"
    await session.commit()
    return {"message": "Sipariş iptal edildi, stok iade edildi"}


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
    notifications = result.scalars().all()

    # Ürün bilgilerini toplu çek (N+1 sorgu yerine)
    product_ids = list({n.product_id for n in notifications})
    products_map = {}
    if product_ids:
        try:
            prod_result = await session.execute(
                select(Product).where(Product.slug.in_(product_ids))
            )
            for p in prod_result.scalars().all():
                products_map[p.slug] = p
            # UUID ile de dene
            uuid_ids = []
            for pid in product_ids:
                try:
                    uuid_ids.append(uuid.UUID(pid))
                except ValueError:
                    pass
            if uuid_ids:
                prod_result2 = await session.execute(
                    select(Product).where(Product.id.in_(uuid_ids))
                )
                for p in prod_result2.scalars().all():
                    products_map[str(p.id)] = p
        except Exception:
            pass

    return [
        {
            "id": str(n.id),
            "email": n.email,
            "product_id": n.product_id,
            "created_at": n.created_at.isoformat(),
            "product_name": products_map.get(n.product_id, {}).name if hasattr(products_map.get(n.product_id, {}), 'name') else "Bilinmeyen Ürün",
            "product_image": products_map.get(n.product_id, {}).image if hasattr(products_map.get(n.product_id, {}), 'image') else None,
            "product_stock": products_map.get(n.product_id, {}).stock if hasattr(products_map.get(n.product_id, {}), 'stock') else None,
        }
        for n in notifications
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

