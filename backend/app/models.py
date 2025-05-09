from sqlalchemy import Column, Integer, Text, DateTime, func, Index
from app.database import Base


class CommLog(Base):
    """
    SQLAlchemy model for dental clinic call transcripts and summaries.

    This model represents a communication log entry containing:
    - The original call transcript text
    - A generated or AI-produced summary of the transcript
    - Timestamps for creation and last update

    Indexes are created on id and created_at for efficient querying.
    """
    __tablename__ = "comm_logs"

    # Primary key with auto-increment
    id = Column(Integer, primary_key=True)

    # Call transcript (original text)
    transcript = Column(
        Text,
        nullable=False,
        comment="Original transcript text from the dental clinic call"
    )

    # Generated summary
    summary = Column(
        Text,
        nullable=True,
        comment="AI-generated or mock summary of the transcript"
    )

    # Timestamps with server-side defaults
    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        comment="When this record was created"
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="When this record was last updated"
    )

    # Create an index on created_at for efficient sorting and filtering
    __table_args__ = (
        Index('ix_comm_logs_created_at', created_at.desc()),
    )

    def __repr__(self):
        """String representation of the CommLog instance."""
        return f"<CommLog(id={self.id}, created_at={self.created_at})>"
