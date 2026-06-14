from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
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

