import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Application configuration
APP_ENV = os.getenv("APP_ENV", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smile_script.db")

# OpenAI API configuration
USE_OPENAI_API = os.getenv("USE_OPENAI_API", "false").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Validate OpenAI configuration
if USE_OPENAI_API and not OPENAI_API_KEY:
    logger.warning("USE_OPENAI_API is set to True but OPENAI_API_KEY is not provided")
    logger.warning("Falling back to mock summarization")
    USE_OPENAI_API = False
elif USE_OPENAI_API:
    logger.info(f"OpenAI API enabled with model: {OPENAI_MODEL}")
else:
    logger.info("Using mock summarization (OpenAI API disabled)")
