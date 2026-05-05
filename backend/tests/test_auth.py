import pytest
from fastapi.testclient import TestClient


class TestAuthRouterMounted:
    """Regression: auth router must be mounted so /auth/* endpoints are reachable."""

    def test_get_auth_nonce_returns_200(self, client_fixture: TestClient):
        response = client_fixture.get("/auth/nonce")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "nonce" in data
        assert isinstance(data["nonce"], str)
        assert len(data["nonce"]) > 0

    def test_get_auth_nonce_includes_cache_control(self, client_fixture: TestClient):
        """Nonce must not be cached by browsers or proxies."""
        response = client_fixture.get("/auth/nonce")
        assert response.status_code == 200
        cc = response.headers.get("cache-control", "")
        assert "no-store" in cc, f"Expected Cache-Control to include no-store, got: {cc}"

    def test_post_auth_verify_exists_not_404(self, client_fixture: TestClient):
        """Verify endpoint must exist — invalid payload should yield 400/401, never 404."""
        response = client_fixture.post(
            "/auth/verify",
            json={"message": "invalid", "signature": "0xdeadbeef"},
        )
        assert response.status_code != 404, "Auth verify endpoint is not mounted (404)"
        assert response.status_code in (400, 401), f"Expected 400 or 401, got {response.status_code}"

    def test_post_auth_verify_rejects_invalid_nonce(self, client_fixture: TestClient):
        """Verify endpoint must reject messages with invalid/expired nonce."""
        response = client_fixture.post(
            "/auth/verify",
            json={
                "message": (
                    "veritras.io wants you to sign in with your Ethereum account:\n"
                    "0x1234567890123456789012345678901234567890\n\n"
                    "Sign in to Veritras\n\n"
                    "URI: https://veritras.io\n"
                    "Version: 1\n"
                    "Chain ID: 11155111\n"
                    "Nonce: 0000000000000000\n"
                    "Issued At: 2024-01-01T00:00:00+00:00"
                ),
                "signature": "0x" + "aa" * 65,
            },
        )
        assert response.status_code == 401, f"Expected 401 for invalid nonce, got {response.status_code}"
        detail = response.json().get("detail", "")
        assert "nonce" in detail.lower() or "invalid" in detail.lower()
