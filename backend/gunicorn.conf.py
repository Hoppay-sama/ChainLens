import multiprocessing
import os

bind = "0.0.0.0:8000"

# Render free tier = 512MB RAM
# Each Uvicorn worker loads full FastAPI + SQLAlchemy + Web3 stack (~250-300MB)
# Set to 1 worker to stay within 512MB limit
workers = 1

# Override with env var if you upgrade to a larger instance
if os.getenv("GUNICORN_WORKERS"):
    workers = int(os.getenv("GUNICORN_WORKERS"))

worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
accesslog = "-"
errorlog = "-"
