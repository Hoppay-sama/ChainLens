import multiprocessing
import os

bind = "0.0.0.0:8000"

# Cap workers at 2 for memory-constrained environments (e.g., Render free tier = 512MB)
# Each worker loads the full FastAPI + SQLAlchemy + Web3 stack
workers = min(multiprocessing.cpu_count() * 2 + 1, 2)

# Override with env var if needed: GUNICORN_WORKERS=1
if os.getenv("GUNICORN_WORKERS"):
    workers = int(os.getenv("GUNICORN_WORKERS"))

worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
accesslog = "-"
errorlog = "-"
