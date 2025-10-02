
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    TAVILY_API_KEY: str
    HOST: str
    PORT: int
    CORS_ORIGINS: str
    GEMINI_MODEL: str
    TEMPERATURE: float
    MAX_TOKENS: int

    class Config:
        env_file = ".env"

settings = Settings()
