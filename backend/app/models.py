from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

from app.database import Base


class CommLog(Base):
    """
    SQLAlchemy model for storing communication logs.

    This model stores the original transcript and its summary,
    along with creation and update timestamps.
    """
    __tablename__ = "comm_logs"

    id = Column(Integer, primary_key=True, index=True)
    transcript = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
