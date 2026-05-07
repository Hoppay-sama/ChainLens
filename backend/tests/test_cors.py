"""
Regression tests for CORS configuration.

Ensures the backend does not block the production frontend due to
missing or mis-parsed CORS_ORIGINS environment variables.
"""

import importlib
import logging

import pytest
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app.main import app as main_app, parse_cors_origins, origins as configured_origins
from app.models.product import Product
from app.models.shipment import Checkpoint
from datetime import datetime, timezone


# Determine a valid test origin based on the currently loaded app configuration.
# When allow_credentials=True with a wildcard fallback, compliant middleware
# reflects the actual origin instead of returning "*".
if configured_origins == ["*"]:
    TEST_ORIGIN = "https://veritras.vercel.app"
    EXPECTED_HEADER = "*"
    EXPECTED_CREDENTIALS = None
elif configured_origins:
    TEST_ORIGIN = configured_origins[0]
    EXPECTED_HEADER = TEST_ORIGIN
    EXPECTED_CREDENTIALS = "true"
else:
    # Empty origins fallback to allow_origins=["*"] but allow_credentials=True
    # Starlette reflects the request origin in this mode.
    TEST_ORIGIN = "https://veritras.vercel.app"
    EXPECTED_HEADER = TEST_ORIGIN
    EXPECTED_CREDENTIALS = "true"


@pytest.fixture(scope="function")
def seeded_db(db_session):
    """Seed the database with a product and checkpoint for CORS endpoint tests."""
    product = Product(
        product_id="0x" + "a" * 64,
        name="Test Product",
        description="A test product",
        metadata_uri="ipfs://test",
        manufacturer_address="0x1234567890123456789012345678901234567890",
        registered_at=datetime.now(timezone.utc),
        block_number=100,
        tx_hash="0xdeadbeef",
    )
    db_session.add(product)
    db_session.commit()

    checkpoint = Checkpoint(
        product_id=product.product_id,
        location="Test Location",
        status="1",
        handler_address="0xhandler",
        notes="Test note",
        timestamp=datetime.now(timezone.utc),
        block_number=101,
        tx_hash="0xcafebabe",
    )
    db_session.add(checkpoint)
    db_session.commit()
    return db_session


def _build_app_with_cors(cors_origins_str: str) -> FastAPI:
    """Create a minimal FastAPI app with CORS middleware using production logic."""
    test_app = FastAPI()
    origins = parse_cors_origins(cors_origins_str)
    has_wildcard = "*" in origins
    allow_credentials = not has_wildcard

    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins else ["*"],
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @test_app.get("/products")
    def products():
        return []

    @test_app.get("/analytics/kpis")
    def kpis():
        return {}

    return test_app


