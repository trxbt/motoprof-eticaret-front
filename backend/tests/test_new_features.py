"""Backend tests for new features: coupons, wishlist, stock-notify, sitemap"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture
def auth_session(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@motoprof.com", "password": "Admin123!"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    return session

# ---- Coupon Tests ----
class TestCoupons:
    def test_valid_coupon_moto10(self, session):
        r = session.post(f"{BASE_URL}/api/coupons/validate", json={"code": "MOTO10", "cart_total": 500})
        assert r.status_code == 200
        data = r.json()
        assert data["code"] == "MOTO10"
        assert data["discount"] == 50.0  # 10% of 500

    def test_valid_coupon_kargo50_fixed(self, session):
        r = session.post(f"{BASE_URL}/api/coupons/validate", json={"code": "KARGO50", "cart_total": 600})
        assert r.status_code == 200
        data = r.json()
        assert data["type"] == "fixed"
        assert data["discount"] == 50.0

    def test_coupon_min_order_not_met(self, session):
        r = session.post(f"{BASE_URL}/api/coupons/validate", json={"code": "KARGO50", "cart_total": 100})
        assert r.status_code == 400

    def test_invalid_coupon(self, session):
        r = session.post(f"{BASE_URL}/api/coupons/validate", json={"code": "FAKE999", "cart_total": 500})
        assert r.status_code == 404

    def test_ilkalis_coupon(self, session):
        r = session.post(f"{BASE_URL}/api/coupons/validate", json={"code": "ILKALIS", "cart_total": 400})
        assert r.status_code == 200
        data = r.json()
        assert data["type"] == "percent"

# ---- Wishlist Tests ----
class TestWishlist:
    def test_get_wishlist_unauthenticated(self, session):
        r = session.get(f"{BASE_URL}/api/wishlist")
        # Should return 401 or empty
        assert r.status_code in [200, 401]

    def test_toggle_wishlist_requires_auth(self, session):
        r = session.post(f"{BASE_URL}/api/wishlist/toggle", json={"product_id": "test-id"})
        assert r.status_code == 401

    def test_wishlist_toggle_authenticated(self, auth_session):
        r = auth_session.post(f"{BASE_URL}/api/wishlist/toggle", json={"product_id": "test-product-123"}, allow_redirects=True)
        assert r.status_code == 200

    def test_get_wishlist_authenticated(self, auth_session):
        r = auth_session.get(f"{BASE_URL}/api/wishlist")
        assert r.status_code == 200
        assert "product_ids" in r.json()

# ---- Stock Notify Tests ----
class TestStockNotify:
    def test_stock_notify_valid(self, session):
        r = session.post(f"{BASE_URL}/api/stock-notify", json={"product_id": "some-id", "email": "test@test.com"})
        assert r.status_code == 200

    def test_stock_notify_invalid_email(self, session):
        r = session.post(f"{BASE_URL}/api/stock-notify", json={"product_id": "some-id", "email": "not-email"})
        assert r.status_code in [400, 422]

# ---- Sitemap Tests ----
class TestSitemap:
    def test_sitemap_xml(self, session):
        r = session.get(f"{BASE_URL}/api/sitemap.xml")
        assert r.status_code == 200
        assert "xml" in r.headers.get("content-type", "").lower() or "sitemap" in r.text.lower()
        assert "<urlset" in r.text
