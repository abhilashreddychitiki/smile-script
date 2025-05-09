from openai import OpenAI
from app.config import USE_OPENAI_API, OPENAI_API_KEY


def generate_summary(text: str) -> str:
    """
    Generate a summary of the provided text.
    
    If USE_OPENAI_API is True, uses OpenAI's API to generate a summary.
    Otherwise, returns a mocked summary.
    
    Args:
        text: The text to summarize
        
    Returns:
        A summary of the text
    """
    if USE_OPENAI_API:
        try:
            # Initialize OpenAI client
            client = OpenAI(api_key=OPENAI_API_KEY)
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a dental clinic assistant. Summarize the following call transcript concisely."},
                    {"role": "user", "content": text}
                ],
                max_tokens=150,
                temperature=0.5,
            )
            
            # Extract and return the summary
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Log the error and fall back to mock summary
            print(f"Error calling OpenAI API: {e}")
            return _generate_mock_summary(text)
    else:
        # Return mock summary
        return _generate_mock_summary(text)


def _generate_mock_summary(text: str) -> str:
    """
    Generate a mock summary based on the first 50 characters of the text.
    
    Args:
        text: The text to summarize
        
    Returns:
        A mock summary
    """
    first_50_chars = text[:50] + "..." if len(text) > 50 else text
    return f"Summary of: {first_50_chars}"
