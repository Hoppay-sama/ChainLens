from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    database_url: str = Field(default="sqlite:///./chainlens.db")
    sepolia_rpc_url: str = Field(default="")
    product_registry_contract: str = Field(default="")
    shipment_tracker_contract: str = Field(default="")
    indexer_poll_interval: int = Field(default=15)
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
