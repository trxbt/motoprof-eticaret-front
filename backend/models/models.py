import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from database import Base


class User(Base):
    __tablename__ = "users"
    id:            Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email:         Mapped[str]       = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str]       = mapped_column(String(255), nullable=False)
    name:          Mapped[str]       = mapped_column(String(255), nullable=False)
    role:          Mapped[str]       = mapped_column(String(50), default="user")
    cart_data:     Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    created_at:    Mapped[datetime]  = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    orders:    Mapped[List["Order"]]    = relationship(back_populates="user")
    wishlist:  Mapped[List["Wishlist"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    addresses: Mapped[List["Address"]]  = relationship(back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"
    id:             Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:           Mapped[str]           = mapped_column(String(500), nullable=False)
    slug:           Mapped[str]           = mapped_column(String(500), unique=True, nullable=False)
    description:    Mapped[Optional[str]] = mapped_column(Text)
    price:          Mapped[float]         = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    image:          Mapped[Optional[str]] = mapped_column(String(1000))
    images:         Mapped[Optional[list]]  = mapped_column(JSONB, default=list)
    brand:          Mapped[Optional[str]] = mapped_column(String(100))
    model:          Mapped[Optional[str]] = mapped_column(String(200))
    model_id:       Mapped[Optional[str]] = mapped_column(String(200))
    year_range:     Mapped[Optional[str]] = mapped_column(String(100))
    category:       Mapped[Optional[str]] = mapped_column(String(200))
    stock:          Mapped[int]           = mapped_column(Integer, default=0)
    sku:            Mapped[Optional[str]] = mapped_column(String(200))
    oem_kodu:       Mapped[Optional[str]] = mapped_column(String(200))
    is_featured:    Mapped[bool]          = mapped_column(Boolean, default=False)
    meta_title:     Mapped[Optional[str]] = mapped_column(String(500))
    meta_description: Mapped[Optional[str]] = mapped_column(String(1000))
    created_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Order(Base):
    __tablename__ = "orders"
    id:               Mapped[uuid.UUID]        = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:          Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    guest_email:      Mapped[Optional[str]]    = mapped_column(String(255))
    total:            Mapped[float]            = mapped_column(Numeric(10, 2), nullable=False)
    shipping_name:    Mapped[Optional[str]]    = mapped_column(String(255))
    shipping_phone:   Mapped[Optional[str]]    = mapped_column(String(50))
    shipping_address: Mapped[Optional[str]]    = mapped_column(Text)
    shipping_city:    Mapped[Optional[str]]    = mapped_column(String(100))
    status:           Mapped[str]              = mapped_column(String(50), default="pending")
    payment_method:   Mapped[str]              = mapped_column(String(50), default="iyzico")
    payment_status:   Mapped[str]              = mapped_column(String(50), default="pending")
    invoice:          Mapped[Optional[dict]]   = mapped_column(JSONB)
    coupon_code:      Mapped[Optional[str]]    = mapped_column(String(100))
    discount:         Mapped[Optional[float]]  = mapped_column(Numeric(10, 2))
    iyzico_token:     Mapped[Optional[str]]    = mapped_column(String(500))
    tracking_number: Mapped[Optional[str]]    = mapped_column(String(200))
    admin_note:      Mapped[Optional[str]]    = mapped_column(Text)
    error_code:      Mapped[Optional[str]]    = mapped_column(String(200))
    error_message:   Mapped[Optional[str]]    = mapped_column(Text)
    created_at:      Mapped[datetime]         = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user:  Mapped[Optional["User"]]  = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    id:            Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id:      Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id:    Mapped[Optional[str]] = mapped_column(String(500))
    product_name:  Mapped[Optional[str]] = mapped_column(String(500))
    product_image: Mapped[Optional[str]] = mapped_column(String(1000))
    price:         Mapped[float]         = mapped_column(Numeric(10, 2))
    quantity:      Mapped[int]           = mapped_column(Integer, default=1)
    order: Mapped["Order"] = relationship(back_populates="items")


class Wishlist(Base):
    __tablename__ = "wishlists"
    id:         Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:    Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id: Mapped[str]       = mapped_column(String(500), nullable=False)
    user: Mapped["User"] = relationship(back_populates="wishlist")


class StockNotification(Base):
    __tablename__ = "stock_notifications"
    id:         Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[str]       = mapped_column(String(500), nullable=False)
    email:      Mapped[str]       = mapped_column(String(255), nullable=False)
    notified:   Mapped[bool]      = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Address(Base):
    __tablename__ = "addresses"
    id:         Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:    Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title:      Mapped[str]           = mapped_column(String(100), nullable=False)
    name:       Mapped[str]           = mapped_column(String(255), nullable=False)
    phone:      Mapped[str]           = mapped_column(String(50), nullable=False)
    address:    Mapped[str]           = mapped_column(Text, nullable=False)
    city:       Mapped[str]           = mapped_column(String(100), nullable=False)
    district:   Mapped[Optional[str]] = mapped_column(String(100))
    is_default: Mapped[bool]          = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user: Mapped["User"] = relationship(back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"
    id:   Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str]       = mapped_column(String(200), nullable=False)
    slug: Mapped[str]       = mapped_column(String(200), unique=True, nullable=False)


class Brand(Base):
    __tablename__ = "brands"
    id:    Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:  Mapped[str]           = mapped_column(String(200), nullable=False)
    slug:  Mapped[str]           = mapped_column(String(200), unique=True, nullable=False)
    image: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)


class Coupon(Base):
    __tablename__ = "coupons"
    id:          Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code:        Mapped[str]           = mapped_column(String(100), unique=True, nullable=False)
    type:        Mapped[str]           = mapped_column(String(50), nullable=False)
    value:       Mapped[float]         = mapped_column(Numeric(10, 2), nullable=False)
    min_order:   Mapped[float]         = mapped_column(Numeric(10, 2), default=0)
    description: Mapped[Optional[str]] = mapped_column(Text)
    active:      Mapped[bool]          = mapped_column(Boolean, default=True)


class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id:             Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_name:      Mapped[str]           = mapped_column(String(100), nullable=False)
    account_holder: Mapped[str]           = mapped_column(String(255), nullable=False)
    iban:           Mapped[str]           = mapped_column(String(50), nullable=False)
    branch_name:    Mapped[Optional[str]] = mapped_column(String(100))
    account_number: Mapped[Optional[str]] = mapped_column(String(50))
    is_active:      Mapped[bool]          = mapped_column(Boolean, default=True)
    created_at:     Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Slider(Base):
    __tablename__ = "sliders"
    id:            Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title:         Mapped[Optional[str]] = mapped_column(String(255))
    subtitle:      Mapped[Optional[str]] = mapped_column(String(500))
    image:         Mapped[str]           = mapped_column(String(1000), nullable=False)
    link:          Mapped[Optional[str]] = mapped_column(String(500))
    button_text:   Mapped[Optional[str]] = mapped_column(String(100), default="İncele")
    display_order: Mapped[int]           = mapped_column(Integer, default=0)
    active:        Mapped[bool]          = mapped_column(Boolean, default=True)
    created_at:    Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class MotorcycleModel(Base):
    __tablename__ = "motorcycle_models"
    id:         Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:       Mapped[str]           = mapped_column(String(200), nullable=False)
    slug:       Mapped[str]           = mapped_column(String(200), nullable=False)
    brand:      Mapped[str]           = mapped_column(String(100), nullable=False)
    year_range: Mapped[Optional[str]] = mapped_column(String(100))
    image:      Mapped[Optional[str]] = mapped_column(String(1000))
    created_at: Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SiteSettings(Base):
    __tablename__ = "site_settings"
    id:               Mapped[int]            = mapped_column(Integer, primary_key=True, default=1)
    site_name:        Mapped[Optional[str]]  = mapped_column(String(200))
    logo_url:         Mapped[Optional[str]]  = mapped_column(String(1000))
    favicon_url:      Mapped[Optional[str]]  = mapped_column(String(1000))
    seo_title:        Mapped[Optional[str]]  = mapped_column(String(200))
    seo_description:  Mapped[Optional[str]]  = mapped_column(Text)
    seo_keywords:     Mapped[Optional[str]]  = mapped_column(Text)
    seo_og_title:     Mapped[Optional[str]]  = mapped_column(String(200))
    seo_og_description: Mapped[Optional[str]] = mapped_column(Text)
    seo_og_image:     Mapped[Optional[str]]  = mapped_column(String(1000))
    seo_canonical:    Mapped[Optional[str]]  = mapped_column(String(500))
    updated_at:       Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Invoice(Base):
    __tablename__ = "invoices"
    id:               Mapped[uuid.UUID]     = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id:         Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)
    invoice_no:       Mapped[str]           = mapped_column(String(100), nullable=False)
    invoice_date:     Mapped[Optional[str]] = mapped_column(String(20))
    recipient_name:   Mapped[str]           = mapped_column(String(255), nullable=False)
    recipient_tax_id: Mapped[Optional[str]] = mapped_column(String(50))
    recipient_address:Mapped[Optional[str]] = mapped_column(Text)
    recipient_city:   Mapped[Optional[str]] = mapped_column(String(100))
    recipient_phone:  Mapped[Optional[str]] = mapped_column(String(50))
    recipient_email:  Mapped[Optional[str]] = mapped_column(String(255))
    lines:            Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    subtotal:         Mapped[float]         = mapped_column(Numeric(10, 2), nullable=False)
    vat_rate:         Mapped[Optional[float]] = mapped_column(Numeric(5, 2), default=20.0)
    vat_amount:       Mapped[float]         = mapped_column(Numeric(10, 2), nullable=False)
    total:            Mapped[float]         = mapped_column(Numeric(10, 2), nullable=False)
    notes:            Mapped[Optional[str]] = mapped_column(Text)
    status:           Mapped[Optional[str]] = mapped_column(String(50), default="draft")
    gib_uuid:         Mapped[Optional[str]] = mapped_column(String(200))
    pdf_url:          Mapped[Optional[str]] = mapped_column(String(1000))
    created_at:       Mapped[datetime]      = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

