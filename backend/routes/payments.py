import json
import os
import uuid
import asyncio
import iyzipay
from functools import partial
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import get_db
from models.models import Order, OrderItem
from schemas.schemas import OrderCreate
from serializers import order_to_dict
from deps import get_optional_user

router = APIRouter(prefix="/payments", tags=["payments"])

IYZICO_OPTIONS = {
    "api_key":    os.environ.get("IYZICO_API_KEY"),
    "secret_key": os.environ.get("IYZICO_SECRET_KEY"),
    "base_url":   os.environ.get("IYZICO_BASE_URL", "sandbox-api.iyzipay.com"),
}
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://motoprof-preview.preview.emergentagent.com")


# ─── Sync wrappers (iyzipay is sync) ─────────────────────────────────────────
def _iyzico_initialize(request_data: dict) -> dict:
    resp = iyzipay.CheckoutFormInitialize().create(request_data, IYZICO_OPTIONS)
    return json.loads(resp.read().decode("utf-8"))


def _iyzico_retrieve(token: str) -> dict:
    resp = iyzipay.CheckoutForm().retrieve({"token": token}, IYZICO_OPTIONS)
    return json.loads(resp.read().decode("utf-8"))


def _fmt_phone(phone: str) -> str:
    """Format Turkish phone to +90XXXXXXXXXX."""
    digits = "".join(c for c in phone if c.isdigit())
    if digits.startswith("90") and len(digits) == 12:
        return f"+{digits}"
    if digits.startswith("0") and len(digits) == 11:
        return f"+9{digits}"
    if len(digits) == 10:
        return f"+90{digits}"
    return "+905000000000"


def _split_name(full_name: str):
    parts = full_name.strip().split(maxsplit=1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return parts[0], parts[0]


# ─── Initialize: create order + start iyzico CF ──────────────────────────────
@router.post("/iyzico/initialize")
async def initialize_iyzico(
    data: OrderCreate,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    user = await get_optional_user(request, session)
    if not user and not data.guest_email:
        raise HTTPException(status_code=400, detail="Misafir alışverişi için e-posta gerekli")

    # Create order with pending payment_status
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
        payment_status="pending",
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
    await session.flush()

    # Build iyzico request
    buyer_email = user.email if user else data.guest_email
    buyer_id    = str(user.id) if user else data.guest_email
    fname, lname = _split_name(data.shipping_name)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "127.0.0.1").split(",")[0].strip()

    # Price = sum of basket items (before discount); paidPrice = final total
    items_total = round(sum(item.price * item.quantity for item in data.items), 2)
    paid_price  = round(float(data.total), 2)

    # Basket items – each item line price = unit_price * qty
    basket_items = [
        {
            "id":        item.product_id or str(uuid.uuid4()),
            "name":      (item.product_name or "Ürün")[:100],
            "category1": "Motosiklet Yedek Parça",
            "itemType":  "PHYSICAL",
            "price":     f"{round(item.price * item.quantity, 2):.2f}",
        }
        for item in data.items
    ]

    iyzico_request = {
        "locale":         "tr",
        "conversationId": str(order.id),
        "price":          f"{items_total:.2f}",
        "paidPrice":      f"{paid_price:.2f}",
        "currency":       "TRY",
        "basketId":       str(order.id),
        "paymentGroup":   "PRODUCT",
        "callbackUrl":    f"{FRONTEND_URL}/api/payments/iyzico/callback",
        "buyer": {
            "id":                  buyer_id,
            "name":                fname,
            "surname":             lname,
            "email":               buyer_email,
            "identityNumber":      "11111111111",
            "registrationAddress": data.shipping_address,
            "city":                data.shipping_city,
            "country":             "Turkey",
            "gsmNumber":           _fmt_phone(data.shipping_phone),
            "ip":                  client_ip,
        },
        "shippingAddress": {
            "contactName": data.shipping_name,
            "city":        data.shipping_city,
            "country":     "Turkey",
            "address":     data.shipping_address,
        },
        "billingAddress": {
            "contactName": data.shipping_name,
            "city":        data.shipping_city,
            "country":     "Turkey",
            "address":     data.shipping_address,
        },
        "basketItems": basket_items,
    }

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, partial(_iyzico_initialize, iyzico_request))

    if result.get("status") != "success":
        await session.rollback()
        raise HTTPException(status_code=400, detail=result.get("errorMessage", "iyzico ödeme başlatılamadı"))

    order.iyzico_token = result["token"]
    await session.commit()

    return {
        "order_id":      str(order.id),
        "token":         result["token"],
        "paymentPageUrl": result.get("paymentPageUrl"),
    }


# ─── Callback: iyzico POSTs token here after payment ────────────────────────
@router.post("/iyzico/callback", include_in_schema=False)
async def iyzico_callback(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    form = await request.form()
    token = form.get("token")

    if not token:
        return Response("Missing token", status_code=400)

    order = await session.scalar(
        select(Order).where(Order.iyzico_token == token).options(selectinload(Order.items))
    )
    if not order:
        return Response(content=f'<html><head><meta http-equiv="refresh" content="0;url={FRONTEND_URL}/odeme-sonuc?status=error" /></head><body>Redirecting...</body></html>', media_type="text/html")

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, partial(_iyzico_retrieve, token))

    status     = result.get("status", "failure")
    payment_id = result.get("paymentId")

    if status == "success":
        order.payment_status = "paid"
        order.status = "processing"
    else:
        order.payment_status = "failed"

    # Store paymentId in invoice JSON field
    invoice_data = order.invoice or {}
    invoice_data["iyzico_payment_id"] = payment_id
    invoice_data["iyzico_status"]     = status
    order.invoice = invoice_data

    await session.commit()

    order_id = str(order.id)
    if status == "success":
        redirect_url = f"{FRONTEND_URL}/odeme-sonuc?status=success&orderId={order_id}"
    else:
        error_msg = result.get("errorMessage") or result.get("errorCode") or "Ödeme başarısız"
        redirect_url = f"{FRONTEND_URL}/odeme-sonuc?status=failed&orderId={order_id}&msg={error_msg}"

    html = f'<html><head><meta http-equiv="refresh" content="0;url={redirect_url}" /></head><body>Yönlendiriliyor...</body></html>'
    return Response(content=html, media_type="text/html")
