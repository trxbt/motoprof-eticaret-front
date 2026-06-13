"""MotoProf API Backend Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://motoprof-preview.preview.emergentagent.com").rstrip("/")

# Shared session with cookie support
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="module")
def auth_session(session):
    """Login as admin and return session"""
    resp = session.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@motoprof.com", "password": "Admin123!"})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return session

# ─── Health ───────────────────────────────────────────────────────────────────
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        print(f"Health OK: {data['message']}")

# ─── Auth ─────────────────────────────────────────────────────────────────────
class TestAuth:
    def test_register_new_user(self, session):
        # Clean up first (ignore error if not exists)
        r = session.post(f"{BASE_URL}/api/auth/register", json={
            "email": "TEST_user_motoprof@example.com",
            "password": "Test123!",
            "name": "Test User"
        })
        # Could be 200 (created) or 400 (already exists - re-run)
        assert r.status_code in [200, 400], f"Register failed: {r.text}"
        print(f"Register status: {r.status_code}")

    def test_login_admin(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@motoprof.com",
            "password": "Admin123!"
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        data = r.json()
        assert data["email"] == "admin@motoprof.com"
        assert data["role"] == "admin"
        print(f"Login OK: {data['name']}")

    def test_login_wrong_password(self, session):
        s2 = requests.Session()
        r = s2.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@motoprof.com",
            "password": "wrongpassword"
        })
        assert r.status_code == 401
        print("Wrong password rejected correctly")

    def test_get_me(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert "email" in data
        assert "password_hash" not in data
        print(f"Me OK: {data['email']}")

    def test_me_unauthenticated(self, session):
        s2 = requests.Session()
        r = s2.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401
        print("Unauthenticated me rejected correctly")

# ─── Products ─────────────────────────────────────────────────────────────────
class TestProducts:
    def test_get_all_products(self, session):
        r = session.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        data = r.json()
        assert "products" in data
        assert "total" in data
        assert data["total"] >= 25, f"Expected 25 products, got {data['total']}"
        print(f"Products total: {data['total']}")

    def test_filter_by_brand_honda(self, session):
        r = session.get(f"{BASE_URL}/api/products?brand=HONDA")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        for p in data["products"]:
            assert p["brand"] == "HONDA"
        print(f"Honda products: {data['total']}")

    def test_filter_by_model_id(self, session):
        r = session.get(f"{BASE_URL}/api/products?model_id=honda-pcx125-1517")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        print(f"PCX 125 (15-17) products: {data['total']}")

    def test_get_product_by_slug(self, session):
        r = session.get(f"{BASE_URL}/api/products/honda-pcx125-1517-on-fren-balata")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "honda-pcx125-1517-on-fren-balata"
        assert "price" in data
        assert "id" in data
        assert "_id" not in data
        print(f"Product: {data['name']}, price: {data['price']}")

    def test_get_product_not_found(self, session):
        r = session.get(f"{BASE_URL}/api/products/non-existent-slug")
        assert r.status_code == 404

    def test_search_products(self, session):
        r = session.get(f"{BASE_URL}/api/products?search=fren")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        print(f"Search 'fren' results: {data['total']}")

    def test_featured_products(self, session):
        r = session.get(f"{BASE_URL}/api/products?featured=true")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        for p in data["products"]:
            assert p["is_featured"] == True
        print(f"Featured products: {data['total']}")

# ─── Orders ───────────────────────────────────────────────────────────────────
class TestOrders:
    def test_create_order_unauthenticated(self, session):
        s2 = requests.Session()
        r = s2.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": "abc", "name": "Test", "price": 100.0, "quantity": 1, "image": ""}],
            "total": 100.0,
            "shipping_name": "Test User",
            "shipping_phone": "5551234567",
            "shipping_address": "Test Address",
            "shipping_city": "Istanbul"
        })
        assert r.status_code == 401
        print("Unauthenticated order rejected correctly")

    def test_create_order_authenticated(self, auth_session):
        r = auth_session.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": "test-id-001", "name": "Honda PCX Balata", "price": 245.0, "quantity": 2, "image": "https://example.com/img.jpg"}],
            "total": 490.0,
            "shipping_name": "Admin User",
            "shipping_phone": "5551234567",
            "shipping_address": "Test Sokak No:1",
            "shipping_city": "İstanbul"
        })
        assert r.status_code == 200, f"Order creation failed: {r.text}"
        data = r.json()
        assert "id" in data
        assert data["payment_status"] == "mock_paid"
        assert data["total"] == 490.0
        print(f"Order created: {data['id']}, payment: {data['payment_status']}")

    def test_get_orders_authenticated(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/orders")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"Orders count: {len(data)}")

    def test_get_orders_unauthenticated(self, session):
        s2 = requests.Session()
        r = s2.get(f"{BASE_URL}/api/orders")
        assert r.status_code == 401
        print("Unauthenticated orders rejected correctly")

# ─── Logout ───────────────────────────────────────────────────────────────────
class TestLogout:
    def test_logout(self, auth_session):
        r = auth_session.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        print(f"Logout: {data['message']}")
