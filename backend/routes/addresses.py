import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import Address
from schemas.schemas import AddressCreate, AddressUpdate
from serializers import address_to_dict
from deps import get_current_user

router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.get("")
async def list_addresses(user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    result = await session.scalars(
        select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc(), Address.created_at)
    )
    return [address_to_dict(a) for a in result.all()]


@router.post("", status_code=201)
async def create_address(data: AddressCreate, user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    if data.is_default:
        await _clear_default(user.id, session)
    addr = Address(user_id=user.id, **data.model_dump())
    session.add(addr)
    await session.commit()
    await session.refresh(addr)
    return address_to_dict(addr)


@router.put("/{address_id}")
async def update_address(address_id: str, data: AddressUpdate, user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    addr = await _get_owned(address_id, user.id, session)
    if data.is_default:
        await _clear_default(user.id, session)
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(addr, field, val)
    await session.commit()
    await session.refresh(addr)
    return address_to_dict(addr)


@router.delete("/{address_id}", status_code=204)
async def delete_address(address_id: str, user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    addr = await _get_owned(address_id, user.id, session)
    await session.delete(addr)
    await session.commit()


@router.patch("/{address_id}/default")
async def set_default(address_id: str, user=Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    await _clear_default(user.id, session)
    addr = await _get_owned(address_id, user.id, session)
    addr.is_default = True
    await session.commit()
    return address_to_dict(addr)


# ─── Helpers ─────────────────────────────────────────────────────────────────
async def _get_owned(address_id: str, user_id: uuid.UUID, session: AsyncSession) -> Address:
    try:
        aid = uuid.UUID(address_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Adres bulunamadı")
    addr = await session.scalar(select(Address).where(Address.id == aid, Address.user_id == user_id))
    if not addr:
        raise HTTPException(status_code=404, detail="Adres bulunamadı")
    return addr


async def _clear_default(user_id: uuid.UUID, session: AsyncSession):
    addrs = await session.scalars(select(Address).where(Address.user_id == user_id, Address.is_default == True))
    for a in addrs.all():
        a.is_default = False
