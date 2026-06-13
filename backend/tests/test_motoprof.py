import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAuth:
    """Auth flows"""
    unique = str(int(time.time()))[-6:]
    test_email = f"testuser{unique}@example.com"
    test_pass = "TestPass123!"
    test_name = f"Test User{unique}"

    def test_register_new_user(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": self.test_name,
            "email": self.test_email,
            "password": self.test_pass,
            "confirm_password": self.test_pass,
        })
        assert r.status_code == 200
        data = r.json()
        # Returns user object (uses httpOnly cookies for auth)
        assert "email" in data or "id" in data

    def test_login_admin(self):
        # Login uses httpOnly cookies, returns user object
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@motoprof.com",
            "password": "Admin123!"
        })
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == "admin@motoprof.com"

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "bad@bad.com",
            "password": "wrongpass"
        })
        assert r.status_code in [400, 401, 403]


class TestProducts:
    """Products API - returns paginated response"""
    def test_get_products(self):
        r = requests.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        data = r.json()
        # Paginated response
        assert "products" in data
        assert isinstance(data["products"], list)
        assert len(data["products"]) > 0

    def get_first_product(self):
        r = requests.get(f"{BASE_URL}/api/products")
        return r.json()["products"][0]


class TestGuestOrder:
    """Guest checkout - orders without auth"""
    def test_guest_order_creation(self):
        products_r = requests.get(f"{BASE_URL}/api/products")
        assert products_r.status_code == 200
        products = products_r.json()["products"]
        if not products:
            pytest.skip("No products available")
        product = products[0]

        r = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [{"product_id": product["id"], "name": product["name"], "price": product["price"], "quantity": 1, "image": product.get("image", "")}],
            "total": product["price"],
            "shipping_name": "Test Guest",
            "shipping_phone": "05551234567",
            "shipping_address": "Test sokak No:1",
            "shipping_city": "Istanbul",
            "guest_email": "guest@test.com"
        })
        assert r.status_code == 200
        data = r.json()
        assert "id" in data

    def test_guest_order_requires_email_when_no_auth(self):
        r = requests.post(f"{BASE_URL}/api/orders", json={
            "items": [],
            "total": 0,
            "shipping_name": "Guest",
            "shipping_phone": "05551234567",
            "shipping_address": "Addr",
            "shipping_city": "Istanbul"
            # no guest_email, no auth cookie
        })
        assert r.status_code in [400, 422]
