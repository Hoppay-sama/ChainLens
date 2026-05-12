import logging
import logging.config
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from web3 import Web3

from app.core.config import settings
from app.core.database import engine, Base
from app.core.limiter import limiter
from app.core.logging import LOGGING_CONFIG
from app.core.security import SecurityHeadersMiddleware
from app.api.routes import auth, products, shipments, analytics
from app.services.indexer import EventIndexer, load_indexer_state

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("veritras.api")

w3: Optional[Web3] = None
indexer: Optional[EventIndexer] = None
if settings.sepolia_rpc_url:
    w3 = Web3(Web3.HTTPProvider(settings.sepolia_rpc_url))


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    global indexer
    if settings.sepolia_rpc_url and settings.product_registry_contract and settings.shipment_tracker_contract:
        try:
            indexer = EventIndexer()
            indexer.start()
            logger.info("Blockchain indexer started")
        except Exception as e:
            logger.error(f"Failed to start blockchain indexer: {e}")
    else:
        logger.info("Blockchain indexer skipped — missing RPC URL or contract addresses")

    yield

    if indexer:
        indexer.stop()
        logger.info("Blockchain indexer stopped")


app = FastAPI(title="Veritras API", version="0.1.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

def parse_cors_origins(cors_origins: str) -> list[str]:
    origins = [origin.strip().rstrip("/") for origin in cors_origins.split(",") if origin.strip()]
    if "*" in origins and len(origins) > 1:
        logger.warning("Wildcard '*' mixed with explicit origins; treating as allow-all")
    logger.info("Parsed CORS origins: %s", origins)
    return origins


cors_raw = settings.effective_cors_origins
logger.info("CORS config — raw value: %r", cors_raw)

origins = parse_cors_origins(cors_raw)
has_wildcard = "*" in origins

if settings.is_production and (not origins or has_wildcard):
    raise RuntimeError(
        "CORS_ORIGINS must be set to explicit origins in production. "
        "Wildcard '*' is not allowed with credentials enabled."
    )

allow_credentials = not has_wildcard

if allow_credentials and has_wildcard:
    logger.warning("CORS allow_credentials=True is used with wildcard origin '*'. This is a security risk.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

app.add_middleware(SecurityHeadersMiddleware)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    logger.info(
        "request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": round(duration_ms, 2),
            "client_ip": request.client.host if request.client else None,
        },
    )
    return response


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(shipments.router, prefix="/shipments", tags=["shipments"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/health/indexer")
def health_indexer():
    """Expose blockchain indexer status and last processed block."""
    if indexer is None:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_started",
                "reason": "Missing SEPOLIA_RPC_URL or contract address env vars",
            },
        )

    state = load_indexer_state()
    return {
        "status": "running" if indexer.running else "stopped",
        "last_processed_block": state.get("last_processed_block"),
        "poll_interval_seconds": indexer.poll_interval,
        "product_registry": indexer.product_registry_address,
        "shipment_tracker": indexer.shipment_tracker_address,
    }


@app.get("/health")
def health_check():
    db_status = "disconnected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    web3_status = "disconnected"
    if w3 is not None:
        try:
            if w3.is_connected():
                web3_status = "connected"
        except Exception:
            web3_status = "disconnected"

    status = "ok" if db_status == "connected" and web3_status == "connected" else "degraded"
    status_code = 200 if status == "ok" else 503
    return JSONResponse(
        status_code=status_code,
        content={"status": status, "database": db_status, "web3": web3_status},
    )


@app.get("/health/cors")
def health_cors():
    """Expose currently configured CORS origins for production debugging."""
    return {
        "cors_origins_raw": settings.effective_cors_origins,
        "cors_origins_parsed": origins,
        "allow_credentials": allow_credentials,
        "environment": settings.environment,
    }
