from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router
from routes.wishlist import router as wishlist_router
from routes.coupons import router as coupons_router
from routes.misc import router as misc_router
from routes.payments import router as payments_router
from routes.addresses import router as addresses_router

__all__ = [
    "auth_router", "products_router", "orders_router",
    "wishlist_router", "coupons_router", "misc_router",
    "payments_router", "addresses_router",
]
