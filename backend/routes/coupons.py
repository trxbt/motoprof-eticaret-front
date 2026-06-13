from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import Coupon
from schemas.schemas import CouponValidate

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.post("/validate")
async def validate_coupon(data: CouponValidate, session: AsyncSession = Depends(get_db)):
    coupon = await session.scalar(
        select(Coupon).where(Coupon.code == data.code.upper().strip(), Coupon.active == True)
    )
    if not coupon:
        raise HTTPException(status_code=404, detail="Geçersiz veya kullanılmış kupon kodu")
    if data.cart_total < float(coupon.min_order):
        raise HTTPException(status_code=400, detail=f"Bu kupon için minimum sipariş tutarı {coupon.min_order:.0f}₺")
    discount = (float(coupon.value) if coupon.type == "fixed"
                else round(data.cart_total * float(coupon.value) / 100, 2))
    discount = min(discount, data.cart_total)
    return {
        "code": coupon.code, "type": coupon.type, "value": float(coupon.value),
        "discount": discount, "description": coupon.description,
    }
