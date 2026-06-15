"""
Cart Tracking API
POST /api/cart/track    — Public, terk edilmiş sepet kaydeder/günceller
POST /api/cart/{id}/recover — Public, sipariş tamamlandığında cart'ı "converted" yapar
GET  /api/cart/{id}     — Public, recover link için cart içeriği döner
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import Cart

router = APIRouter()


@router.post("/cart/track")
async def track_cart(request_data: dict, session: AsyncSession = Depends(get_db)):
    """
    Sepet değişikliğinde çağrılır.
    - Aynı session_id varsa güncelle, yoksa yeni oluştur.
    - items boş gelirse status='abandoned'.
    """
    session_id = request_data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id zorunlu")

    items     = request_data.get("items", [])
    subtotal  = request_data.get("subtotal", 0)
    email     = request_data.get("email")
    phone     = request_data.get("phone")
    name      = request_data.get("name")
    user_id   = request_data.get("user_id")
    now       = datetime.now(timezone.utc)

    # Mevcut aktif cart'ı bul
    result = await session.execute(
        select(Cart)
        .where(Cart.session_id == session_id)
        .where(Cart.status.in_(["active", "abandoned"]))
        .order_by(Cart.created_at.desc())
        .limit(1)
    )
    cart = result.scalar_one_or_none()

    if cart:
        # Güncelle
        if email:     cart.email    = email
        if phone:     cart.phone    = phone
        if name:      cart.name     = name
        if user_id:
            try:      cart.user_id  = uuid.UUID(user_id)
            except:   pass
        cart.items            = items
        cart.subtotal         = subtotal
        cart.status           = "abandoned" if not items else "active"
        cart.last_activity_at = now
    else:
        # Yeni oluştur
        uid = None
        if user_id:
            try: uid = uuid.UUID(user_id)
            except: pass
        cart = Cart(
            session_id        = session_id,
            user_id           = uid,
            email             = email,
            phone             = phone,
            name              = name,
            items             = items,
            subtotal          = subtotal,
            status            = "abandoned" if not items else "active",
            last_activity_at  = now,
            created_at        = now,
        )
        session.add(cart)

    await session.commit()
    await session.refresh(cart)
    return {"cart_id": str(cart.id), "ok": True}


@router.post("/cart/{cart_id}/recover")
async def recover_cart(cart_id: str, request_data: dict = None, session: AsyncSession = Depends(get_db)):
    """
    Ödeme tamamlandığında çağrılır → cart status = 'converted'
    """
    try:
        cid = uuid.UUID(cart_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz cart_id")

    cart = await session.get(Cart, cid)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart bulunamadı")

    cart.status = "converted"
    if request_data and request_data.get("order_id"):
        try:
            cart.converted_order_id = uuid.UUID(request_data["order_id"])
        except:
            pass

    await session.commit()
    return {"ok": True}


@router.get("/cart/{cart_id}")
async def get_cart(cart_id: str, session: AsyncSession = Depends(get_db)):
    """
    E-posta recover linki için cart içeriğini döndürür.
    /sepet?recover={cart_id} URL'sinde kullanılır.
    """
    try:
        cid = uuid.UUID(cart_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz cart_id")

    cart = await session.get(Cart, cid)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart bulunamadı")

    return {
        "cart_id":    str(cart.id),
        "session_id": cart.session_id,
        "items":      cart.items or [],
        "subtotal":   float(cart.subtotal or 0),
        "status":     cart.status,
        "email":      cart.email,
        "name":       cart.name,
    }
