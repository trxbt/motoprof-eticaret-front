"""
MotoProf - Iteration 7: iyzico payment integration + core API tests
Tests: health, products, auth, coupons, wishlist, stock-notify, orders, iyzico
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

SESSION = requests.Session()
SESSION.headers.update({"Content-Type": "application/json"})

# --- Helper ---
def login(email, password):
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    return r

# ─── Health ───────────────────────────────────────────────────────────────────

def test_health():
    r = requests.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    d = r.json()
    assert "message" in d
    assert d.get("db") == "postgresql"
    assert d.get("version") == "2.0.0"
    print("✓ Health OK:", d)

# ─── Products ─────────────────────────────────────────────────────────────────

def test_products_list():
    r = requests.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    d = r.json()
    assert "products" in d
    assert "total" in d
    assert d["total"] >= 1
    print(f"✓ Products total={d['total']}, page={d.get('page')}")

def test_products_search_honda_fren():
    r = requests.get(f"{BASE_URL}/api/products", params={"search": "honda fren"})
    assert r.status_code == 200
    d = r.json()
    assert len(d["products"]) >= 1
    print(f"✓ Search 'honda fren' → {len(d['products'])} results")

def test_products_search_sku():
    r = requests.get(f"{BASE_URL}/api/products", params={"search": "HP-PCX-1517-FB001"})
    assert r.status_code == 200
    d = r.json()
    assert len(d["products"]) >= 1
    print(f"✓ SKU search → {len(d['products'])} results")

# ─── Auth ─────────────────────────────────────────────────────────────────────

def test_auth_login_admin():
    r = login("admin@motoprof.com", "Admin123!")
    assert r.status_code == 200
    d = r.json()
    assert "user" in d
    assert d["user"]["email"] == "admin@motoprof.com"
    print(f"✓ Admin login: {d['user']['email']}")

def test_auth_me_with_cookie():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    lr = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@motoprof.com", "password": "Admin123!"})
    assert lr.status_code == 200
    me = s.get(f"{BASE_URL}/api/auth/me")
    assert me.status_code == 200
    d = me.json()
    assert "email" in d
    print(f"✓ Auth/me: {d['email']}")

def test_auth_register_new_user():
    import time
    email = f"testuser_{int(time.time())}@motoprof.com"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test User", "email": email, "password": "Test123!"
    })
    assert r.status_code in [200, 201]
    d = r.json()
    assert "user" in d or "message" in d
    print(f"✓ Register: {email}")

# ─── Coupons ──────────────────────────────────────────────────────────────────

def test_coupon_validate_moto10():
    r = requests.post(f"{BASE_URL}/api/coupons/validate", json={"code": "MOTO10", "cart_total": 300})
    assert r.status_code == 200
    d = r.json()
    assert "discount" in d
    assert d["discount"] > 0
    print(f"✓ Coupon MOTO10 discount={d['discount']}")

def test_coupon_invalid():
    r = requests.post(f"{BASE_URL}/api/coupons/validate", json={"code": "INVALID99", "cart_total": 300})
    assert r.status_code in [400, 404, 422]
    print(f"✓ Invalid coupon → {r.status_code}")

# ─── Stock Notify ─────────────────────────────────────────────────────────────

def test_stock_notify():
    r = requests.post(f"{BASE_URL}/api/stock-notify", json={
        "email": "test@motoprof.com", "product_id": "test-product-1"
    })
    assert r.status_code in [200, 201]
    print(f"✓ Stock notify → {r.status_code}")

# ─── Wishlist ─────────────────────────────────────────────────────────────────

def test_wishlist_toggle_requires_login():
    # Without auth should fail
    r = requests.post(f"{BASE_URL}/api/wishlist/toggle", json={"product_id": "test-product-1"})
    assert r.status_code in [401, 403]
    print(f"✓ Wishlist unauth → {r.status_code}")

def test_wishlist_toggle_with_auth():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    lr = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@motoprof.com", "password": "Admin123!"})
    assert lr.status_code == 200
    # Get a real product id first
    pr = s.get(f"{BASE_URL}/api/products")
    products = pr.json().get("products", [])
    if not products:
        pytest.skip("No products found")
    pid = products[0]["id"]
    r = s.post(f"{BASE_URL}/api/wishlist/toggle", json={"product_id": pid})
    assert r.status_code in [200, 201]
    print(f"✓ Wishlist toggle → {r.status_code}, product={pid}")

# ─── Orders ───────────────────────────────────────────────────────────────────

def test_create_guest_order():
    # Get real product first
    pr = requests.get(f"{BASE_URL}/api/products")
    products = pr.json().get("products", [])
    if not products:
        pytest.skip("No products")
    p = products[0]
    payload = {
        "items": [{
            "product_id": p["id"],
            "product_name": p["name"],
            "product_image": p.get("image", ""),
            "price": p["price"],
            "quantity": 1,
        }],
        "total": p["price"],
        "shipping_name": "Test Kullanici",
        "shipping_phone": "05001234567",
        "shipping_address": "Test Mah. Test Sok. No:1",
        "shipping_city": "Istanbul",
        "guest_email": "guest_test@motoprof.com",
    }
    r = requests.post(f"{BASE_URL}/api/orders", json=payload)
    assert r.status_code in [200, 201]
    d = r.json()
    assert "order" in d
    print(f"✓ Guest order created: {d['order']['id']}")

# ─── iyzico ───────────────────────────────────────────────────────────────────

def test_iyzico_initialize():
    """iyzico initialize should return order_id, token, paymentPageUrl pointing to sandbox"""
    pr = requests.get(f"{BASE_URL}/api/products")
    products = pr.json().get("products", [])
    if not products:
        pytest.skip("No products")
    p = products[0]
    payload = {
        "items": [{
            "product_id": p["id"],
            "product_name": p["name"],
            "product_image": p.get("image", ""),
            "price": p["price"],
            "quantity": 1,
        }],
        "total": p["price"],
        "shipping_name": "Test Kullanici",
        "shipping_phone": "05001234567",
        "shipping_address": "Test Mah. Test Sok. No:1",
        "shipping_city": "Istanbul",
        "guest_email": "iyzico_test@motoprof.com",
    }
    r = requests.post(f"{BASE_URL}/api/payments/iyzico/initialize", json=payload)
    print(f"iyzico initialize status={r.status_code}")
    print(f"iyzico response: {r.text[:500]}")
    assert r.status_code == 200
    d = r.json()
    assert "order_id" in d, f"Missing order_id in: {d}"
    assert "token" in d, f"Missing token in: {d}"
    assert "paymentPageUrl" in d, f"Missing paymentPageUrl in: {d}"
    # URL should point to sandbox
    assert "sandbox-cpp.iyzipay.com" in d["paymentPageUrl"], f"Expected sandbox URL, got: {d['paymentPageUrl']}"
    print(f"✓ iyzico initialize → order_id={d['order_id'][:8]}, paymentPageUrl={d['paymentPageUrl'][:60]}")

def test_iyzico_callback_invalid_token():
    """Callback with invalid token should return HTML redirect or error"""
    r = requests.post(
        f"{BASE_URL}/api/payments/iyzico/callback",
        data={"token": "invalid-token-12345"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        allow_redirects=False,
    )
    print(f"iyzico callback status={r.status_code}, content[:200]={r.text[:200]}")
    # Should return HTML redirect or 4xx
    assert r.status_code in [200, 302, 400], f"Unexpected status: {r.status_code}"
    if r.status_code == 200:
        assert "odeme-sonuc" in r.text or "Redirect" in r.text or "redirect" in r.text.lower()
    print(f"✓ iyzico callback invalid token → {r.status_code}")
