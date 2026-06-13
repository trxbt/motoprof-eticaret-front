from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, List
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# MongoDB
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="MotoProf API")
api_router = APIRouter(prefix="/api")

# ─── PyObjectId ────────────────────────────────────────────────────────────────
def _coerce_oid(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str) and ObjectId.is_valid(v):
        return v
    raise ValueError(f"Invalid ObjectId: {v}")

PyObjectId = Annotated[str, BeforeValidator(_coerce_oid)]

# ─── Auth helpers ──────────────────────────────────────────────────────────────
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(hours=2), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Geçersiz token türü")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Oturum süresi doldu")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except Exception:
        return None

# ─── Pydantic Models ───────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class OrderItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str

class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    total: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    guest_email: Optional[str] = None

# ─── Auth endpoints ────────────────────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    hashed = hash_password(data.password)
    doc = {"email": email, "password_hash": hashed, "name": data.name,
           "phone": data.phone, "role": "user", "created_at": datetime.now(timezone.utc)}
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": data.name, "role": "user"}

@api_router.post("/auth/login")
async def login(data: UserLogin, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user["name"], "role": user.get("role", "user")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Çıkış yapıldı"}

@api_router.get("/auth/me")
async def me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token bulunamadı")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Geçersiz token")
        user_id = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        new_access = create_access_token(user_id, user["email"])
        response.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
        return {"message": "Token yenilendi"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

# ─── Product endpoints ─────────────────────────────────────────────────────────
def serialize_product(p: dict) -> dict:
    p["id"] = str(p.pop("_id"))
    return p

@api_router.get("/products")
async def get_products(
    brand: Optional[str] = None,
    model_id: Optional[str] = None,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    query = {}
    if brand:
        query["brand"] = brand.upper()
    if model_id:
        query["model_id"] = model_id
    if category:
        query["category"] = category
    if featured is not None:
        query["is_featured"] = featured
    if search:
        terms = [t.strip() for t in search.split() if t.strip()]
        fields = ["name", "brand", "model", "category", "description"]
        if len(terms) == 1:
            # Tek kelime: herhangi bir alanda eşleşsin
            query["$or"] = [
                {field: {"$regex": terms[0], "$options": "i"}} for field in fields
            ]
        else:
            # Çok kelime: HER kelime en az bir alanda eşleşmeli (AND mantığı)
            query["$and"] = [
                {"$or": [
                    {field: {"$regex": term, "$options": "i"}} for field in fields
                ]} for term in terms
            ]
    total = await db.products.count_documents(query)
    products = await db.products.find(query).skip(skip).limit(limit).to_list(limit)
    return {"products": [serialize_product(p) for p in products], "total": total, "limit": limit, "skip": skip}

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug})
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return serialize_product(product)

# ─── Order endpoints ───────────────────────────────────────────────────────────
def serialize_order(o: dict) -> dict:
    o["id"] = str(o.pop("_id"))
    return o

@api_router.post("/orders")
async def create_order(data: OrderCreate, request: Request):
    user = await get_optional_user(request)
    if user is None and not data.guest_email:
        raise HTTPException(status_code=400, detail="Misafir siparişi için e-posta adresi gereklidir")
    order = {
        "user_id": user.get("_id") or user.get("id") if user else "guest",
        "user_email": user["email"] if user else data.guest_email,
        "is_guest": user is None,
        "items": [item.model_dump() for item in data.items],
        "total": data.total,
        "shipping_name": data.shipping_name,
        "shipping_phone": data.shipping_phone,
        "shipping_address": data.shipping_address,
        "shipping_city": data.shipping_city,
        "status": "pending",
        "payment_status": "mock_paid",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.orders.insert_one(order)
    order["_id"] = result.inserted_id
    return serialize_order(order)

@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request)
    uid = user.get("id") or user.get("_id")
    orders = await db.orders.find({"user_id": uid}).sort("created_at", -1).to_list(100)
    return [serialize_order(o) for o in orders]

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_current_user(request)
    uid = user.get("id") or user.get("_id")
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order or order["user_id"] != uid:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı")
    return serialize_order(order)

# ─── Health check ──────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "MotoProf API çalışıyor", "version": "1.0.0"}

