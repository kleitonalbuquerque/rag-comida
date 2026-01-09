from fastapi import FastAPI
from app.db.init_db import init_db

app = FastAPI(title="RAG de Comida 🍽️")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health_check():
    return {"status": "ok"}
