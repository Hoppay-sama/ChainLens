import logging
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
from app.api.routes import products, shipments, analytics

logger = logging.getLogger("chainlens.api")

w3: Optional[Web3] = None
if settings.sepolia_rpc_url:
    w3 = Web3(Web3.HTTPProvider(settings.sepolia_rpc_url))


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="ChainLens API", version="0.1.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    client_host = request.client.host if request.client else None
    logger.info(
        "%s %s %s %s %s",
        request.method,
        request.url.path,
        response.status_code,
        f"{duration_ms:.2f}ms",
        client_host,
    )
    return response


app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(shipments.router, prefix="/shipments", tags=["shipments"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


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
