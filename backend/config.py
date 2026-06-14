import os, jwt, secrets
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

_raw_db_url = os.environ.get("DATABASE_URL", "")
if _raw_db_url.startswith("postgres://"):
    DATABASE_URL = _raw_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _raw_db_url.startswith("postgresql://"):
    DATABASE_URL = _raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = _raw_db_url

JWT_SECRET   = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("KRİTİK HATA: JWT_SECRET ortam değişkeni bulunamadı. Lütfen .env dosyasını yapılandırın.")

JWT_EXP_DAYS = 30
ADMIN_EMAIL  = os.environ.get("ADMIN_EMAIL", "admin@motoprof.com")
ADMIN_PASS   = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASS:
    ADMIN_PASS = secrets.token_urlsafe(12)
    print(f"UYARI: ADMIN_PASSWORD ayarlanmamış! Yeni admin şifreniz: {ADMIN_PASS}")

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)


def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw, hashed)


def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS)
    return jwt.encode({"user_id": user_id, "exp": exp}, JWT_SECRET, algorithm="HS256")


# --- Password Reset & SMTP ---
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASSWORD")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://motoprof.com.tr")

def create_reset_token(email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=1)
    return jwt.encode({"reset_email": email, "exp": exp}, JWT_SECRET, algorithm="HS256")

def verify_reset_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("reset_email")
    except Exception:
        return None

def send_reset_email_sync(to_email: str, token: str):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    reset_link = f"{FRONTEND_URL}/sifre-sifirla?token={token}"
    
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        print(f"UYARI: SMTP ayarları bulunamadı. Simüle ediliyor:\nKime: {to_email}\nSıfırlama Linki: {reset_link}")
        return

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = "MotoProf - Şifre Sıfırlama Talebi"

    body = f"""Merhaba,
    
Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
{reset_link}

Bu bağlantı 1 saat boyunca geçerlidir.
Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.

Saygılarımızla,
MotoProf Ekibi
"""
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"E-posta gönderme hatası: {e}")
