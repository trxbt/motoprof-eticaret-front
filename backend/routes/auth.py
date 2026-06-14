from fastapi import APIRouter, HTTPException, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import User
from schemas.schemas import RegisterRequest, LoginRequest, CartSyncRequest, ForgotPasswordRequest, ResetPasswordRequest
from config import hash_password, verify_password, create_token, JWT_EXP_DAYS
from serializers import user_to_dict
from deps import get_current_user
from limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterRequest, response: Response, session: AsyncSession = Depends(get_db)):
    existing = await session.scalar(select(User).where(User.email == data.email.lower()))
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    user = User(email=data.email.lower(), name=data.name, password_hash=hash_password(data.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    token = create_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="lax", max_age=JWT_EXP_DAYS * 86400)
    return {"message": "Kayıt başarılı", "user": user_to_dict(user)}


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, data: LoginRequest, response: Response, session: AsyncSession = Depends(get_db)):
    user = await session.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    token = create_token(str(user.id))
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="lax", max_age=JWT_EXP_DAYS * 86400)
    return {"message": "Giriş başarılı", "user": user_to_dict(user)}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", secure=True, samesite="lax")
    return {"message": "Çıkış yapıldı"}


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user_to_dict(user)


@router.post("/cart")
async def sync_cart(data: CartSyncRequest, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    user.cart_data = data.cart_data
    await session.commit()
    return {"message": "Sepet güncellendi"}


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, data: ForgotPasswordRequest, session: AsyncSession = Depends(get_db)):
    from config import create_reset_token, send_reset_email_sync
    import asyncio
    
    user = await session.scalar(select(User).where(User.email == data.email.lower()))
    if not user:
        # We still return success to prevent email enumeration
        return {"message": "Eğer e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi."}
        
    token = create_reset_token(user.email)
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, send_reset_email_sync, user.email, token)
    
    return {"message": "Eğer e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi."}


@router.post("/reset-password")
@limiter.limit("3/minute")
async def reset_password(request: Request, data: ResetPasswordRequest, session: AsyncSession = Depends(get_db)):
    from config import verify_reset_token, hash_password
    
    email = verify_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş sıfırlama bağlantısı.")
        
    user = await session.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=400, detail="Kullanıcı bulunamadı.")
        
    user.password_hash = hash_password(data.new_password)
    await session.commit()
    return {"message": "Şifreniz başarıyla sıfırlandı. Lütfen yeni şifrenizle giriş yapın."}
