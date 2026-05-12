import json
import logging
import pytest
from app.core.logging import JsonFormatter, LOGGING_CONFIG


def make_record(msg="hello", level=logging.INFO, **extra):
    record = logging.LogRecord(
        name="veritras.test",
        level=level,
        pathname=__file__,
        lineno=1,
        msg=msg,
        args=(),
        exc_info=None,
    )
    for k, v in extra.items():
        setattr(record, k, v)
    return record


def test_json_formatter_returns_valid_json():
    formatter = JsonFormatter()
    output = formatter.format(make_record("test message"))
    parsed = json.loads(output)  # must not raise
    assert isinstance(parsed, dict)


def test_json_formatter_required_fields():
    formatter = JsonFormatter()
    parsed = json.loads(formatter.format(make_record("test message")))
    assert parsed["level"] == "INFO"
    assert parsed["logger"] == "veritras.test"
    assert parsed["message"] == "test message"
    assert "time" in parsed


def test_json_formatter_merges_extra_fields():
    formatter = JsonFormatter()
    record = make_record("request", method="GET", path="/health", status=200)
    parsed = json.loads(formatter.format(record))
    assert parsed["method"] == "GET"
    assert parsed["path"] == "/health"
    assert parsed["status"] == 200


def test_json_formatter_includes_exc_info():
    formatter = JsonFormatter()
    try:
        raise ValueError("boom")
    except ValueError:
        import sys
        record = logging.LogRecord(
            name="veritras.test", level=logging.ERROR,
            pathname=__file__, lineno=1,
            msg="error occurred", args=(), exc_info=sys.exc_info(),
        )
    parsed = json.loads(formatter.format(record))
    assert "exc_info" in parsed
    assert "ValueError" in parsed["exc_info"]


def test_logging_config_is_dict_with_required_keys():
    assert isinstance(LOGGING_CONFIG, dict)
    assert LOGGING_CONFIG["version"] == 1
    assert "veritras" in LOGGING_CONFIG["loggers"]
    assert "uvicorn.access" in LOGGING_CONFIG["loggers"]


def test_log_requests_middleware_emits_structured_json(capfd):
    """Each HTTP request must produce a JSON log line with required structured fields."""
    import io
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app, raise_server_exceptions=False)
    client.get("/health")
    captured = capfd.readouterr()
    lines = [ln for ln in captured.out.splitlines() if ln.strip().startswith("{")]
    request_lines = []
    for ln in lines:
        try:
            obj = json.loads(ln)
            if obj.get("message") == "request":
                request_lines.append(obj)
        except json.JSONDecodeError:
            pass
    assert request_lines, "No 'request' log line found in stdout"
    req = request_lines[-1]
    assert req["method"] == "GET"
    assert req["path"] == "/health"
    assert "status" in req
    assert "duration_ms" in req
