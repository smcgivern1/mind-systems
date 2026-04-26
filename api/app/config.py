from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    session_secret: str
    cors_origin: str

    class Config:
        env_file = ".env"

settings = Settings()