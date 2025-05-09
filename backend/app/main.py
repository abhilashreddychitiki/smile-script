from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db, engine
from app.models import Base, CommLog
from app.schemas import TranscriptRequest

# Create tables
Base.metadata.create_all(bind=engine)

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
async def summarize_transcript(request: TranscriptRequest, db: Session = Depends(get_db)):
    """
    Summarize a dental call transcript and store it in the database.

    This endpoint accepts a transcript, generates a summary, and stores both in the database.

    Args:
        request: The transcript request object containing the text to summarize
        db: Database session dependency

    Returns:
        A JSON object containing the stored record details
    """
    # For now, just create a mocked summary with the first 50 characters
    first_50_chars = request.transcript[:50] + "..." if len(request.transcript) > 50 else request.transcript
    mocked_summary = f"Summary of: {first_50_chars}"

    # Create a new CommLog instance
    comm_log = CommLog(
        transcript=request.transcript,
        summary=mocked_summary
    )

    # Add and commit to the database
    db.add(comm_log)
    db.commit()
    db.refresh(comm_log)

    # Return the stored record details
    return {
        "id": comm_log.id,
        "transcript": comm_log.transcript,
        "summary": comm_log.summary,
        "created_at": comm_log.created_at
    }
