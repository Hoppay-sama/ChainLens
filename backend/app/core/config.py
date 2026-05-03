from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    environment: str = Field(default="development")
    database_url: str = Field(default="sqlite:///./veritras.db")
    # Default to empty string. In production, CORS_ORIGINS must be set explicitly.
    cors_origins: str = Field(default="")
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


settings = Settings()
