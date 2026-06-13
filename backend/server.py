from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, relationship, selectinload
from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, Text, ForeignKey, select, func, and_, or_
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.dialects.postgresql import insert as pg_insert
import jwt, os, logging, uuid, re
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")
JWT_SECRET   = os.environ.get("JWT_SECRET")
JWT_EXP_DAYS = 30
ADMIN_EMAIL  = os.environ.get("ADMIN_EMAIL", "admin@motoprof.com")
ADMIN_PASS   = os.environ.get("ADMIN_PASSWORD", "Admin123!")

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── SQLAlchemy Setup ─────────────────────────────────────────────────────────
engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# ─── Models ───────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id:            Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email:         Mapped[str]       = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str]       = mapped_column(String(255), nullable=False)
    name:          Mapped[str]       = mapped_column(String(255), nullable=False)
    role:          Mapped[str]       = mapped_column(String(50), default="user")
    created_at:    Mapped[datetime]  = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    orders:   Mapped[List["Order"]]    = relationship(back_populates="user")
    wishlist: Mapped[List["Wishlist"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    id:             Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:           Mapped[str]       = mapped_column(String(500), nullable=False)
    slug:           Mapped[str]       = mapped_column(String(500), unique=True, nullable=False)
    description:    Mapped[Optional[str]] = mapped_column(Text)
    price:          Mapped[float]     = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    image:          Mapped[Optional[str]] = mapped_column(String(1000))
    images:         Mapped[Optional[list]]  = mapped_column(JSONB, default=list)
    brand:          Mapped[Optional[str]] = mapped_column(String(100))
    model:          Mapped[Optional[str]] = mapped_column(String(200))
    model_id:       Mapped[Optional[str]] = mapped_column(String(200))
    year_range:     Mapped[Optional[str]] = mapped_column(String(100))
    category:       Mapped[Optional[str]] = mapped_column(String(200))
    stock:          Mapped[int]       = mapped_column(Integer, default=0)
    sku:            Mapped[Optional[str]] = mapped_column(String(200))
    oem_kodu:       Mapped[Optional[str]] = mapped_column(String(200))
    is_featured:    Mapped[bool]      = mapped_column(Boolean, default=False)
    created_at:     Mapped[datetime]  = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Order(Base):
    __tablename__ = "orders"
    id:               Mapped[uuid.UUID]    = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:          Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    guest_email:      Mapped[Optional[str]]  = mapped_column(String(255))
    total:            Mapped[float]          = mapped_column(Numeric(10, 2), nullable=False)
    shipping_name:    Mapped[Optional[str]]  = mapped_column(String(255))
    shipping_phone:   Mapped[Optional[str]]  = mapped_column(String(50))
    shipping_address: Mapped[Optional[str]]  = mapped_column(Text)
    shipping_city:    Mapped[Optional[str]]  = mapped_column(String(100))
    status:           Mapped[str]            = mapped_column(String(50), default="pending")
    payment_status:   Mapped[str]            = mapped_column(String(50), default="mock_paid")
    invoice:          Mapped[Optional[dict]] = mapped_column(JSONB)
    coupon_code:      Mapped[Optional[str]]  = mapped_column(String(100))
    discount:         Mapped[Optional[float]]= mapped_column(Numeric(10, 2))
    created_at:       Mapped[datetime]       = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user:  Mapped[Optional["User"]]    = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]]   = relationship(back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id:            Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id:      Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id:    Mapped[Optional[str]] = mapped_column(String(500))
    product_name:  Mapped[Optional[str]] = mapped_column(String(500))
    product_image: Mapped[Optional[str]] = mapped_column(String(1000))
    price:         Mapped[float]     = mapped_column(Numeric(10, 2))
    quantity:      Mapped[int]       = mapped_column(Integer, default=1)
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

class Coupon(Base):
    __tablename__ = "coupons"
    id:          Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code:        Mapped[str]       = mapped_column(String(100), unique=True, nullable=False)
    type:        Mapped[str]       = mapped_column(String(50), nullable=False)
    value:       Mapped[float]     = mapped_column(Numeric(10, 2), nullable=False)
    min_order:   Mapped[float]     = mapped_column(Numeric(10, 2), default=0)
    description: Mapped[Optional[str]] = mapped_column(Text)
    active:      Mapped[bool]      = mapped_column(Boolean, default=True)

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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

class StockNotifyRequest(BaseModel):
    product_id: str
    email: str

# ─── Auth Utils ───────────────────────────────────────────────────────────────
def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw, hashed)

