from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import Wishlist
from schemas.schemas import WishlistToggle
from deps import get_current_user

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("")
async def get_wishlist(user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    result = await session.scalars(select(Wishlist.product_id).where(Wishlist.user_id == user.id))
    return {"product_ids": list(result.all())}


@router.post("/toggle")
async def toggle_wishlist(data: WishlistToggle, user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    existing = await session.scalar(
        select(Wishlist).where(Wishlist.user_id == user.id, Wishlist.product_id == data.product_id)
    )
    if existing:
        await session.delete(existing)
        await session.commit()
        return {"action": "removed"}
    session.add(Wishlist(user_id=user.id, product_id=data.product_id))
    await session.commit()
    return {"action": "added"}
