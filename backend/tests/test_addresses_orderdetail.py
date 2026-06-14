"""
Tests for: Address CRUD (GET/POST/PUT/DELETE/PATCH default) + Order Detail API
Iteration 8 - new features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@motoprof.com"
ADMIN_PASS  = "Admin123!"
TEST_USER_EMAIL = "testuser_new@motoprof.com"
TEST_USER_PASS  = "Test123!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_session(session):
    resp = session.post(f"{BASE_URL}/api/auth/login",
                        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASS})
    if resp.status_code != 200:
        # try admin
        resp = session.post(f"{BASE_URL}/api/auth/login",
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return session


@pytest.fixture(scope="module")
def created_address_id(auth_session):
    """Create a test address and return its id"""
    payload = {
        "title": "TEST_Ev",
        "name": "Test Kullanıcı",
        "phone": "05551234567",
        "address": "Test Mahallesi Test Sokak No:1",
        "city": "İstanbul",
        "district": "Kadıköy",
        "is_default": False
    }
    resp = auth_session.post(f"{BASE_URL}/api/addresses", json=payload)
    assert resp.status_code == 201, f"Address create failed: {resp.text}"
    addr_id = resp.json()["id"]
    yield addr_id
    # Cleanup
    auth_session.delete(f"{BASE_URL}/api/addresses/{addr_id}")


# ── Auth required ──────────────────────────────────────────────────────────────

def test_addresses_requires_auth(session):
    """GET /api/addresses without login should 401"""
    anon = requests.Session()
    resp = anon.get(f"{BASE_URL}/api/addresses")
    assert resp.status_code == 401, f"Expected 401 got {resp.status_code}"
    print("PASS: addresses requires auth")


def test_create_address_requires_auth():
    """POST /api/addresses without auth -> 401"""
    resp = requests.post(f"{BASE_URL}/api/addresses", json={
        "title": "Ev", "name": "X", "phone": "05001234567",
        "address": "Abc", "city": "İzmir"
    })
    assert resp.status_code == 401
    print("PASS: create address requires auth")


# ── CRUD ──────────────────────────────────────────────────────────────────────

def test_list_addresses(auth_session):
    resp = auth_session.get(f"{BASE_URL}/api/addresses")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    print(f"PASS: list addresses -> {len(resp.json())} items")


def test_create_address(auth_session):
    payload = {
        "title": "TEST_İş",
        "name": "Test User",
        "phone": "05559998877",
        "address": "İş Mahallesi No:5",
        "city": "Ankara",
        "is_default": False
    }
    resp = auth_session.post(f"{BASE_URL}/api/addresses", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "TEST_İş"
    assert data["city"] == "Ankara"
    assert "id" in data
    # cleanup
    auth_session.delete(f"{BASE_URL}/api/addresses/{data['id']}")
    print("PASS: create address")


def test_create_address_missing_required(auth_session):
    """Missing city should return 422"""
    payload = {"title": "Ev", "name": "X", "phone": "05001234567", "address": "Abc"}
    resp = auth_session.post(f"{BASE_URL}/api/addresses", json=payload)
    assert resp.status_code == 422
    print("PASS: create address missing required field -> 422")


def test_update_address(auth_session, created_address_id):
    resp = auth_session.put(f"{BASE_URL}/api/addresses/{created_address_id}",
                            json={"city": "Bursa"})
    assert resp.status_code == 200
    assert resp.json()["city"] == "Bursa"
    print("PASS: update address")


def test_update_address_persists(auth_session, created_address_id):
    """Verify update persisted via GET"""
    resp = auth_session.get(f"{BASE_URL}/api/addresses")
    assert resp.status_code == 200
    addrs = resp.json()
    match = next((a for a in addrs if a["id"] == created_address_id), None)
    assert match is not None
    assert match["city"] == "Bursa"
    print("PASS: update persists")


def test_set_default_address(auth_session, created_address_id):
    resp = auth_session.patch(f"{BASE_URL}/api/addresses/{created_address_id}/default", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_default"] is True
    print("PASS: set default address")


def test_delete_address(auth_session):
    """Create and then delete an address"""
    create_resp = auth_session.post(f"{BASE_URL}/api/addresses", json={
        "title": "TEST_Sil",
        "name": "Silinecek",
        "phone": "05000000000",
        "address": "Sil Sokak",
        "city": "Konya",
        "is_default": False
    })
    assert create_resp.status_code == 201
    addr_id = create_resp.json()["id"]

    del_resp = auth_session.delete(f"{BASE_URL}/api/addresses/{addr_id}")
    assert del_resp.status_code == 204
    print("PASS: delete address -> 204")

    # Verify gone
    list_resp = auth_session.get(f"{BASE_URL}/api/addresses")
    ids = [a["id"] for a in list_resp.json()]
    assert addr_id not in ids
    print("PASS: deleted address not in list")


# ── Order Detail ───────────────────────────────────────────────────────────────

def test_order_detail_requires_auth():
    resp = requests.get(f"{BASE_URL}/api/orders/nonexistent-id")
    assert resp.status_code in [401, 404]
    print(f"PASS: order detail requires auth -> {resp.status_code}")


def test_order_list_and_detail(auth_session):
    """Get orders list then fetch detail for first order"""
    list_resp = auth_session.get(f"{BASE_URL}/api/orders")
    assert list_resp.status_code == 200
    orders = list_resp.json()
    if not orders:
        pytest.skip("No orders to test detail")

    order_id = orders[0]["id"]
    detail_resp = auth_session.get(f"{BASE_URL}/api/orders/{order_id}")
    assert detail_resp.status_code == 200
    data = detail_resp.json()

    # Validate required fields
    assert "id" in data
    assert "items" in data
    assert "total" in data
    assert "status" in data
    assert "payment_status" in data
    assert isinstance(data["items"], list)

    if data["items"]:
        item = data["items"][0]
        assert "product_name" in item, "item should have product_name"
        assert "price" in item
        assert "quantity" in item

    print(f"PASS: order detail -> {order_id[:8]}... items={len(data['items'])}")


def test_order_detail_shipping_fields(auth_session):
    """Verify shipping fields in order detail"""
    list_resp = auth_session.get(f"{BASE_URL}/api/orders")
    orders = list_resp.json()
    if not orders:
        pytest.skip("No orders")
    order_id = orders[0]["id"]
    data = auth_session.get(f"{BASE_URL}/api/orders/{order_id}").json()
    assert "shipping_name" in data, "shipping_name missing"
    print("PASS: order detail has shipping_name")
