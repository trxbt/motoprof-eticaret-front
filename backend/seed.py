import logging
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal
from models.models import User, Product, Coupon
from config import hash_password, ADMIN_EMAIL, ADMIN_PASS

logger = logging.getLogger(__name__)

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
