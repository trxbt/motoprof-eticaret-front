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


@router.get("/{slug}")
async def get_product(slug: str, session: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    product = await session.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product_to_dict(product)
