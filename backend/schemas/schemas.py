from pydantic import BaseModel, EmailStr
from typing import Optional, List


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CartSyncRequest(BaseModel):
    cart_data: list


class OrderItemIn(BaseModel):
    product_id: str
    product_name: str
    product_image: Optional[str] = None
    price: float
    quantity: int


class InvoiceInfo(BaseModel):
    type: Optional[str] = None
    company_name: Optional[str] = None
    tax_number: Optional[str] = None
    tax_office: Optional[str] = None
    address: Optional[str] = None


class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    total: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    guest_email: Optional[str] = None
    invoice: Optional[InvoiceInfo] = None
    coupon_code: Optional[str] = None
    discount: Optional[float] = None


class CouponValidate(BaseModel):
    code: str
    cart_total: float


class WishlistToggle(BaseModel):
    product_id: str


class AddressCreate(BaseModel):
    title:    str
    name:     str
    phone:    str
    address:  str
    city:     str
    district: Optional[str] = None
    is_default: bool = False


class AddressUpdate(BaseModel):
    title:    Optional[str] = None
    name:     Optional[str] = None
    phone:    Optional[str] = None
    address:  Optional[str] = None
    city:     Optional[str] = None
    district: Optional[str] = None
    is_default: Optional[bool] = None


class StockNotifyRequest(BaseModel):
    product_id: str
    email: str
