import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force SQLite for tests so app.core.database never tries to import psycopg2.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
# Prevent live RPC connections during tests.
os.environ["SEPOLIA_RPC_URL"] = ""

from app.core.database import Base, get_db
from app.main import app
import app.main as main_module
import app.core.database as db_module

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Monkey-patch the production engine so startup events and metadata use the test engine
main_module.engine = engine
db_module.engine = engine


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client_fixture(db_session):
    with TestClient(app) as c:
        yield c
