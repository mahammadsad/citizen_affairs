from functools import lru_cache
from pydantic import HttpUrl, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: HttpUrl
    supabase_secret_key: SecretStr
    automation_webhook_secret: SecretStr
    gemini_api_key: SecretStr
    gemini_research_model: str
    gemini_writing_model: str
    gemini_factcheck_model: str
    gemini_api_base: HttpUrl = "https://generativelanguage.googleapis.com/v1beta"
    tavily_api_key: SecretStr | None = None
    official_feed_urls: str = ""
    request_timeout_seconds: float = 45
    api_concurrency: int = 2
    max_topics_per_run: int = 20

    @field_validator("gemini_research_model", "gemini_writing_model", "gemini_factcheck_model")
    @classmethod
    def model_name_is_configured(cls, value: str) -> str:
        if not value.strip() or "/" in value or ".." in value:
            raise ValueError("model names must be configured as safe provider model IDs")
        return value.strip()

    @property
    def feeds(self) -> list[str]:
        return [item.strip() for item in self.official_feed_urls.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