class TestCorsHeadersOnResponses:
    """Verify CORS headers are returned by real API endpoints."""

    def test_products_preflight_includes_allow_origin(self, client_fixture, seeded_db):
        response = client_fixture.options(
            "/products/",
            headers={
                "Origin": TEST_ORIGIN,
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS
        else:
            assert "access-control-allow-credentials" not in response.headers

    def test_products_get_includes_allow_origin(self, client_fixture, seeded_db):
        response = client_fixture.get(
            "/products/",
            headers={"Origin": TEST_ORIGIN},
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == EXPECTED_HEADER
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS
        else:
            assert "access-control-allow-credentials" not in response.headers

    def test_analytics_kpis_preflight_includes_allow_origin(self, client_fixture, seeded_db):
        response = client_fixture.options(
            "/analytics/kpis",
            headers={
                "Origin": TEST_ORIGIN,
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS
        else:
            assert "access-control-allow-credentials" not in response.headers

    def test_analytics_kpis_get_includes_allow_origin(self, client_fixture, seeded_db):
        response = client_fixture.get(
            "/analytics/kpis",
            headers={"Origin": TEST_ORIGIN},
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == EXPECTED_HEADER
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS
        else:
            assert "access-control-allow-credentials" not in response.headers

    def test_auth_nonce_preflight_includes_allow_origin(self, client_fixture):
        """Regression: auth endpoints must receive CORS headers for wallet login."""
        response = client_fixture.options(
            "/auth/nonce",
            headers={
                "Origin": TEST_ORIGIN,
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS

    def test_auth_verify_preflight_includes_allow_origin(self, client_fixture):
        """Regression: POST /auth/verify was blocked by CORS in production."""
        response = client_fixture.options(
            "/auth/verify",
            headers={
                "Origin": TEST_ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS

    def test_auth_verify_post_includes_allow_origin(self, client_fixture):
        """Regression: POST /auth/verify must return CORS headers on actual request."""
        response = client_fixture.post(
            "/auth/verify",
            headers={"Origin": TEST_ORIGIN},
            json={"message": "invalid", "signature": "0xdeadbeef"},
        )
        # We expect 400/401, but CORS headers must be present regardless
        assert response.status_code in (400, 401)
        assert response.headers.get("access-control-allow-origin") == EXPECTED_HEADER
        if EXPECTED_CREDENTIALS:
            assert response.headers.get("access-control-allow-credentials") == EXPECTED_CREDENTIALS


class TestCorsOriginParsing:
    """Unit tests for parse_cors_origins."""

    def test_comma_separated_origins(self):
        result = parse_cors_origins("http://localhost:5173,https://example.com")
        assert result == ["http://localhost:5173", "https://example.com"]

    def test_whitespace_is_stripped(self):
        result = parse_cors_origins("  http://localhost:5173  ,  https://example.com  ")
        assert result == ["http://localhost:5173", "https://example.com"]

    def test_empty_strings_are_filtered(self):
        result = parse_cors_origins("http://localhost:5173,,https://example.com")
        assert result == ["http://localhost:5173", "https://example.com"]

    def test_wildcard_is_preserved(self):
        result = parse_cors_origins("*")
        assert result == ["*"]

    def test_wildcard_mixed_with_explicit_origins_triggers_warning(self, caplog):
        with caplog.at_level(logging.WARNING, logger="veritras.api"):
            result = parse_cors_origins("*,https://example.com")
        assert result == ["*", "https://example.com"]
        assert "Wildcard '*' mixed with explicit origins" in caplog.text


class TestCorsProductionScenario:
    """Simulate explicit production CORS_ORIGINS configuration."""

    def test_production_origin_is_allowed(self):
        app = _build_app_with_cors("https://veritras.vercel.app")
        client = TestClient(app)
        response = client.get(
            "/products",
            headers={"Origin": "https://veritras.vercel.app"},
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == "https://veritras.vercel.app"
        assert response.headers.get("access-control-allow-credentials") == "true"

    def test_unknown_origin_does_not_receive_cors_headers(self):
        app = _build_app_with_cors("https://veritras.vercel.app")
        client = TestClient(app)
        response = client.get(
            "/products",
            headers={"Origin": "https://evil.com"},
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" not in response.headers

    def test_preflight_unknown_origin_does_not_receive_allow_origin_header(self):
        app = _build_app_with_cors("https://veritras.vercel.app")
        client = TestClient(app)
        response = client.options(
            "/products",
            headers={
                "Origin": "https://evil.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Starlette returns 400 for disallowed preflight requests
        assert response.status_code == 400
        assert "access-control-allow-origin" not in response.headers


class TestCorsWildcardBehavior:
    """Verify wildcard-only CORS behavior."""

    def test_wildcard_allows_any_origin(self):
        app = _build_app_with_cors("*")
        client = TestClient(app)
        response = client.get(
            "/products",
            headers={"Origin": "https://any-origin.com"},
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == "*"

    def test_wildcard_does_not_allow_credentials(self):
        app = _build_app_with_cors("*")
        client = TestClient(app)
        response = client.get(
            "/products",
            headers={"Origin": "https://any-origin.com"},
        )
        assert response.status_code == 200
        assert "access-control-allow-credentials" not in response.headers


class TestCorsEdgeCases:
    """Edge cases in CORS_ORIGINS environment variable formatting."""

    def test_trailing_comma(self):
        result = parse_cors_origins("http://localhost:5173,")
        assert result == ["http://localhost:5173"]

    def test_extra_whitespace_around_commas(self):
        result = parse_cors_origins("http://localhost:5173 , https://example.com")
        assert result == ["http://localhost:5173", "https://example.com"]

    def test_trailing_slash_is_stripped(self):
        result = parse_cors_origins("https://veritras.vercel.app/")
        assert result == ["https://veritras.vercel.app"]

    def test_trailing_slashes_on_multiple_origins_are_stripped(self):
        result = parse_cors_origins("https://app.example.com/,https://admin.example.com/")
        assert result == ["https://app.example.com", "https://admin.example.com"]


class TestCorsOriginEnvFallback:
    """Verify CORS_ORIGIN env var is used when CORS_ORIGINS is absent."""

    def test_cors_origin_env_var_is_used_when_plural_missing(self, monkeypatch):
        import app.core.config as config_module

        monkeypatch.delenv("CORS_ORIGINS", raising=False)
        monkeypatch.setenv("CORS_ORIGIN", "https://legacy.app.com")
        monkeypatch.setattr(config_module.settings, "cors_origins", "")
        monkeypatch.setattr(config_module.settings, "cors_origin", "http://localhost:5173")
        assert config_module.settings.effective_cors_origins == "https://legacy.app.com"

    def test_cors_origins_env_var_takes_precedence_over_cors_origin(self, monkeypatch):
        import app.core.config as config_module

        monkeypatch.setenv("CORS_ORIGINS", "https://new.app.com")
        monkeypatch.setenv("CORS_ORIGIN", "https://legacy.app.com")
        assert config_module.settings.effective_cors_origins == "https://new.app.com"


class TestCorsDefaultConfig:
    """Verify the Settings default prevents silent CORS breakage."""

    def test_default_cors_origins_is_empty(self):
        from app.core.config import Settings

        field = Settings.model_fields["cors_origins"]
        assert field.default == ""

    def test_default_cors_origin_is_localhost(self):
        from app.core.config import Settings

        field = Settings.model_fields["cors_origin"]
        assert field.default == "http://localhost:5173"

    def test_effective_cors_origins_prefers_plural(self):
        from app.core.config import Settings

        s = Settings(cors_origins="https://a.com", cors_origin="https://b.com")
        assert s.effective_cors_origins == "https://a.com"

    def test_effective_cors_origins_falls_back_to_singular(self):
        from app.core.config import Settings

        s = Settings(cors_origins="", cors_origin="https://b.com")
        assert s.effective_cors_origins == "https://b.com"

    def test_effective_cors_origins_falls_back_to_default(self, monkeypatch):
        from app.core.config import Settings

        # Clear env vars so the local .env file cannot interfere with the fallback logic.
        monkeypatch.delenv("CORS_ORIGINS", raising=False)
        monkeypatch.delenv("CORS_ORIGIN", raising=False)
        s = Settings(cors_origins="", cors_origin="http://localhost:5173")
        assert s.effective_cors_origins == "http://localhost:5173"


class TestCorsProductionGuard:
    """Verify the app refuses to start in production with unsafe CORS config."""

    def test_empty_cors_origins_raises_runtime_error_in_production(self, monkeypatch):
        import app.main as main_module

        monkeypatch.setattr(main_module.settings, "environment", "production")
        monkeypatch.setattr(main_module.settings, "cors_origins", "")
        monkeypatch.setattr(main_module.settings, "cors_origin", "")
        with pytest.raises(RuntimeError, match="CORS_ORIGINS must be set"):
            importlib.reload(main_module)

        # Restore original state
        monkeypatch.setattr(main_module.settings, "environment", "development")
        monkeypatch.setattr(main_module.settings, "cors_origins", "")
        monkeypatch.setattr(main_module.settings, "cors_origin", "http://localhost:5173")
        importlib.reload(main_module)

    def test_wildcard_cors_origins_raises_runtime_error_in_production(self, monkeypatch):
        import app.main as main_module

        monkeypatch.setattr(main_module.settings, "environment", "production")
        monkeypatch.setattr(main_module.settings, "cors_origins", "*")
        monkeypatch.setattr(main_module.settings, "cors_origin", "")
        with pytest.raises(RuntimeError, match="CORS_ORIGINS must be set"):
            importlib.reload(main_module)

        # Restore original state
        monkeypatch.setattr(main_module.settings, "environment", "development")
        monkeypatch.setattr(main_module.settings, "cors_origins", "")
        monkeypatch.setattr(main_module.settings, "cors_origin", "http://localhost:5173")
        importlib.reload(main_module)


class TestApiResponseHeaders:
    """Verify API endpoints return correct response headers."""

    def test_products_content_type_is_json(self, client_fixture, seeded_db):
        response = client_fixture.get("/products/")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_shipments_content_type_is_json(self, client_fixture, seeded_db):
        response = client_fixture.get("/shipments/")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_analytics_kpis_content_type_is_json(self, client_fixture, seeded_db):
        response = client_fixture.get("/analytics/kpis")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_shipments_preflight_includes_cors_headers(self, client_fixture, seeded_db):
        response = client_fixture.options(
            "/shipments/",
            headers={
                "Origin": TEST_ORIGIN,
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers

    def test_analytics_export_preflight_includes_cors_headers(self, client_fixture, seeded_db):
        response = client_fixture.options(
            "/analytics/export",
            headers={
                "Origin": TEST_ORIGIN,
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers

    def test_health_cors_endpoint_exists(self, client_fixture):
        """Regression: /health/cors must expose current CORS config for debugging."""
        response = client_fixture.get("/health/cors")
        assert response.status_code == 200
        data = response.json()
        assert "cors_origins_raw" in data
        assert "cors_origins_parsed" in data
        assert "allow_credentials" in data
        assert "environment" in data
        assert isinstance(data["cors_origins_parsed"], list)
