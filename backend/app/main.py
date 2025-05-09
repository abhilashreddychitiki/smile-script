from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db, engine
from app.models import Base, CommLog
from app.schemas import TranscriptRequest
from app.services import generate_summary

# Create tables if they don't exist
# Note: In production, use proper database migrations instead of this approach
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmileScript API",
    description="API for SmileScript, an AI-powered call summarizer for dental clinics",
    version="0.1.0",
)

# Startup message is now handled by the config module

# Configure CORS middleware for cross-origin requests
# Security note: In production, replace "*" with specific origins (e.g., ["https://yourdomain.com"])
# and limit methods and headers to only what's needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
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

    This endpoint processes the incoming transcript, generates an AI or mock summary,
    and persists both the original text and its summary for future reference.

    Args:
        request: The transcript request object containing the text to summarize
        db: Database session dependency

    Returns:
        A JSON object containing the complete stored record with ID and timestamps
    """
    # Validate input (additional validation beyond Pydantic's type checking)
    if not request.transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcript cannot be empty or contain only whitespace"
        )

    # Generate summary using the configured service (OpenAI API or mock)
    generated_summary = generate_summary(request.transcript)

    # Create a new communication log record
    comm_log = CommLog(
        transcript=request.transcript,
        summary=generated_summary
    )

    # Persist the record to the database
    db.add(comm_log)
    db.commit()
    db.refresh(comm_log)

    # Return the complete record with all fields
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
    Retrieve all stored transcript summaries.

    This endpoint fetches all communication log entries from the database,
    ordered by creation date (newest first).

    Args:
        db: Database session dependency

    Returns:
        A list of communication log records with all fields included
    """
    # Query all communication logs, ordered by creation date (newest first)
    comm_logs = db.query(CommLog).order_by(CommLog.created_at.desc()).all()

    # Transform database objects into response dictionaries
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


@app.put("/re-summarize/{comm_log_id}", response_model=dict)
async def re_summarize(comm_log_id: int, db: Session = Depends(get_db)):
    """
    Re-generate the summary for a specific transcript.

    This endpoint looks up a CommLog record by ID, generates a new summary,
    and updates the record in the database.

    Args:
        comm_log_id: The ID of the CommLog record to update
        db: Database session dependency

    Returns:
        The updated CommLog record with new summary and timestamps
    """
    # Look up the communication log record by ID
    comm_log = db.query(CommLog).filter(CommLog.id == comm_log_id).first()

    # If record not found, raise 404 error with descriptive message
    if not comm_log:
        raise HTTPException(
            status_code=404,
            detail=f"Communication log with ID {comm_log_id} not found"
        )

    # Generate a new summary using the configured service (OpenAI API or mock)
    fresh_summary = generate_summary(comm_log.transcript)

    # Update the record with new summary
    comm_log.summary = fresh_summary

    # Set updated_at timestamp to current UTC time
    # This ensures the updated_at field is always newer than created_at
    comm_log.updated_at = datetime.now(timezone.utc)

    # Persist changes to the database
    db.commit()
    db.refresh(comm_log)

    # Return the complete updated record
    return {
        "id": comm_log.id,
        "transcript": comm_log.transcript,
        "summary": comm_log.summary,
        "created_at": comm_log.created_at,
        "updated_at": comm_log.updated_at
    }
