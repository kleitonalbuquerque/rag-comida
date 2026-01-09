import unicodedata
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import text
from sentence_transformers import SentenceTransformer

from app.db.init_db import init_db
from app.db.database import SessionLocal

app = FastAPI(title="RAG de Comida 🍽️")

model = SentenceTransformer("all-MiniLM-L6-v2")


def normalize_text(text_value: str) -> str:
    return unicodedata.normalize("NFKD", text_value).encode("ascii", "ignore").decode()


class QueryRequest(BaseModel):
    query: str
    top_k: int = 3


class SearchResult(BaseModel):
    id: int
    content: str
    distance: float

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"message": "RAG de Comida API", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/search", response_model=List[SearchResult])
def search(request: QueryRequest):
    query_clean = normalize_text(request.query)
    query_vec = model.encode(query_clean).tolist()

    with SessionLocal() as db:
        rows = db.execute(
            text(
                """
                SELECT id, content, (embedding <=> (:vec)::vector) AS distance
                FROM documents
                ORDER BY embedding <=> (:vec)::vector
                LIMIT :k
                """
            ).bindparams(vec=query_vec, k=request.top_k)
        ).fetchall()

    return [
        {"id": row.id, "content": row.content, "distance": float(row.distance)}
        for row in rows
    ]
