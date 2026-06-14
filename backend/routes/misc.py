import re
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.models import StockNotification, Product
from schemas.schemas import StockNotifyRequest

router = APIRouter(tags=["misc"])


@router.post("/stock-notify")
async def stock_notify(data: StockNotifyRequest, session: AsyncSession = Depends(get_db)):
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
    banks = await session.scalars(select(BankAccount).where(BankAccount.is_active == True))
    return [{"id": str(b.id), "bank_name": b.bank_name, "account_holder": b.account_holder, "iban": b.iban, "branch_name": b.branch_name, "account_number": b.account_number} for b in banks]


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
