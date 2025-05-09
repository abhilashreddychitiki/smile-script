from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import TranscriptRequest

app = FastAPI(
    title="SmileScript API",
    description="API for SmileScript, an AI-powered call summarizer for dental clinics",
    version="0.1.0",
)

# Add CORS middleware to allow frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    Root endpoint that returns a welcome message.
    """
    return {"message": "Welcome to SmileScript API"}


@app.post("/summarize", response_model=dict)
async def summarize_transcript(request: TranscriptRequest):
    """
    Summarize a dental call transcript.
    
    This endpoint accepts a transcript and returns a summary of the conversation.
    
    Args:
        request: The transcript request object containing the text to summarize
        
    Returns:
        A JSON object containing the summary
    """
    # For now, just return a mocked summary with the first 50 characters
    first_50_chars = request.transcript[:50] + "..." if len(request.transcript) > 50 else request.transcript
    
    return {
        "summary": f"Summary of: {first_50_chars}"
    }
