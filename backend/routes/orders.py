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
