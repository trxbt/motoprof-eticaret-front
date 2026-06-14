from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import uuid
import boto3
from botocore.client import Config
import os

from database import get_db
from models.models import User, Order, OrderItem, Product, Coupon
from deps import get_admin_user
from serializers import order_to_dict

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    # Total Revenue (Paid orders)
    revenue_query = await session.execute(
        select(func.sum(Order.total)).where(Order.payment_status == "paid")
    )
    total_revenue = revenue_query.scalar() or 0.0

    # Total Orders
    orders_query = await session.execute(select(func.count(Order.id)))
    total_orders = orders_query.scalar() or 0

    # Pending Transfer (EFT bekleyen)
    pending_query = await session.execute(
        select(func.count(Order.id)).where(Order.payment_status == "pending")
    )
    pending_orders = pending_query.scalar() or 0

    # Total Users
    users_query = await session.execute(select(func.count(User.id)))
    total_users = users_query.scalar() or 0

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_users": total_users
    }

@router.get("/orders")
async def get_all_orders(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import selectinload
    result = await session.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
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

@router.get("/products")
async def get_all_products(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Product).order_by(Product.created_at.desc()))
    return result.scalars().all()

@router.post("/products")
async def create_product(
    product_data: dict,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    # Dışarıdan resim linki veya diğer alanları alarak oluştur
    # Şimdilik sadece gerekli alanları kopyalayalım (S3 entegrasyonuna kadar basit)
    new_product = Product(
        name=product_data.get("name"),
        slug=product_data.get("slug", str(uuid.uuid4())[:8]), # Basit slug
        price=product_data.get("price", 0),
        category=product_data.get("category"),
        brand=product_data.get("brand"),
        stock=product_data.get("stock", 0),
        image_url=product_data.get("image_url", "")
    )
    session.add(new_product)
    await session.commit()
    return {"message": "Ürün eklendi"}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    try:
        # product_id string veya uuid olabilir, mevcut yapıya göre silelim
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

@router.get("/coupons")
async def get_all_coupons(
    admin_user: User = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db)
):
    result = await session.execute(select(Coupon))
    return result.scalars().all()

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

# S3 Client Setup
def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=os.environ.get('SERVICE_URL_S3', 'http://s3.motoprof.com.tr'),
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID', 'prjaXyp1JEOwKJQR'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY', 'tuDwiR0lhHW9BXgtmJKexHlglyuG53ci'),
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
    
    # Kova yoksa oluştur
    try:
        s3.head_bucket(Bucket=bucket_name)
    except Exception:
        s3.create_bucket(Bucket=bucket_name)
        # S3 Policy'yi public okuma yap
        import json
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }
        try:
            s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
        except:
            pass

    # Dosya adını güvenli hale getir ve unique yap
    ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    
    try:
        # SeaweedFS'e yükle
        s3.upload_fileobj(
            file.file, 
            bucket_name, 
            unique_filename,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Dosyanın public URL'sini döndür
        s3_url = os.environ.get('SERVICE_URL_S3', 'http://s3.motoprof.com.tr')
        public_url = f"{s3_url}/{bucket_name}/{unique_filename}"
        
        return {"url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resim yüklenemedi: {str(e)}")



from models.models import BankAccount, Category, Brand, StockNotification
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

@router.get("/users")
async def get_all_users(admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    from serializers import user_to_dict
    return [user_to_dict(u) for u in users]

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    user = await session.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Admin silinemez")
    await session.delete(user)
    await session.commit()
    return {"message": "Kullanıcı silindi"}

@router.get("/categories")
async def get_categories(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Category).order_by(Category.name.asc()))
    return [{"id": str(c.id), "name": c.name, "slug": c.slug} for c in result.scalars().all()]

@router.post("/categories")
async def add_category(request: Request, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    data = await request.json()
    cat = Category(name=data["name"], slug=data["slug"])
    session.add(cat)
    await session.commit()
    return {"message": "Kategori eklendi", "id": str(cat.id)}

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
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
async def add_brand(request: Request, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    data = await request.json()
    brand = Brand(name=data["name"], slug=data["slug"])
    session.add(brand)
    await session.commit()
    return {"message": "Marka eklendi", "id": str(brand.id)}

@router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    brand = await session.get(Brand, uuid.UUID(brand_id))
    if brand:
        await session.delete(brand)
        await session.commit()
    return {"message": "Marka silindi"}

@router.get("/banks")
async def get_banks(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(BankAccount))
    return [{"id": str(b.id), "bank_name": b.bank_name, "iban": b.iban, "account_holder": b.account_holder} for b in result.scalars().all()]

@router.post("/banks")
async def add_bank(request: Request, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    data = await request.json()
    bank = BankAccount(bank_name=data["bank_name"], iban=data["iban"], account_holder=data["account_holder"])
    session.add(bank)
    await session.commit()
    return {"message": "Banka eklendi", "id": str(bank.id)}

@router.delete("/banks/{bank_id}")
async def delete_bank(bank_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    bank = await session.get(BankAccount, uuid.UUID(bank_id))
    if bank:
        await session.delete(bank)
        await session.commit()
    return {"message": "Banka silindi"}

@router.get("/stock-notifications")
async def get_notifications(admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(StockNotification).order_by(StockNotification.created_at.desc()))
    return [{"id": str(n.id), "email": n.email, "product_id": n.product_id, "created_at": n.created_at.isoformat()} for n in result.scalars().all()]

@router.post("/notify-stock/{product_id}")
async def send_stock_notification(product_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(StockNotification).where(StockNotification.product_id == product_id))
    notifs = result.scalars().all()
    # Mocking the email send for now
    count = len(notifs)
    for n in notifs:
        await session.delete(n)
    await session.commit()
    return {"message": f"{count} kişiye stok bildirimi gönderildi ve listeden çıkarıldı."}

@router.get("/export/orders")
async def export_orders(admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Order).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(["Siparis ID", "Tarih", "Musteri", "Email", "Telefon", "Tutar", "Odeme", "Durum", "Adres", "Il"])
    
    for o in orders:
        writer.writerow([
            str(o.id),
            o.created_at.strftime("%Y-%m-%d %H:%M"),
            o.shipping_name or "-",
            o.guest_email or "-",
            o.shipping_phone or "-",
            float(o.total),
            o.payment_method,
            o.status,
            o.shipping_address or "-",
            o.shipping_city or "-"
        ])
    
    f.seek(0)
    response = StreamingResponse(iter([f.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=siparisler.csv"
    return response

