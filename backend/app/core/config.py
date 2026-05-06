import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    environment: str = Field(default="development")
    database_url: str = Field(default="sqlite:///./veritras.db")
    # Plural form — preferred. Falls back to cors_origin if empty.
    cors_origins: str = Field(default="")
    # Singular form — backward compatibility for Render Dashboard configs.
    cors_origin: str = Field(default="http://localhost:5173")
    sepolia_rpc_url: str = Field(default="")
    product_registry_contract: str = Field(default="")
    shipment_tracker_contract: str = Field(default="")
    indexer_poll_interval: int = Field(default=15)
    indexer_start_block: int = Field(default=0)
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def effective_cors_origins(self) -> str:
        """Return the active CORS origins string.

        Priority:
        1. CORS_ORIGINS environment variable (for Render Dashboard)
        2. cors_origins field (from .env file)
        3. CORS_ORIGIN environment variable (backward compat)
        4. cors_origin field default (localhost for local dev)
        """
        if "CORS_ORIGINS" in os.environ:
            return os.environ["CORS_ORIGINS"]
        if self.cors_origins:
            return self.cors_origins
        if "CORS_ORIGIN" in os.environ:
            return os.environ["CORS_ORIGIN"]
        return self.cors_origin


settings = Settings()
