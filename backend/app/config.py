"""
Configuration management for Nexus backend
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # LLM API Keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    google_api_key: Optional[str] = None

    # Ollama Configuration
    ollama_api_url: Optional[str] = None
    ollama_model: Optional[str] = None

    # Mock LLM configuration for local testing (should remain disabled in production)
    enable_mock_llm: bool = False

    # Default LLM Configuration
    default_llm_provider: str = "openai"
    default_model: str = "gpt-4o-mini"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_password: Optional[str] = None

    # Rate Limiting
    api_rate_limit: int = 100
    api_rate_window: int = 60

    # Background Tasks
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Web Scraping
    user_agent: str = "Nexus AI Intelligence Bot 1.0"
    max_scrape_pages: int = 50
    scrape_timeout: int = 30

    # Document Processing
    max_file_size_mb: int = 100
    supported_file_types: str = "pdf,docx,xlsx,csv,txt"

    # Application Settings
    debug: bool = True
    log_level: str = "INFO"
    api_version: str = "v2"

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings"""
    return Settings()


def validate_llm_config() -> dict:
    """Validate LLM configuration and return available providers"""
    settings = get_settings()

    providers = {}

    if settings.openai_api_key:
        providers["openai"] = {
            "available": True,
            "models": ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]
        }

    if settings.anthropic_api_key:
        providers["anthropic"] = {
            "available": True,
            "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"]
        }

    if settings.google_api_key:
        providers["google"] = {
            "available": True,
            "models": ["gemini-2.0-flash-exp", "gemini-1.5-pro"]
        }

    return providers


def get_supported_file_extensions() -> list:
    """Get list of supported file extensions"""
    settings = get_settings()
    return [ext.strip() for ext in settings.supported_file_types.split(',')]
