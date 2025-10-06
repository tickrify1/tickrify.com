from fastapi.testclient import TestClient
from backend.main import app


def test_signal_endpoint_shape():
    client = TestClient(app)
    r = client.get("/api/signal")
    assert r.status_code == 200
    data = r.json()
    assert set(["signal", "confidence", "reason", "timestamp"]).issubset(data.keys())
    assert data["signal"] in ["BUY", "SELL", "WAIT"]
    assert 0.0 <= float(data["confidence"]) <= 1.0
    assert isinstance(data["reason"], str)


