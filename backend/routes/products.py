from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
from database import get_db
from models.models import Product
from serializers import product_to_dict

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
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
        from sqlalchemy import text
        # tsquery formati: kelime1:* & kelime2:*
        terms = [t.strip() for t in search.split() if t.strip()]
        if terms:
            search_query = " & ".join([f"{t}:*" for t in terms])
            stmt = stmt.where(text(
                "to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(category, '')) @@ to_tsquery('turkish', :q)"
            )).params(q=search_query)
    total = await session.scalar(select(func.count()).select_from(stmt.subquery()))
    products = await session.scalars(stmt.offset((page - 1) * limit).limit(limit))
    return {"products": [product_to_dict(p) for p in products.all()], "total": total, "page": page, "limit": limit}


@router.get("/{slug}")
async def get_product(slug: str, session: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    product = await session.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product_to_dict(product)
