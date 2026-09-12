from functools import lru_cache
import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    openrouter_api_key: str
    openrouter_base_url: str
    ai_model: str
    ai_service_name: str

    def __init__(self) -> None:
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.openrouter_base_url = os.getenv(
            "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
        )
        self.ai_model = os.getenv("AI_MODEL", "openrouter/free")
        self.ai_service_name = os.getenv("AI_SERVICE_NAME", "sitesync-ai")


@lru_cache
def get_settings() -> Settings:
    return Settings()
