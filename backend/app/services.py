from openai import OpenAI
from app.config import USE_OPENAI_API, OPENAI_API_KEY, OPENAI_MODEL, logger


def generate_summary(text: str) -> str:
    """
    Generate a summary of the provided transcript text.

    This function serves as a facade that either calls the OpenAI API
    or falls back to a mock implementation based on configuration.

    Args:
        text: The transcript text to summarize

    Returns:
        A summary of the transcript
    """
    if USE_OPENAI_API and OPENAI_API_KEY:
        return _generate_ai_summary(text)
    else:
        return _generate_mock_summary(text)


def _generate_ai_summary(text: str) -> str:
    """
    Generate a summary using OpenAI's API.

    Args:
        text: The transcript text to summarize

    Returns:
        An AI-generated summary of the transcript

    Raises:
        Falls back to mock summary on any exception
    """
    try:
        # Initialize OpenAI client with API key
        client = OpenAI(api_key=OPENAI_API_KEY)

        # Call OpenAI API with dental-specific prompt
        response = client.chat.completions.create(
            model=OPENAI_MODEL,  # Use model from configuration
            messages=[
                {
                    "role": "system",
                    "content": "You are a dental clinic assistant. Summarize the following call transcript concisely, highlighting key patient information, concerns, and any scheduled appointments."
                },
                {"role": "user", "content": text}
            ],
            max_tokens=150,
            temperature=0.5,  # Lower temperature for more focused summaries
        )

        # Extract and clean the generated summary
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Log the error with details and fall back to mock summary
        logger.error(f"Error calling OpenAI API: {e}")
        return _generate_mock_summary(text)


def _generate_mock_summary(text: str) -> str:
    """
    Generate a simple mock summary for development and testing.

    This function creates a basic summary by extracting the beginning
    of the transcript text when OpenAI API is not available.

    Args:
        text: The transcript text to summarize

    Returns:
        A mock summary containing the first 50 characters
    """
    # Extract first 50 characters and add ellipsis if text is longer
    first_50_chars = text[:50] + "..." if len(text) > 50 else text
    return f"Summary of: {first_50_chars}"
