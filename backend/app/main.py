from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db, engine
from app.models import Base, CommLog
from app.schemas import TranscriptRequest
from app.services import generate_summary
from app.config import USE_OPENAI_API

# Drop and recreate tables to ensure schema changes are applied
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmileScript API",
    description="API for SmileScript, an AI-powered call summarizer for dental clinics",
    version="0.1.0",
)

# Print startup message about OpenAI API status
if USE_OPENAI_API:
    print("🤖 OpenAI API is ENABLED for summarization")
else:
    print("🔄 Using MOCK summarization (OpenAI API is disabled)")

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
    # Generate summary using the service (OpenAI or mock)
    summary = generate_summary(request.transcript)

    # Create a new CommLog instance
    comm_log = CommLog(
        transcript=request.transcript,
        summary=summary
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
        "created_at": comm_log.created_at,
        "updated_at": comm_log.updated_at
    }


@app.get("/summaries", response_model=list[dict])
async def get_summaries(db: Session = Depends(get_db)):
    """
    Get all stored transcript summaries.

    This endpoint retrieves all CommLog entries from the database.

    Args:
        db: Database session dependency

    Returns:
        A list of CommLog records with id, transcript, summary, and created_at
    """
    # Query all CommLog entries
    comm_logs = db.query(CommLog).all()

    # Return the list of records
    return [
        {
            "id": log.id,
            "transcript": log.transcript,
            "summary": log.summary,
            "created_at": log.created_at,
            "updated_at": log.updated_at
        }
        for log in comm_logs
    ]


@app.put("/re-summarize/{id}", response_model=dict)
async def re_summarize(id: int, db: Session = Depends(get_db)):
    """
    Re-generate the summary for a specific transcript.

    This endpoint looks up a CommLog record by ID, generates a new summary,
    and updates the record in the database.

    Args:
        id: The ID of the CommLog record to update
        db: Database session dependency

    Returns:
        The updated CommLog record
    """
    # Look up the record by ID
    comm_log = db.query(CommLog).filter(CommLog.id == id).first()

    # If record not found, raise 404 error
    if not comm_log:
        raise HTTPException(status_code=404, detail=f"CommLog with ID {id} not found")

    # Generate a new summary using the service (OpenAI or mock)
    new_summary = generate_summary(comm_log.transcript)

    # Update the summary and updated_at fields
    comm_log.summary = new_summary
    # Explicitly set updated_at to current UTC time to ensure it's newer than created_at
    comm_log.updated_at = datetime.now(timezone.utc)

    # Commit the changes to the database
    db.commit()
    db.refresh(comm_log)

    # Return the updated record
    return {
        "id": comm_log.id,
        "transcript": comm_log.transcript,
        "summary": comm_log.summary,
        "created_at": comm_log.created_at,
        "updated_at": comm_log.updated_at
    }
