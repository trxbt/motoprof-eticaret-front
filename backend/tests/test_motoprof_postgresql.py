"""
MotoProf PostgreSQL Backend Tests - Iteration 6
Tests all endpoints for the new PostgreSQL migration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="module")
def auth_session():
    """Session with cookie-based auth"""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    resp = s.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@motoprof.com",
        "password": "Admin123!"
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return s

# ── Products ──────────────────────────────────────────────────────────────────

class TestProducts:
    """Product listing and detail tests"""

    def test_get_products_list(self, session):
        resp = session.get(f"{BASE_URL}/api/products")
        assert resp.status_code == 200
        data = resp.json()
        assert "products" in data
        assert "total" in data
        assert data["total"] >= 25
        assert len(data["products"]) > 0
        # Each product must have id (UUID string)
        p = data["products"][0]
        assert "id" in p
        assert isinstance(p["id"], str)
        print(f"PASS: products={len(data['products'])}, total={data['total']}")

    def test_get_products_pagination(self, session):
        resp = session.get(f"{BASE_URL}/api/products?page=1&limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["products"]) <= 5
        print(f"PASS: pagination limit=5, got {len(data['products'])}")

    def test_search_products(self, session):
        resp = session.get(f"{BASE_URL}/api/products?search=honda")
        assert resp.status_code == 200
        data = resp.json()
        assert "products" in data
        print(f"PASS: search honda, results={data['total']}")

    def test_get_product_by_slug(self, session):
        # Get first product slug
        products_resp = session.get(f"{BASE_URL}/api/products?limit=1")
        slug = products_resp.json()["products"][0]["slug"]
        resp = session.get(f"{BASE_URL}/api/products/{slug}")
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "name" in data
        assert "price" in data
        print(f"PASS: product detail slug={slug}")

    def test_get_product_motoprof_preview(self, session):
        resp = session.get(f"{BASE_URL}/api/products/motoprof-preview")
        # Either found or 404 - just verify it doesn't crash
        assert resp.status_code in [200, 404]
        print(f"PASS: motoprof-preview slug status={resp.status_code}")


# ── Auth ──────────────────────────────────────────────────────────────────────

class TestAuth:
    """Cookie-based JWT auth tests"""

    def test_register_new_user(self, session):
        import time
        email = f"testuser_{int(time.time())}@motoprof.com"
        resp = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "Test123!",
            "name": "Test User"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "user" in data
        assert data["user"]["email"] == email
        # Cookie should be set
        assert "access_token" in session.cookies or resp.cookies.get("access_token")
        print(f"PASS: register {email}")

    def test_login_admin(self, session):
        s = requests.Session()
        resp = s.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@motoprof.com",
            "password": "Admin123!"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "user" in data
        assert data["user"]["email"] == "admin@motoprof.com"
        # Cookie set
        assert "access_token" in s.cookies or "access_token" in resp.cookies
        print("PASS: admin login, cookie set")

    def test_login_wrong_password(self, session):
        resp = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@motoprof.com",
            "password": "WrongPass!"
        })
        assert resp.status_code in [401, 403]
        print("PASS: wrong password rejected")

    def test_get_me_authenticated(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert data["email"] == "admin@motoprof.com"
        print("PASS: /api/auth/me returns user")

    def test_get_me_unauthenticated(self, session):
        s = requests.Session()
        resp = s.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code in [401, 403]
        print("PASS: /api/auth/me unauthenticated rejected")

    def test_logout(self, auth_session):
        s = requests.Session()
        s.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@motoprof.com", "password": "Admin123!"
        })
        resp = s.post(f"{BASE_URL}/api/auth/logout")
        assert resp.status_code == 200
        # After logout, /me should fail
        me_resp = s.get(f"{BASE_URL}/api/auth/me")
        assert me_resp.status_code in [401, 403]
        print("PASS: logout clears session")


# ── Orders ────────────────────────────────────────────────────────────────────

class TestOrders:
    """Order creation tests"""

    def test_create_guest_order(self, session):
        # Get a product first
        products_resp = session.get(f"{BASE_URL}/api/products?limit=1")
        product = products_resp.json()["products"][0]
        
        resp = session.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": product["id"], "product_name": product["name"], "price": product["price"], "quantity": 1}],
            "total": product["price"],
            "guest_email": "guest@test.com",
            "shipping_name": "Test Guest",
            "shipping_phone": "05001234567",
            "shipping_address": "Test Address",
            "shipping_city": "Istanbul"
        })
        assert resp.status_code == 200
        data = resp.json()
        # Response has order nested
        order = data.get("order", data)
        assert "id" in order
        assert order["payment_status"] == "mock_paid"
        print(f"PASS: guest order created id={order['id']}")

    def test_create_order_with_coupon(self, session):
        products_resp = session.get(f"{BASE_URL}/api/products?limit=1")
        product = products_resp.json()["products"][0]
        total = float(product["price"]) * 3  # ensure min 200

        resp = session.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": product["id"], "product_name": product["name"], "price": product["price"], "quantity": 3}],
            "total": total,
            "guest_email": "guest@test.com",
            "shipping_name": "Test Guest",
            "shipping_phone": "05001234567",
            "shipping_address": "Test Address",
            "shipping_city": "Istanbul",
            "coupon_code": "MOTO10"
        })
        assert resp.status_code == 200
        data = resp.json()
        order = data.get("order", data)
        assert "id" in order
        print(f"PASS: order with coupon MOTO10 created")


# ── Coupons ───────────────────────────────────────────────────────────────────

class TestCoupons:
    """Coupon validation tests"""

    def test_validate_moto10_coupon(self, session):
        resp = session.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "MOTO10",
            "cart_total": 500
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "discount" in data or "valid" in data
        print(f"PASS: MOTO10 validated: {data}")

    def test_validate_coupon_below_min(self, session):
        resp = session.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "MOTO10",
            "cart_total": 100  # below 200 min
        })
        assert resp.status_code in [400, 422]
        print(f"PASS: MOTO10 rejected below min: {resp.status_code}")

    def test_validate_invalid_coupon(self, session):
        resp = session.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "INVALID999",
            "cart_total": 500
        })
        assert resp.status_code in [404, 400]
        print(f"PASS: invalid coupon rejected")

    def test_validate_ilkalis_coupon(self, session):
        resp = session.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "ILKALIS",
            "cart_total": 50
        })
        assert resp.status_code == 200
        print(f"PASS: ILKALIS coupon works with 0 min")


# ── Wishlist ──────────────────────────────────────────────────────────────────

class TestWishlist:
    """Wishlist requires auth"""

    def test_get_wishlist_unauthenticated(self, session):
        s = requests.Session()
        resp = s.get(f"{BASE_URL}/api/wishlist")
        assert resp.status_code in [401, 403]
        print("PASS: wishlist unauthenticated rejected")

    def test_get_wishlist_authenticated(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/wishlist")
        assert resp.status_code == 200
        data = resp.json()
        # Returns {product_ids: [...]} or list
        items = data if isinstance(data, list) else data.get("product_ids", data)
        assert isinstance(items, list)
        print(f"PASS: wishlist authenticated, items={len(items)}")

    def test_toggle_wishlist(self, auth_session):
        products_resp = auth_session.get(f"{BASE_URL}/api/products?limit=1")
        product_id = products_resp.json()["products"][0]["id"]
        
        resp = auth_session.post(f"{BASE_URL}/api/wishlist/toggle", json={"product_id": product_id})
        assert resp.status_code == 200
        data = resp.json()
        assert "action" in data  # added or removed
        print(f"PASS: wishlist toggle action={data.get('action')}")


# ── Stock Notify ──────────────────────────────────────────────────────────────

class TestStockNotify:
    def test_stock_notify_register(self, session):
        products_resp = session.get(f"{BASE_URL}/api/products?limit=1")
        product_id = products_resp.json()["products"][0]["id"]
        
        resp = session.post(f"{BASE_URL}/api/stock-notify", json={
            "product_id": product_id,
            "email": "notify@test.com"
        })
        assert resp.status_code == 200
        print(f"PASS: stock notify registered")


# ── Sitemap ───────────────────────────────────────────────────────────────────

class TestSitemap:
    def test_sitemap_xml(self, session):
        resp = session.get(f"{BASE_URL}/api/sitemap.xml")
        assert resp.status_code == 200
        assert "xml" in resp.headers.get("content-type", "").lower() or "<?xml" in resp.text
        assert "<url>" in resp.text
        print("PASS: sitemap.xml returns XML")
