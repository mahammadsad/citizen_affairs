from functools import lru_cache
from pydantic import HttpUrl, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_OFFICIAL_SOURCES = ",".join((
    "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1",
    "https://ssc.gov.in/",
    "https://www.upsc.gov.in/",
))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase is optional for the GitHub-only draft pipeline. It remains available
    # for the future private editorial backend without being required for drafts.
    supabase_url: HttpUrl | None = None
    supabase_secret_key: SecretStr | None = None
    automation_webhook_secret: SecretStr | None = None

    gemini_api_key: SecretStr
    gemini_research_model: str
    gemini_writing_model: str
    gemini_factcheck_model: str
    gemini_api_base: HttpUrl = "https://generativelanguage.googleapis.com/v1beta"
    tavily_api_key: SecretStr | None = None

    # The legacy variable name is retained for compatibility. Values may now be
    # RSS/Atom feeds or official listing pages such as SSC/UPSC notice boards.
    official_feed_urls: str = DEFAULT_OFFICIAL_SOURCES
    request_timeout_seconds: float = 45
    api_concurrency: int = 2
    max_topics_per_run: int = 20
    max_drafts_per_run: int = 3
    max_candidate_attempts_per_run: int = 3
    topic_processing_timeout_seconds: float = 360
    related_source_limit: int = 4
    max_source_bytes: int = 8_000_000
    max_source_text_chars: int = 45_000
    draft_languages: str = "bn"
    seo_search_results: int = 5

    @field_validator("supabase_url", "supabase_secret_key", "automation_webhook_secret", "tavily_api_key", mode="before")
    @classmethod
    def blank_optional_values_become_none(cls, value):
        if value is None or (isinstance(value, str) and not value.strip()):
            return None
        return value

    @field_validator("official_feed_urls", mode="before")
    @classmethod
    def official_sources_have_safe_defaults(cls, value):
        if value is None or not str(value).strip():
            return DEFAULT_OFFICIAL_SOURCES
        return value

    @field_validator("gemini_research_model", "gemini_writing_model", "gemini_factcheck_model")
    @classmethod
    def model_name_is_configured(cls, value: str) -> str:
        if not value.strip() or "/" in value or ".." in value:
            raise ValueError("model names must be configured as safe provider model IDs")
        return value.strip()

    @field_validator(
        "max_topics_per_run",
        "max_drafts_per_run",
        "max_candidate_attempts_per_run",
        "related_source_limit",
        "seo_search_results",
    )
    @classmethod
    def positive_limits(cls, value: int) -> int:
        if value < 1:
            raise ValueError("automation limits must be positive")
        return value

    @field_validator("topic_processing_timeout_seconds")
    @classmethod
    def positive_topic_timeout(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("topic processing timeout must be positive")
        return value

    @property
    def feeds(self) -> list[str]:
        return [item.strip() for item in self.official_feed_urls.split(",") if item.strip()]

    @property
    def languages(self) -> list[str]:
        allowed = {"en", "bn", "hi"}
        languages: list[str] = []
        for item in self.draft_languages.split(","):
            language = item.strip().lower()
            if language and language in allowed and language not in languages:
                languages.append(language)
        return languages or ["bn"]

    @property
    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_secret_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
