from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from app.main import app, w3 as original_w3
import app.main as main_module

client = TestClient(app)


def test_health_check_degraded():
    response = client.get("/health")
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"] == "connected"
    assert data["web3"] == "disconnected"


def test_health_check_ok():
    mock_w3 = MagicMock()
    mock_w3.is_connected.return_value = True
    main_module.w3 = mock_w3
    try:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
        assert data["web3"] == "connected"
    finally:
        main_module.w3 = original_w3
