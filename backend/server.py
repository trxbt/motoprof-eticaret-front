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
from seed import seed_admin, seed_products, seed_coupons
from routes import (
    auth_router, products_router, orders_router,
    wishlist_router, coupons_router, misc_router,
    payments_router, addresses_router,
)

app = FastAPI(title="MotoProf API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip().rstrip("/") for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,      prefix="/api")
app.include_router(products_router,  prefix="/api")
app.include_router(orders_router,    prefix="/api")
app.include_router(wishlist_router,  prefix="/api")
app.include_router(coupons_router,   prefix="/api")
app.include_router(misc_router,      prefix="/api")
app.include_router(payments_router,  prefix="/api")
app.include_router(addresses_router, prefix="/api")


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS iyzico_token VARCHAR(500)"))
    await seed_admin()
    await seed_products()
    await seed_coupons()
    logger.info("MotoProf API (PostgreSQL) v2.1 başarıyla başlatıldı")


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
