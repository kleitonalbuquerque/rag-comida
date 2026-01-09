from sqlalchemy import text
from app.db.database import engine
from app.db.models import Base

def init_db():
    # Ensure the pgvector extension exists before creating tables
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.create_all(bind=conn)
