import re
from fastapi import APIRouter, HTTPException, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import StockNotification, Product, BankAccount, Slider, MotorcycleModel, SiteSettings
from schemas.schemas import StockNotifyRequest
from limiter import limiter

router = APIRouter(tags=["misc"])


@router.get("/sliders")
async def get_sliders(session: AsyncSession = Depends(get_db)):
    """Ana sayfa slider verilerini döndür — aktif, sıralı"""
    result = await session.scalars(
        select(Slider).where(Slider.active == True).order_by(Slider.display_order.asc())
    )
    sliders = result.all()
    return [
        {
            "id": str(s.id),
            "title": s.title,
            "subtitle": s.subtitle,
            "image": s.image,
            "link": s.link or "/urunler",
            "button_text": s.button_text or "İncele",
            "display_order": s.display_order,
        }
        for s in sliders
    ]


@router.get("/motorcycle-models")
async def get_motorcycle_models(
    brand: str = None,
    session: AsyncSession = Depends(get_db)
):
    """Motosiklet modellerini döndür — opsiyonel marka filtresi"""
    q = select(MotorcycleModel).order_by(MotorcycleModel.brand, MotorcycleModel.name)
    if brand:
        q = q.where(MotorcycleModel.brand == brand.upper())
    result = await session.scalars(q)
    models = result.all()
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "slug": m.slug,
            "brand": m.brand,
            "year_range": m.year_range,
            "image": m.image,
        }
        for m in models
    ]


@router.post("/stock-notify")
@limiter.limit("3/minute")
async def stock_notify(request: Request, data: StockNotifyRequest, session: AsyncSession = Depends(get_db)):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", data.email):
        raise HTTPException(status_code=422, detail="Geçerli bir e-posta adresi girin")
    existing = await session.scalar(
        select(StockNotification).where(
            StockNotification.product_id == data.product_id,
            StockNotification.email == data.email.lower().strip(),
        )
    )
    if existing:
        return {"message": "Bu ürün için zaten bildirim listesindeysiniz"}
    session.add(StockNotification(product_id=data.product_id, email=data.email.lower().strip()))
    await session.commit()
    return {"message": "Ürün tekrar stoğa girdiğinde e-posta ile bilgilendirileceksiniz"}


@router.get("/banks")
async def get_banks(session: AsyncSession = Depends(get_db)):
    from models.models import BankAccount
    from sqlalchemy import or_, true
    # is_active NULL ise de True say (eski kayıtlar için)
    banks = await session.scalars(
        select(BankAccount).where(
            or_(BankAccount.is_active == True, BankAccount.is_active.is_(None))
        )
    )
    return [{"id": str(b.id), "bank_name": b.bank_name, "account_holder": b.account_holder, "iban": b.iban, "branch_name": getattr(b, 'branch_name', None), "account_number": getattr(b, 'account_number', None)} for b in banks]


@router.get("/sitemap.xml", include_in_schema=False)
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
    ] + [
        f"<url><loc>{base}/urun/{s}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>"
        for s in slugs.all()
    ]
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(urls)
        + "\n</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


@router.get("/")
async def health():
    return {"message": "MotoProf API çalışıyor", "db": "postgresql", "version": "2.0.0"}


@router.get("/settings")
async def get_public_settings(session: AsyncSession = Depends(get_db)):
    """
    Public endpoint — auth gerektirmez.
    Diğer sistemler ve frontend için logo, SEO ve OG verilerini döner.
    GET /api/settings
    """
    result = await session.execute(select(SiteSettings).where(SiteSettings.id == 1))
    settings = result.scalar_one_or_none()
    if not settings:
        # Varsayılan değerleri döndür
        return {
            "site_name": "MotoProf",
            "logo_url": None,
            "favicon_url": None,
            "seo_title": "MotoProf - Motosiklet Yedek Parça",
            "seo_description": "Honda, Yamaha, CF Moto yedek parçaları",
            "seo_keywords": "motosiklet parça, honda, yamaha, cfmoto",
            "seo_og_title": None,
            "seo_og_description": None,
            "seo_og_image": None,
            "seo_canonical": "https://motoprof.com.tr",
            "updated_at": None,
        }
    return {
        "site_name": settings.site_name,
        "logo_url": settings.logo_url,
        "favicon_url": settings.favicon_url,
        "seo_title": settings.seo_title,
        "seo_description": settings.seo_description,
        "seo_keywords": settings.seo_keywords,
        "seo_og_title": settings.seo_og_title or settings.seo_title,
        "seo_og_description": settings.seo_og_description or settings.seo_description,
        "seo_og_image": settings.seo_og_image,
        "seo_canonical": settings.seo_canonical,
        "updated_at": settings.updated_at.isoformat() if settings.updated_at else None,
    }