def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS)
    return jwt.encode({"user_id": user_id, "exp": exp}, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request, session: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Oturum süresi doldu, tekrar giriş yapın")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    user = await session.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    return user

async def get_optional_user(request: Request, session: AsyncSession = Depends(get_db)) -> Optional[User]:
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            return None
        return await session.get(User, uuid.UUID(user_id))
    except Exception:
        return None

# ─── Serializers ──────────────────────────────────────────────────────────────
def user_to_dict(u: User) -> dict:
    return {"id": str(u.id), "email": u.email, "name": u.name, "role": u.role,
            "created_at": u.created_at.isoformat()}

def product_to_dict(p: Product) -> dict:
    imgs = p.images if p.images else ([p.image] if p.image else [])
    return {
        "id": str(p.id), "name": p.name, "slug": p.slug, "description": p.description,
        "price": float(p.price), "original_price": float(p.original_price) if p.original_price else None,
        "image": p.image, "images": imgs, "brand": p.brand, "model": p.model,
        "model_id": p.model_id, "year_range": p.year_range, "category": p.category,
        "stock": p.stock, "sku": p.sku, "oem_kodu": p.oem_kodu, "is_featured": p.is_featured,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }

def order_to_dict(o: Order) -> dict:
    return {
        "id": str(o.id), "user_id": str(o.user_id) if o.user_id else None,
        "guest_email": o.guest_email, "total": float(o.total),
        "shipping_name": o.shipping_name, "shipping_phone": o.shipping_phone,
        "shipping_address": o.shipping_address, "shipping_city": o.shipping_city,
        "status": o.status, "payment_status": o.payment_status,
        "invoice": o.invoice, "coupon_code": o.coupon_code,
        "discount": float(o.discount) if o.discount else None,
        "items": [{"id": str(i.id), "product_id": i.product_id, "product_name": i.product_name,
                   "product_image": i.product_image, "price": float(i.price), "quantity": i.quantity}
                  for i in o.items],
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }

# ─── Seed Data ────────────────────────────────────────────────────────────────
GALLERY_POOL = [
    "https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80",
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
    "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80",
    "https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80",
]

DEMO_COUPONS = [
    {"code": "MOTO10",  "type": "percent", "value": 10, "min_order": 200, "description": "Tüm alışverişlerde %10 indirim (min 200₺)", "active": True},
    {"code": "ILKALIS", "type": "percent", "value": 15, "min_order": 0,   "description": "İlk alışverişinize özel %15 indirim",      "active": True},
    {"code": "KARGO50", "type": "fixed",   "value": 50, "min_order": 500, "description": "500₺ ve üzeri siparişlerde 50₺ indirim",  "active": True},
    {"code": "WELCOME", "type": "percent", "value": 10, "min_order": 0,   "description": "Hoş geldin kuponu %10 indirim",            "active": True},
]

DEMO_PRODUCTS = [
    {"name":"Honda PCX 125 Ön Fren Balata Takımı (15-17)","slug":"honda-pcx125-1517-on-fren-balata","description":"Honda PCX 125 (2015-2017) modelleri için orijinal kalitede ön fren balata takımı. Yüksek ısı direnci ve uzun ömürlü formülü ile güvenli frenleme sağlar.","price":245.00,"original_price":289.00,"image":"https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1517","year_range":"2015-2017","category":"Fren Sistemi","stock":15,"sku":"HP-PCX-1517-FB001","oem_kodu":"06455-KZV-J01","is_featured":True},
    {"name":"Honda PCX 125 Hava Filtresi (15-17)","slug":"honda-pcx125-1517-hava-filtresi","description":"Honda PCX 125 (2015-2017) için yüksek performanslı hava filtresi. Motoru korur ve yakıt verimliliğini artırır.","price":189.00,"original_price":None,"image":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1517","year_range":"2015-2017","category":"Filtreler","stock":22,"sku":"HP-PCX-1517-HF001","oem_kodu":"17211-K97-V01","is_featured":False},
    {"name":"Honda PCX 125 Motor Yağı Filtresi (15-17)","slug":"honda-pcx125-1517-yag-filtresi","description":"Motor yağını temiz tutan premium kalite yağ filtresi. Motoru korozyon ve aşınmadan korur.","price":85.00,"original_price":None,"image":"https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1517","year_range":"2015-2017","category":"Filtreler","stock":45,"sku":"HP-PCX-1517-YF001","oem_kodu":"15412-MJ0-003","is_featured":False},
    {"name":"Honda PCX 125 Sağ Sol Ayna Seti (15-17)","slug":"honda-pcx125-1517-ayna-seti","description":"Honda PCX 125 (2015-2017) için krom kaplama ayna seti. Titreşim önleyici yapısıyla net görüş sağlar.","price":320.00,"original_price":380.00,"image":"https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1517","year_range":"2015-2017","category":"Aksesuar","stock":8,"sku":"HP-PCX-1517-AY001","oem_kodu":"88110-KZV-J01","is_featured":True},
    {"name":"Honda PCX 125 Vites Kayışı (18-20)","slug":"honda-pcx125-1820-vites-kayisi","description":"Honda PCX 125 (2018-2020) için orijinal kalite aktarma kayışı. Uzun ömürlü kevlar takviyeli yapı.","price":425.00,"original_price":495.00,"image":"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1820","year_range":"2018-2020","category":"Motor & Şanzıman","stock":12,"sku":"HP-PCX-1820-VK001","oem_kodu":"23100-K35-V01","is_featured":True},
    {"name":"Honda PCX 125 Ön Far LED Set (18-20)","slug":"honda-pcx125-1820-on-far-led","description":"Honda PCX 125 (2018-2020) için yüksek ışık çıkışlı LED far seti. Kolay montaj, plug-and-play.","price":680.00,"original_price":None,"image":"https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1820","year_range":"2018-2020","category":"Elektrik & Aydınlatma","stock":6,"sku":"HP-PCX-1820-FL001","oem_kodu":"33100-K35-V01","is_featured":False},
    {"name":"Honda PCX 125 Kaporta Koruyucu Set (18-20)","slug":"honda-pcx125-1820-kaporta-koruyucu","description":"Honda PCX 125 (2018-2020) kaporta koruyucu set. Karbon fiber görünümlü ABS plastik.","price":180.00,"original_price":220.00,"image":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-1820","year_range":"2018-2020","category":"Kaporta & Plastik","stock":10,"sku":"HP-PCX-1820-KK001","oem_kodu":"64300-K35-V01","is_featured":False},
    {"name":"Honda PCX 125 ABS Fren Seti (21-24)","slug":"honda-pcx125-2124-abs-fren","description":"Honda PCX 125 (2021-2024) ABS versiyonu için komple fren seti. Gelişmiş fren performansı.","price":890.00,"original_price":1050.00,"image":"https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80","brand":"HONDA","model":"PCX 125","model_id":"honda-pcx125-2124","year_range":"2021-2024","category":"Fren Sistemi","stock":5,"sku":"HP-PCX-2124-AB001","oem_kodu":"45100-K3A-J01","is_featured":True},
    {"name":"Honda DIO 110 Hava Filtresi (21-24)","slug":"honda-dio110-2124-hava-filtresi","description":"Honda DIO 110 (2021-2024) için orijinal kalite hava filtresi. Optimum motor performansı için.","price":145.00,"original_price":None,"image":"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80","brand":"HONDA","model":"DIO 110","model_id":"honda-dio110-2124","year_range":"2021-2024","category":"Filtreler","stock":30,"sku":"HD-DIO-2124-HF001","oem_kodu":"17210-K2E-V01","is_featured":False},
    {"name":"Honda CBF 150 Zincir Dişli Seti","slug":"honda-cbf150-zincir-disli","description":"Honda CBF 150 için dayanıklı zincir ve dişli seti. O-ring zinciri ile uzun ömür.","price":650.00,"original_price":750.00,"image":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","brand":"HONDA","model":"CBF 150","model_id":"honda-cbf150","year_range":"","category":"Aktarma Organları","stock":10,"sku":"HC-CBF-150-ZD001","oem_kodu":"40530-KPR-900","is_featured":True},
    {"name":"Honda FORZA 250 Arka Amortisör","slug":"honda-forza250-arka-amortisoru","description":"Honda FORZA 250 için yüksek performanslı ayarlanabilir arka amortisör. Konfor ve performansı birleştirir.","price":2850.00,"original_price":3200.00,"image":"https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80","brand":"HONDA","model":"FORZA 250","model_id":"honda-forza250","year_range":"","category":"Süspansiyon","stock":4,"sku":"HF-FRZ-250-AA001","oem_kodu":"52400-MKA-J01","is_featured":True},
    {"name":"Honda ACTIVA 125 Karbüratör Sifonu","slug":"honda-activa125-karburator-sifonu","description":"Honda ACTIVA 125 için karbüratör bakım ve temizleme seti. Optimum yakıt-hava karışımı için.","price":185.00,"original_price":None,"image":"https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80","brand":"HONDA","model":"ACTIVA 125","model_id":"honda-activa125","year_range":"","category":"Yakıt Sistemi","stock":22,"sku":"HA-ACT-125-KS001","oem_kodu":"16100-KZL-J31","is_featured":False},
    {"name":"Yamaha NMAX 125 Ön Fren Diski","slug":"yamaha-nmax125-on-fren-diski","description":"Yamaha NMAX 125 için premium kalite ön fren diski. Yüksek ısı yayma kapasitesi ile güvenli frenleme.","price":480.00,"original_price":560.00,"image":"https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80","brand":"YAMAHA","model":"NMAX 125","model_id":"yamaha-nmax125","year_range":"","category":"Fren Sistemi","stock":18,"sku":"YN-NMX-125-FD001","oem_kodu":"3D8-F5820-00","is_featured":True},
    {"name":"Yamaha NMAX 125 Buji Takımı","slug":"yamaha-nmax125-buji","description":"Yamaha NMAX 125 için iridyum uçlu buji takımı. Daha güçlü ateşleme, daha az yakıt tüketimi.","price":95.00,"original_price":None,"image":"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80","brand":"YAMAHA","model":"NMAX 125","model_id":"yamaha-nmax125","year_range":"","category":"Motor & Şanzıman","stock":55,"sku":"YN-NMX-125-BJ001","oem_kodu":"BPR5ES-11","is_featured":False},
    {"name":"Yamaha NMAX 155 Akü 12V 7AH","slug":"yamaha-nmax155-aku","description":"Yamaha NMAX 155 için bakımsız 12V 7AH motosiklet aküsü. Soğuk havalarda güvenilir çalışma.","price":1250.00,"original_price":None,"image":"https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80","brand":"YAMAHA","model":"NMAX 155","model_id":"yamaha-nmax155","year_range":"","category":"Elektrik & Aydınlatma","stock":9,"sku":"YN-NMX-155-AK001","oem_kodu":"GM7Z-3B","is_featured":False},
    {"name":"Yamaha NMAX 155 Spor Egzoz","slug":"yamaha-nmax155-spor-egzoz","description":"Yamaha NMAX 155 için spor görünümlü paslanmaz çelik egzoz. Daha güçlü ses ve görünüm.","price":1850.00,"original_price":2100.00,"image":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","brand":"YAMAHA","model":"NMAX 155","model_id":"yamaha-nmax155","year_range":"","category":"Egzoz","stock":6,"sku":"YN-NMX-155-EG001","oem_kodu":"2DP-14610-00","is_featured":True},
    {"name":"Yamaha XMAX 250 Ön Amortisör Seti","slug":"yamaha-xmax250-on-amortisoru","description":"Yamaha XMAX 250 için ayarlanabilir yüksek performanslı ön amortisör seti. Spor ve konfor dengesi.","price":3850.00,"original_price":4200.00,"image":"https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80","brand":"YAMAHA","model":"XMAX 250","model_id":"yamaha-xmax250","year_range":"","category":"Süspansiyon","stock":3,"sku":"YX-XMX-250-OA001","oem_kodu":"2DP-23100-00","is_featured":True},
    {"name":"Yamaha XMAX 250 Fren Kaliper Seti","slug":"yamaha-xmax250-fren-kaliperi","description":"Yamaha XMAX 250 için tam kaliper fren seti. Gelişmiş frenleme kuvveti ve hassasiyeti.","price":1650.00,"original_price":1900.00,"image":"https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80","brand":"YAMAHA","model":"XMAX 250","model_id":"yamaha-xmax250","year_range":"","category":"Fren Sistemi","stock":4,"sku":"YX-XMX-250-FK001","oem_kodu":"2MB-F580W-00","is_featured":False},
    {"name":"CFMoto NK250 Ön Fren Balata","slug":"cfmoto-nk250-on-fren-balata","description":"CFMoto NK250 için yüksek ısıya dayanıklı ön fren balata. Sinterlenmiş metal karışımlı formül.","price":365.00,"original_price":None,"image":"https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80","brand":"CFMOTO","model":"NK250","model_id":"cfmoto-nk250","year_range":"","category":"Fren Sistemi","stock":20,"sku":"CF-NK250-FB001","oem_kodu":"CF188A-064000","is_featured":False},
    {"name":"CFMoto NK250 Motor Yağı Filtresi","slug":"cfmoto-nk250-yag-filtresi","description":"CFMoto NK250 motor için premium yağ filtresi. Motoru temiz tutar, performansı korur.","price":125.00,"original_price":None,"image":"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80","brand":"CFMOTO","model":"NK250","model_id":"cfmoto-nk250","year_range":"","category":"Filtreler","stock":35,"sku":"CF-NK250-YF001","oem_kodu":"CF188A-011200","is_featured":False},
    {"name":"CFMoto 250SR Fren Kaliperi Seti","slug":"cfmoto-250sr-fren-kaliperi","description":"CFMoto 250SR için tam kaliper fren seti. Spor sürüş için optimize edilmiş yüksek performans.","price":1950.00,"original_price":2200.00,"image":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","brand":"CFMOTO","model":"250SR","model_id":"cfmoto-250sr","year_range":"","category":"Fren Sistemi","stock":5,"sku":"CF-250SR-FK001","oem_kodu":"CF250T-080000","is_featured":True},
    {"name":"Bajaj NS200 Zincir Dişli Seti","slug":"bajaj-ns200-zincir-disli","description":"Bajaj NS200 için O-ring zincirli komple aktarma seti. Daha az bakım, daha uzun ömür.","price":580.00,"original_price":680.00,"image":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","brand":"BAJAJ","model":"NS200","model_id":"bajaj-ns200","year_range":"","category":"Aktarma Organları","stock":14,"sku":"BJ-NS200-ZD001","oem_kodu":"2ML-F350Z-00","is_featured":True},
    {"name":"Bajaj NS200 LED Sinyal Seti","slug":"bajaj-ns200-led-sinyal","description":"Bajaj NS200 için tam LED sinyal lambası seti (4'lü). Güçlü görünürlük, uzun ömür.","price":420.00,"original_price":None,"image":"https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80","brand":"BAJAJ","model":"NS200","model_id":"bajaj-ns200","year_range":"","category":"Elektrik & Aydınlatma","stock":25,"sku":"BJ-NS200-LS001","oem_kodu":"33400-MCA-S01","is_featured":False},
    {"name":"Bajaj NS200 Fren Balata Seti (Ön+Arka)","slug":"bajaj-ns200-fren-balata-seti","description":"Bajaj NS200 için komple ön ve arka fren balata takımı. Güvenli ve güçlü frenleme.","price":315.00,"original_price":380.00,"image":"https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80","brand":"BAJAJ","model":"NS200","model_id":"bajaj-ns200","year_range":"","category":"Fren Sistemi","stock":18,"sku":"BJ-NS200-FB001","oem_kodu":"06435-MCA-J01","is_featured":True},
    {"name":"Bajaj NS200 CNC Ayna Seti","slug":"bajaj-ns200-cnc-ayna","description":"Bajaj NS200 için CNC işlenmiş alüminyum ayna seti. Hafif, sağlam, şık tasarım.","price":285.00,"original_price":None,"image":"https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80","brand":"BAJAJ","model":"NS200","model_id":"bajaj-ns200","year_range":"","category":"Aksesuar","stock":16,"sku":"BJ-NS200-AY001","oem_kodu":"88100-MCA-S00","is_featured":False},
]

# ─── FastAPI App ───────────────────────────────────────────────────────────────
app = APIRouter()
api_router = APIRouter(prefix="/api")

# ─── Auth Endpoints ────────────────────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: RegisterRequest, response: Response, session: AsyncSession = Depends(get_db)):
    existing = await session.scalar(select(User).where(User.email == data.email.lower()))
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    user = User(email=data.email.lower(), name=data.name, password_hash=hash_password(data.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    token = create_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=JWT_EXP_DAYS * 86400)
    return {"message": "Kayıt başarılı", "user": user_to_dict(user)}

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response, session: AsyncSession = Depends(get_db)):
    user = await session.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    token = create_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=JWT_EXP_DAYS * 86400)
    return {"message": "Giriş başarılı", "user": user_to_dict(user)}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Çıkış yapıldı"}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user_to_dict(user)

# ─── Product Endpoints ────────────────────────────────────────────────────────
@api_router.get("/products")
async def list_products(
    search: Optional[str] = None,
    brand: Optional[str] = None,
    model_id: Optional[str] = None,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    page: int = 1,
    limit: int = 20,
    session: AsyncSession = Depends(get_db),
):
    stmt = select(Product)
    if brand:
        stmt = stmt.where(Product.brand.ilike(brand))
    if model_id:
        stmt = stmt.where(Product.model_id == model_id)
    if category:
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if featured is not None:
        stmt = stmt.where(Product.is_featured == featured)
    if search:
        terms = [t.strip() for t in search.split() if t.strip()]
        fields = [Product.name, Product.brand, Product.model, Product.category,
                  Product.description, Product.sku, Product.oem_kodu]
        if len(terms) == 1:
            stmt = stmt.where(or_(*[f.ilike(f"%{terms[0]}%") for f in fields]))
        else:
            stmt = stmt.where(and_(*[
                or_(*[f.ilike(f"%{term}%") for f in fields]) for term in terms
            ]))
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    products = await session.scalars(stmt.offset((page - 1) * limit).limit(limit))
    return {"products": [product_to_dict(p) for p in products.all()], "total": total, "page": page, "limit": limit}

@api_router.get("/products/{slug}")
async def get_product(slug: str, session: AsyncSession = Depends(get_db)):
    product = await session.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product_to_dict(product)

# ─── Order Endpoints ──────────────────────────────────────────────────────────
@api_router.post("/orders")
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
    await session.refresh(order)
    order_loaded = await session.scalar(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return {"message": "Sipariş oluşturuldu", "order": order_to_dict(order_loaded)}

@api_router.get("/orders")
async def list_orders(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    orders = await session.scalars(
        select(Order).where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return [order_to_dict(o) for o in orders.all()]

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, session: AsyncSession = Depends(get_db)):
    try:
        oid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    order = await session.scalar(
        select(Order).where(Order.id == oid).options(selectinload(Order.items))
    )
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return order_to_dict(order)

# ─── Coupon Endpoint ──────────────────────────────────────────────────────────
@api_router.post("/coupons/validate")
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
    return {"code": coupon.code, "type": coupon.type, "value": float(coupon.value),
            "discount": discount, "description": coupon.description}

# ─── Wishlist Endpoints ───────────────────────────────────────────────────────
@api_router.get("/wishlist")
async def get_wishlist(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    result = await session.scalars(select(Wishlist.product_id).where(Wishlist.user_id == user.id))
    return {"product_ids": list(result.all())}

@api_router.post("/wishlist/toggle")
async def toggle_wishlist(data: WishlistToggle, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
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

# ─── Stock Notification ───────────────────────────────────────────────────────
@api_router.post("/stock-notify")
async def stock_notify(data: StockNotifyRequest, session: AsyncSession = Depends(get_db)):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", data.email):
        raise HTTPException(status_code=422, detail="Geçerli bir e-posta adresi girin")
    existing = await session.scalar(
        select(StockNotification).where(
            StockNotification.product_id == data.product_id,
            StockNotification.email == data.email.lower().strip()
        )
    )
    if existing:
        return {"message": "Bu ürün için zaten bildirim listesindeysiniz"}
    session.add(StockNotification(product_id=data.product_id, email=data.email.lower().strip()))
    await session.commit()
    return {"message": "Ürün tekrar stoğa girdiğinde e-posta ile bilgilendirileceksiniz"}

# ─── Sitemap ──────────────────────────────────────────────────────────────────
@api_router.get("/sitemap.xml", include_in_schema=False)
async def sitemap(session: AsyncSession = Depends(get_db)):
    base = "https://motoprof.com.tr"
    slugs = await session.scalars(select(Product.slug))
    urls = [
        f"<url><loc>{base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>",
        f"<url><loc>{base}/urunler</loc><changefreq>daily</changefreq><priority>0.9</priority></url>",
        f"<url><loc>{base}/urunler/honda</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>",
        f"<url><loc>{base}/urunler/yamaha</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>",
        f"<url><loc>{base}/urunler/cfmoto</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>",
        f"<url><loc>{base}/urunler/bajaj</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>",
    ] + [f"<url><loc>{base}/urun/{s}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>"
         for s in slugs.all()]
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{"".join(urls)}\n</urlset>'
    return Response(content=xml, media_type="application/xml")

# ─── Health Check ─────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "MotoProf API çalışıyor", "db": "postgresql", "version": "2.0.0"}

# ─── Seed Functions ───────────────────────────────────────────────────────────
async def seed_admin():
    async with AsyncSessionLocal() as session:
        existing = await session.scalar(select(User).where(User.email == ADMIN_EMAIL))
        if not existing:
            session.add(User(email=ADMIN_EMAIL, name="Admin", role="admin", password_hash=hash_password(ADMIN_PASS)))
            await session.commit()
            logger.info(f"Admin kullanıcı oluşturuldu: {ADMIN_EMAIL}")

async def seed_products():
    async with AsyncSessionLocal() as session:
        count = await session.scalar(select(func.count(Product.id)))
        if count > 0:
            return
        for p in DEMO_PRODUCTS:
            main = p.get("image", "")
            extras = [img for img in GALLERY_POOL if img != main][:2]
            images = [main] + extras if main else extras
            session.add(Product(
                name=p["name"], slug=p["slug"], description=p.get("description"),
                price=p["price"], original_price=p.get("original_price"),
                image=p.get("image"), images=images,
                brand=p.get("brand"), model=p.get("model"), model_id=p.get("model_id"),
                year_range=p.get("year_range", ""), category=p.get("category"),
                stock=p.get("stock", 0), sku=p.get("sku"), oem_kodu=p.get("oem_kodu"),
                is_featured=p.get("is_featured", False),
            ))
        await session.commit()
        logger.info(f"{len(DEMO_PRODUCTS)} demo ürün eklendi")

async def seed_coupons():
    async with AsyncSessionLocal() as session:
        for c in DEMO_COUPONS:
            existing = await session.scalar(select(Coupon).where(Coupon.code == c["code"]))
            if not existing:
                session.add(Coupon(**c))
        await session.commit()

# ─── App Setup ────────────────────────────────────────────────────────────────
main_app = FastAPI(title="MotoProf API", version="2.0.0")

main_app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

main_app.include_router(api_router)

@main_app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_admin()
    await seed_products()
    await seed_coupons()
    logger.info("MotoProf API (PostgreSQL) başarıyla başlatıldı")

@main_app.on_event("shutdown")
async def shutdown():
    await engine.dispose()

app = main_app
