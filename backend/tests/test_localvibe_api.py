"""LocalVibe backend API tests covering auth, providers (multi-city), meta."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://service-finder-483.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

DEMO_EMAIL = "demo@localvibe.app"
DEMO_PASSWORD = "Demo@12345"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def demo_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ---------- Auth ----------
class TestAuth:
    def test_login_demo_returns_token_and_user(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == DEMO_EMAIL
        assert data["user"]["role"] == "seeker"

    def test_login_invalid_password(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_token(self, api_client, demo_token):
        r = api_client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {demo_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL


# ---------- Providers list / multi-city ----------
class TestProviderListing:
    def test_list_returns_15_with_cities_array(self, api_client):
        r = api_client.get(f"{API}/providers")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 15, f"expected 15 seeded, got {len(data)}"
        for p in data:
            assert "cities" in p, "provider missing cities array"
            assert isinstance(p["cities"], list) and len(p["cities"]) >= 1
            assert "city" not in p or p.get("city") is None  # legacy field should not be present
            # core fields
            for k in ["id", "name", "category", "price_min", "price_max", "rating"]:
                assert k in p

    def test_filter_city_goa(self, api_client):
        r = api_client.get(f"{API}/providers", params={"city": "Goa"})
        assert r.status_code == 200
        data = r.json()
        names = sorted([p["name"] for p in data])
        assert names == sorted(["Plan With Pari", "Frame & Feel Studios"]), names

    def test_filter_city_gurgaon(self, api_client):
        r = api_client.get(f"{API}/providers", params={"city": "Gurgaon"})
        assert r.status_code == 200
        names = sorted([p["name"] for p in r.json()])
        expected = sorted(["Sunehri Cakes by Riya", "Aanya Kapoor MUA", "Mandap Magic Decor", "Tandoor Tales Catering"])
        assert names == expected, names

    def test_filter_city_tokyo_empty(self, api_client):
        r = api_client.get(f"{API}/providers", params={"city": "Tokyo"})
        assert r.status_code == 200
        assert r.json() == []

    def test_filter_city_case_insensitive(self, api_client):
        r = api_client.get(f"{API}/providers", params={"city": "goa"})
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_featured_filtered_by_goa(self, api_client):
        r = api_client.get(f"{API}/providers/featured", params={"city": "Goa"})
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert "Goa" in p["cities"]
            assert p["verified"] is True


# ---------- Meta ----------
class TestMeta:
    def test_cities(self, api_client):
        r = api_client.get(f"{API}/meta/cities")
        assert r.status_code == 200
        cities = r.json()
        assert isinstance(cities, list) and len(cities) >= 5
        assert "Delhi" in cities and "Mumbai" in cities

    def test_categories(self, api_client):
        r = api_client.get(f"{API}/meta/categories")
        assert r.status_code == 200
        keys = [c["key"] for c in r.json()]
        for expected in ["Bakers", "Makeup Artists", "Decorators", "Photographers"]:
            assert expected in keys


# ---------- Provider creation flow ----------
class TestProviderCreation:
    def _register(self, api_client, role="provider"):
        email = f"TEST_prov_{uuid.uuid4().hex[:8]}@localvibe.app"
        r = api_client.post(f"{API}/auth/register", json={
            "email": email, "password": "Test@12345",
            "name": "TEST Provider", "role": role,
        })
        assert r.status_code == 200, r.text
        return r.json()["token"], email

    def test_create_provider_with_multi_cities(self, api_client):
        token, _ = self._register(api_client)
        custom1 = f"TESTCity{uuid.uuid4().hex[:6]}"
        custom2 = f"TESTCity{uuid.uuid4().hex[:6]}"
        payload = {
            "name": "TEST_Multi City Studio",
            "category": "Photographers",
            "cities": [custom1, custom2],
            "phone": "+919999999999",
            "whatsapp": "+919999999999",
            "price_min": 1000,
            "price_max": 5000,
            "bio": "TEST bio",
        }
        r = api_client.post(f"{API}/providers", json=payload,
                            headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        provider = r.json()
        assert provider["cities"] == [custom1, custom2]

        # Verify filter on custom1 returns this provider
        r2 = api_client.get(f"{API}/providers", params={"city": custom1})
        assert r2.status_code == 200
        names = [p["name"] for p in r2.json()]
        assert "TEST_Multi City Studio" in names

        # Cleanup: drop the custom provider via direct delete is not implemented.
        # We leave TEST_ prefixed data; safe and identifiable.

    def test_create_provider_rejects_empty_cities(self, api_client):
        token, _ = self._register(api_client)
        payload = {
            "name": "TEST_NoCities",
            "category": "Photographers",
            "cities": [],
            "phone": "+919999999999",
            "whatsapp": "+919999999999",
            "price_min": 1000,
            "price_max": 5000,
        }
        r = api_client.post(f"{API}/providers", json=payload,
                            headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 422, f"Expected validation error for empty cities, got {r.status_code}: {r.text}"

    def test_create_provider_requires_auth(self, api_client):
        payload = {"name": "x", "category": "Bakers", "cities": ["Delhi"],
                   "phone": "+91", "whatsapp": "+91", "price_min": 1, "price_max": 2}
        r = api_client.post(f"{API}/providers", json=payload)
        assert r.status_code == 401

    def test_seeker_cannot_create_provider(self, api_client, demo_token):
        payload = {"name": "x", "category": "Bakers", "cities": ["Delhi"],
                   "phone": "+91", "whatsapp": "+91", "price_min": 1, "price_max": 2}
        r = api_client.post(f"{API}/providers", json=payload,
                            headers={"Authorization": f"Bearer {demo_token}"})
        assert r.status_code == 403
