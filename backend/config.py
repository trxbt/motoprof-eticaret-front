import os, jwt
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
JWT_SECRET   = os.environ.get("JWT_SECRET")
JWT_EXP_DAYS = 30
ADMIN_EMAIL  = os.environ.get("ADMIN_EMAIL", "admin@motoprof.com")
ADMIN_PASS   = os.environ.get("ADMIN_PASSWORD", "Admin123!")

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)


def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw, hashed)


def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS)
    return jwt.encode({"user_id": user_id, "exp": exp}, JWT_SECRET, algorithm="HS256")
