import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from database import engine, Base
from seed import seed_admin, seed_products, seed_coupons, seed_categories_and_brands
from routes import (
    auth_router, products_router, orders_router,
    wishlist_router, coupons_router, misc_router,
    payments_router, addresses_router, admin_router,
)
from routes.cart_tracking import router as cart_tracking_router

app = FastAPI(title="MotoProf API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip().rstrip("/") for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth_router,      prefix="/api")
app.include_router(products_router,  prefix="/api")
app.include_router(orders_router,    prefix="/api")
app.include_router(wishlist_router,  prefix="/api")
app.include_router(coupons_router,   prefix="/api")
app.include_router(misc_router,      prefix="/api")
app.include_router(payments_router,  prefix="/api")
app.include_router(addresses_router, prefix="/api")
app.include_router(admin_router,         prefix="/api/admin")
app.include_router(cart_tracking_router, prefix="/api")


@app.on_event("startup")
async def startup():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS iyzico_token VARCHAR(500)"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'iyzico'"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(200)"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS error_code VARCHAR(200)"))
            await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS error_message TEXT"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS cart_data JSONB DEFAULT '[]'::jsonb"))
            # products: SEO meta kolonları
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(500)"))
            await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description VARCHAR(1000)"))
            # bank_accounts: eksik kolonlar ve NULL is_active düzeltmesi
            await conn.execute(text("ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100)"))
            await conn.execute(text("ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_number VARCHAR(50)"))
            await conn.execute(text("ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"))
            await conn.execute(text("UPDATE bank_accounts SET is_active = TRUE WHERE is_active IS NULL"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING GIN (to_tsvector('turkish', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(category, '')))"))

    except Exception as e:
        logger.warning(f"DB init warning (tablolar mevcut olabilir): {e}")
    await seed_admin()
    await seed_products()
    await seed_coupons()
    from seed import seed_banks
    await seed_banks()
    await seed_categories_and_brands()
    logger.info("MotoProf API (PostgreSQL) v2.1 başarıyla başlatıldı")


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
