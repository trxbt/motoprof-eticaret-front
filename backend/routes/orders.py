import uuid
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import get_db
from models.models import Order, OrderItem
from schemas.schemas import OrderCreate
from serializers import order_to_dict
from deps import get_current_user, get_optional_user

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("")
async def create_order(data: OrderCreate, request: Request, session: AsyncSession = Depends(get_db)):
    user = await get_optional_user(request, session)
    if not user and not data.guest_email:
        raise HTTPException(status_code=400, detail="Misafir alışverişi için e-posta gerekli")
    order = Order(
        user_id=user.id if user else None,
        guest_email=data.guest_email if not user else None,
        total=data.total,
        shipping_name=data.shipping_name,
        shipping_phone=data.shipping_phone,
        shipping_address=data.shipping_address,
        shipping_city=data.shipping_city,
        invoice=data.invoice.model_dump() if data.invoice else None,
        coupon_code=data.coupon_code,
        discount=data.discount,
    )
    session.add(order)
    await session.flush()
    for item in data.items:
        session.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_image=item.product_image,
            price=item.price,
            quantity=item.quantity,
        ))
    await session.commit()
    order_loaded = await session.scalar(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return {"message": "Sipariş oluşturuldu", "order": order_to_dict(order_loaded)}


@router.get("")
async def list_orders(user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    orders = await session.scalars(
        select(Order).where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return [order_to_dict(o) for o in orders.all()]


@router.get("/{order_id}")
async def get_order(order_id: str, request: Request, session: AsyncSession = Depends(get_db)):
    try:
        oid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    order = await session.scalar(
        select(Order).where(Order.id == oid).options(selectinload(Order.items))
    )
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
        
    if order.user_id:
        user = await get_optional_user(request, session)
        if not user or user.id != order.user_id:
            raise HTTPException(status_code=403, detail="Bu siparişe erişim izniniz yok")
            
    return order_to_dict(order)
