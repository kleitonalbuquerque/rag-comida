from sqlalchemy import text
from app.db.database import engine
from app.db.models import Base


def init_db():
    # Ensure pgvector exists, create tables, and add an ivfflat index for faster similarity search
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.create_all(bind=conn)
        conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS documents_embedding_ivf
                ON documents
                USING ivfflat (embedding vector_l2_ops)
                WITH (lists = 100)
                """
            )
        )
        conn.execute(text("ANALYZE documents"))
