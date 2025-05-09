import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI API configuration
USE_OPENAI_API = os.getenv("USE_OPENAI_API", "false").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Validate configuration
if USE_OPENAI_API and not OPENAI_API_KEY:
    print("WARNING: USE_OPENAI_API is set to True but OPENAI_API_KEY is not provided.")
    print("Falling back to mock summarization.")
    USE_OPENAI_API = False
