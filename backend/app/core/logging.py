import json
import logging
import os
import sys

# Fields present on every LogRecord by default — skip when merging extras.
_RESERVED = frozenset({
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "message", "taskName",
})


class JsonFormatter(logging.Formatter):
    """Emit one JSON object per log record to stdout.

    Any key passed via extra={} lands as a top-level JSON field, making log
    lines queryable by key in Render, Datadog, Loki, etc.
    """

    def format(self, record: logging.LogRecord) -> str:
        record.message = record.getMessage()

        log_obj: dict = {
            "time": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.message,
        }

        for key, val in record.__dict__.items():
            if key not in _RESERVED and not key.startswith("_"):
                log_obj[key] = val

        if record.exc_info:
            log_obj["exc_info"] = self.formatException(record.exc_info)

        return json.dumps(log_obj, default=str)


class LazyStdoutHandler(logging.StreamHandler):
    """StreamHandler that resolves sys.stdout on every emit.

    The standard StreamHandler captures sys.stdout at construction time.
    This subclass always writes to whatever sys.stdout currently is, which
    ensures pytest's capfd/capsys capture works correctly even when the
    handler is constructed before the test's capture fixture activates.
    """

    def __init__(self):
        # Pass None so the parent doesn't lock in a stream reference.
        super().__init__(stream=None)

    @property
    def stream(self):  # type: ignore[override]
        return sys.stdout

    @stream.setter
    def stream(self, value):
        # Parent __init__ calls self.stream = stream; ignore that assignment.
        pass


_log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

LOGGING_CONFIG: dict = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "app.core.logging.JsonFormatter",
            "datefmt": "%Y-%m-%dT%H:%M:%S",
        },
    },
    "handlers": {
        "stdout": {
            "()": "app.core.logging.LazyStdoutHandler",
            "formatter": "json",
        },
    },
    "loggers": {
        "veritras": {
            "handlers": ["stdout"],
            "level": _log_level,
            "propagate": True,  # allow caplog (root-attached) to capture in tests
        },
        "uvicorn.access": {
            # Suppress uvicorn's duplicate access logs — we emit our own in log_requests.
            "handlers": [],
            "level": "WARNING",
            "propagate": False,
        },
    },
    "root": {
        "handlers": [],  # no root handler — avoids duplicate output; caplog attaches here
        "level": "WARNING",
    },
}