# ─── Seed Data ─────────────────────────────────────────────────────────────────
DEMO_PRODUCTS = [
    {"name": "Honda PCX 125 Ön Fren Balata Takımı (15-17)", "slug": "honda-pcx125-1517-on-fren-balata",
     "description": "Honda PCX 125 (2015-2017) modelleri için orijinal kalitede ön fren balata takımı. Yüksek ısı direnci ve uzun ömürlü formülü ile güvenli frenleme sağlar.",
     "price": 245.00, "original_price": 289.00,
     "image": "https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1517",
     "year_range": "2015-2017", "category": "Fren Sistemi", "stock": 15, "sku": "HP-PCX-1517-FB001", "is_featured": True},
    {"name": "Honda PCX 125 Hava Filtresi (15-17)", "slug": "honda-pcx125-1517-hava-filtresi",
     "description": "Honda PCX 125 (2015-2017) için yüksek performanslı hava filtresi. Motoru korur ve yakıt verimliliğini artırır.",
     "price": 189.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1517",
     "year_range": "2015-2017", "category": "Filtreler", "stock": 22, "sku": "HP-PCX-1517-HF001", "is_featured": False},
    {"name": "Honda PCX 125 Motor Yağı Filtresi (15-17)", "slug": "honda-pcx125-1517-yag-filtresi",
     "description": "Motor yağını temiz tutan premium kalite yağ filtresi. Motoru korozyon ve aşınmadan korur.",
     "price": 85.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1517",
     "year_range": "2015-2017", "category": "Filtreler", "stock": 45, "sku": "HP-PCX-1517-YF001", "is_featured": False},
    {"name": "Honda PCX 125 Sağ Sol Ayna Seti (15-17)", "slug": "honda-pcx125-1517-ayna-seti",
     "description": "Honda PCX 125 (2015-2017) için krom kaplama ayna seti. Titreşim önleyici yapısıyla net görüş sağlar.",
     "price": 320.00, "original_price": 380.00,
     "image": "https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1517",
     "year_range": "2015-2017", "category": "Aksesuar", "stock": 8, "sku": "HP-PCX-1517-AY001", "is_featured": True},
    {"name": "Honda PCX 125 Vites Kayışı (18-20)", "slug": "honda-pcx125-1820-vites-kayisi",
     "description": "Honda PCX 125 (2018-2020) için orijinal kalite aktarma kayışı. Uzun ömürlü kevlar takviyeli yapı.",
     "price": 425.00, "original_price": 495.00,
     "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1820",
     "year_range": "2018-2020", "category": "Motor & Şanzıman", "stock": 12, "sku": "HP-PCX-1820-VK001", "is_featured": True},
    {"name": "Honda PCX 125 Ön Far LED Set (18-20)", "slug": "honda-pcx125-1820-on-far-led",
     "description": "Honda PCX 125 (2018-2020) için yüksek ışık çıkışlı LED far seti. Kolay montaj, plug-and-play.",
     "price": 680.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1820",
     "year_range": "2018-2020", "category": "Elektrik & Aydınlatma", "stock": 6, "sku": "HP-PCX-1820-FL001", "is_featured": False},
    {"name": "Honda PCX 125 Kaporta Koruyucu Set (18-20)", "slug": "honda-pcx125-1820-kaporta-koruyucu",
     "description": "Honda PCX 125 (2018-2020) kaporta koruyucu set. Karbon fiber görünümlü ABS plastik.",
     "price": 180.00, "original_price": 220.00,
     "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-1820",
     "year_range": "2018-2020", "category": "Kaporta & Plastik", "stock": 10, "sku": "HP-PCX-1820-KK001", "is_featured": False},
    {"name": "Honda PCX 125 ABS Fren Seti (21-24)", "slug": "honda-pcx125-2124-abs-fren",
     "description": "Honda PCX 125 (2021-2024) ABS versiyonu için komple fren seti. Gelişmiş fren performansı.",
     "price": 890.00, "original_price": 1050.00,
     "image": "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
     "brand": "HONDA", "model": "PCX 125", "model_id": "honda-pcx125-2124",
     "year_range": "2021-2024", "category": "Fren Sistemi", "stock": 5, "sku": "HP-PCX-2124-AB001", "is_featured": True},
    {"name": "Honda DIO 110 Hava Filtresi (21-24)", "slug": "honda-dio110-2124-hava-filtresi",
     "description": "Honda DIO 110 (2021-2024) için orijinal kalite hava filtresi. Optimum motor performansı için.",
     "price": 145.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80",
     "brand": "HONDA", "model": "DIO 110", "model_id": "honda-dio110-2124",
     "year_range": "2021-2024", "category": "Filtreler", "stock": 30, "sku": "HD-DIO-2124-HF001", "is_featured": False},
    {"name": "Honda CBF 150 Zincir Dişli Seti", "slug": "honda-cbf150-zincir-disli",
     "description": "Honda CBF 150 için dayanıklı zincir ve dişli seti. O-ring zinciri ile uzun ömür.",
     "price": 650.00, "original_price": 750.00,
     "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
     "brand": "HONDA", "model": "CBF 150", "model_id": "honda-cbf150",
     "year_range": "", "category": "Aktarma Organları", "stock": 10, "sku": "HC-CBF-150-ZD001", "is_featured": True},
    {"name": "Honda FORZA 250 Arka Amortisör", "slug": "honda-forza250-arka-amortisoru",
     "description": "Honda FORZA 250 için yüksek performanslı ayarlanabilir arka amortisör. Konfor ve performansı birleştirir.",
     "price": 2850.00, "original_price": 3200.00,
     "image": "https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80",
     "brand": "HONDA", "model": "FORZA 250", "model_id": "honda-forza250",
     "year_range": "", "category": "Süspansiyon", "stock": 4, "sku": "HF-FRZ-250-AA001", "is_featured": True},
    {"name": "Honda ACTIVA 125 Karbüratör Sifonu", "slug": "honda-activa125-karburator-sifonu",
     "description": "Honda ACTIVA 125 için karbüratör bakım ve temizleme seti. Optimum yakıt-hava karışımı için.",
     "price": 185.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
     "brand": "HONDA", "model": "ACTIVA 125", "model_id": "honda-activa125",
     "year_range": "", "category": "Yakıt Sistemi", "stock": 22, "sku": "HA-ACT-125-KS001", "is_featured": False},
    {"name": "Yamaha NMAX 125 Ön Fren Diski", "slug": "yamaha-nmax125-on-fren-diski",
     "description": "Yamaha NMAX 125 için premium kalite ön fren diski. Yüksek ısı yayma kapasitesi ile güvenli frenleme.",
     "price": 480.00, "original_price": 560.00,
     "image": "https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80",
     "brand": "YAMAHA", "model": "NMAX 125", "model_id": "yamaha-nmax125",
     "year_range": "", "category": "Fren Sistemi", "stock": 18, "sku": "YN-NMX-125-FD001", "is_featured": True},
    {"name": "Yamaha NMAX 125 Buji Takımı", "slug": "yamaha-nmax125-buji",
     "description": "Yamaha NMAX 125 için iridyum uçlu buji takımı. Daha güçlü ateşleme, daha az yakıt tüketimi.",
     "price": 95.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80",
     "brand": "YAMAHA", "model": "NMAX 125", "model_id": "yamaha-nmax125",
     "year_range": "", "category": "Motor & Şanzıman", "stock": 55, "sku": "YN-NMX-125-BJ001", "is_featured": False},
    {"name": "Yamaha NMAX 155 Akü 12V 7AH", "slug": "yamaha-nmax155-aku",
     "description": "Yamaha NMAX 155 için bakımsız 12V 7AH motosiklet aküsü. Soğuk havalarda güvenilir çalışma.",
     "price": 1250.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
     "brand": "YAMAHA", "model": "NMAX 155", "model_id": "yamaha-nmax155",
     "year_range": "", "category": "Elektrik & Aydınlatma", "stock": 9, "sku": "YN-NMX-155-AK001", "is_featured": False},
    {"name": "Yamaha NMAX 155 Spor Egzoz", "slug": "yamaha-nmax155-spor-egzoz",
     "description": "Yamaha NMAX 155 için spor görünümlü paslanmaz çelik egzoz. Daha güçlü ses ve görünüm.",
     "price": 1850.00, "original_price": 2100.00,
     "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
     "brand": "YAMAHA", "model": "NMAX 155", "model_id": "yamaha-nmax155",
     "year_range": "", "category": "Egzoz", "stock": 6, "sku": "YN-NMX-155-EG001", "is_featured": True},
    {"name": "Yamaha XMAX 250 Ön Amortisör Seti", "slug": "yamaha-xmax250-on-amortisoru",
     "description": "Yamaha XMAX 250 için ayarlanabilir yüksek performanslı ön amortisör seti. Spor ve konfor dengesi.",
     "price": 3850.00, "original_price": 4200.00,
     "image": "https://images.unsplash.com/photo-1558981285-6f0c68243c5a?w=600&q=80",
     "brand": "YAMAHA", "model": "XMAX 250", "model_id": "yamaha-xmax250",
     "year_range": "", "category": "Süspansiyon", "stock": 3, "sku": "YX-XMX-250-OA001", "is_featured": True},
    {"name": "Yamaha XMAX 250 Fren Kaliper Seti", "slug": "yamaha-xmax250-fren-kaliperi",
     "description": "Yamaha XMAX 250 için tam kaliper fren seti. Gelişmiş frenleme kuvveti ve hassasiyeti.",
     "price": 1650.00, "original_price": 1900.00,
     "image": "https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80",
     "brand": "YAMAHA", "model": "XMAX 250", "model_id": "yamaha-xmax250",
     "year_range": "", "category": "Fren Sistemi", "stock": 4, "sku": "YX-XMX-250-FK001", "is_featured": False},
    {"name": "CFMoto NK250 Ön Fren Balata", "slug": "cfmoto-nk250-on-fren-balata",
     "description": "CFMoto NK250 için yüksek ısıya dayanıklı ön fren balata. Sinterlenmiş metal karışımlı formül.",
     "price": 365.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
     "brand": "CFMOTO", "model": "NK250", "model_id": "cfmoto-nk250",
     "year_range": "", "category": "Fren Sistemi", "stock": 20, "sku": "CF-NK250-FB001", "is_featured": False},
    {"name": "CFMoto NK250 Motor Yağı Filtresi", "slug": "cfmoto-nk250-yag-filtresi",
     "description": "CFMoto NK250 motor için premium yağ filtresi. Motoru temiz tutar, performansı korur.",
     "price": 125.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80",
     "brand": "CFMOTO", "model": "NK250", "model_id": "cfmoto-nk250",
     "year_range": "", "category": "Filtreler", "stock": 35, "sku": "CF-NK250-YF001", "is_featured": False},
    {"name": "CFMoto 250SR Fren Kaliperi Seti", "slug": "cfmoto-250sr-fren-kaliperi",
     "description": "CFMoto 250SR için tam kaliper fren seti. Spor sürüş için optimize edilmiş yüksek performans.",
     "price": 1950.00, "original_price": 2200.00,
     "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
     "brand": "CFMOTO", "model": "250SR", "model_id": "cfmoto-250sr",
     "year_range": "", "category": "Fren Sistemi", "stock": 5, "sku": "CF-250SR-FK001", "is_featured": True},
    {"name": "Bajaj NS200 Zincir Dişli Seti", "slug": "bajaj-ns200-zincir-disli",
     "description": "Bajaj NS200 için O-ring zincirli komple aktarma seti. Daha az bakım, daha uzun ömür.",
     "price": 580.00, "original_price": 680.00,
     "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
     "brand": "BAJAJ", "model": "NS200", "model_id": "bajaj-ns200",
     "year_range": "", "category": "Aktarma Organları", "stock": 14, "sku": "BJ-NS200-ZD001", "is_featured": True},
    {"name": "Bajaj NS200 LED Sinyal Seti", "slug": "bajaj-ns200-led-sinyal",
     "description": "Bajaj NS200 için tam LED sinyal lambası seti (4'lü). Güçlü görünürlük, uzun ömür.",
     "price": 420.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1534755563369-ad37931ac77b?w=600&q=80",
     "brand": "BAJAJ", "model": "NS200", "model_id": "bajaj-ns200",
     "year_range": "", "category": "Elektrik & Aydınlatma", "stock": 25, "sku": "BJ-NS200-LS001", "is_featured": False},
    {"name": "Bajaj NS200 Fren Balata Seti (Ön+Arka)", "slug": "bajaj-ns200-fren-balata-seti",
     "description": "Bajaj NS200 için komple ön ve arka fren balata takımı. Güvenli ve güçlü frenleme.",
     "price": 315.00, "original_price": 380.00,
     "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80",
     "brand": "BAJAJ", "model": "NS200", "model_id": "bajaj-ns200",
     "year_range": "", "category": "Fren Sistemi", "stock": 18, "sku": "BJ-NS200-FB001", "is_featured": True},
    {"name": "Bajaj NS200 CNC Ayna Seti", "slug": "bajaj-ns200-cnc-ayna",
     "description": "Bajaj NS200 için CNC işlenmiş alüminyum ayna seti. Hafif, sağlam, şık tasarım.",
     "price": 285.00, "original_price": None,
     "image": "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?w=600&q=80",
     "brand": "BAJAJ", "model": "NS200", "model_id": "bajaj-ns200",
     "year_range": "", "category": "Aksesuar", "stock": 16, "sku": "BJ-NS200-AY001", "is_featured": False},
]

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@motoprof.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({"email": admin_email, "password_hash": hashed,
                                   "name": "Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc)})
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})

async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        for p in DEMO_PRODUCTS:
            p["created_at"] = now
        await db.products.insert_many([dict(p) for p in DEMO_PRODUCTS])
        logger.info(f"Seeded {len(DEMO_PRODUCTS)} demo products")

# ─── App startup ───────────────────────────────────────────────────────────────
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_products()
    logger.info("MotoProf API started successfully")

@app.on_event("shutdown")
async def shutdown():
    client.close()
