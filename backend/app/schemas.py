from pydantic import BaseModel


class TranscriptRequest(BaseModel):
    """
    Schema for transcript input request.
    
    Attributes:
        transcript: The text transcript to be processed
    """
    transcript: str
