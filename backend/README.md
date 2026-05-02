# ChainLens Backend

Supply chain traceability backend for ChainLens. Indexes blockchain events from Ethereum (Sepolia testnet) and serves analytics via a FastAPI REST API.

## Prerequisites

- Python 3.11+
- (Optional) Docker
- (Optional) PostgreSQL (SQLite is used by default for local development)

## Local Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Run the application:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Run tests:
   ```bash
   pytest
   ```

## Docker

Build and run with Docker:
```bash
docker build -t chainlens-backend .
docker run -p 8000:8000 --env-file .env chainlens-backend
```

## Database Migrations

Initialize Alembic (first time only):
```bash
alembic init alembic
```

Generate a migration:
```bash
alembic revision --autogenerate -m "Initial migration"
```

Run migrations:
```bash
alembic upgrade head
```

## Project Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   ├── product.py
│   │   └── shipment.py
│   ├── api/
│   │   └── routes/
│   │       ├── products.py
│   │       ├── shipments.py
│   │       └── analytics.py
│   └── services/
│       ├── indexer.py
│       └── analytics.py
├── tests/
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

## License

MIT
