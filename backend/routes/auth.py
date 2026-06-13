from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import User
from schemas.schemas import RegisterRequest, LoginRequest
from config import hash_password, verify_password, create_token, JWT_EXP_DAYS
from serializers import user_to_dict
from deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
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


@router.post("/login")
async def login(data: LoginRequest, response: Response, session: AsyncSession = Depends(get_db)):
    user = await session.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    token = create_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=JWT_EXP_DAYS * 86400)
    return {"message": "Giriş başarılı", "user": user_to_dict(user)}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Çıkış yapıldı"}


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user_to_dict(user)
