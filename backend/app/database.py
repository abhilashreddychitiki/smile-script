import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import DATABASE_URL

# Configure logger
logger = logging.getLogger(__name__)

# Create database engine with appropriate configuration
# For SQLite, we need to set check_same_thread=False to allow
# multiple requests to use the same connection
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True  # Verify connection before using from pool
)

# Create session factory configured for our application needs
SessionLocal = sessionmaker(
    autocommit=False,  # Explicit commit required
    autoflush=False,   # Manual control of flushing
    bind=engine
)

# Create base class for declarative model definitions
Base = declarative_base()

# Log database connection info
logger.info(f"Database configured with: {DATABASE_URL.split('://')[0]}")


def get_db():
    """
    FastAPI dependency that provides a database session.

    This function creates a new SQLAlchemy session for each request
    and ensures it's closed when the request is complete.

    Yields:
        SQLAlchemy Session: Database session for the current request
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
