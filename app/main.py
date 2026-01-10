import os
import unicodedata
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIConnectionError, OpenAI
from pydantic import BaseModel
from sqlalchemy import text
from sentence_transformers import SentenceTransformer

from app.db.init_db import init_db
from app.db.database import SessionLocal

app = FastAPI(title="RAG de Comida 🍽️")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer("all-MiniLM-L6-v2")
llm_model = os.getenv("LLM_MODEL", "gpt-4o-mini")
llm_timeout = int(os.getenv("LLM_TIMEOUT", "60"))


def resolve_base_url(raw_url: Optional[str]) -> Optional[str]:
    """Translate loopback hosts to host.docker.internal when running inside Docker."""
    if not raw_url:
        return None

    def _map_host(url: str, from_host: str) -> str:
        return url.replace(from_host, "host.docker.internal")

    if os.path.exists("/.dockerenv"):
        if "localhost" in raw_url:
            return _map_host(raw_url, "localhost")
        if "127.0.0.1" in raw_url:
            return _map_host(raw_url, "127.0.0.1")
    return raw_url


llm_base_url = resolve_base_url(os.getenv("LLM_BASE_URL"))  # ex: http://host.docker.internal:11434/v1 para Ollama
llm_api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY") or ""

def build_llm_client() -> Optional[OpenAI]:
    if not (llm_api_key or llm_base_url):
        return None
    return OpenAI(
        api_key=llm_api_key or "sk-local",
        base_url=llm_base_url,
        timeout=llm_timeout,
    )

# Permite usar provedores compatíveis com API OpenAI (ex.: Ollama, vLLM, OpenAI). Base URL opcional.
client = build_llm_client()  # "sk-local" para backends que ignoram key


def normalize_text(text_value: str) -> str:
    return unicodedata.normalize("NFKD", text_value).encode("ascii", "ignore").decode()


class QueryRequest(BaseModel):
    query: str
    top_k: int = 3


class SearchResult(BaseModel):
    id: int
    content: str
    distance: float


class ChatRequest(BaseModel):
    message: str
    top_k: int = 3


class ChatResponse(BaseModel):
    answer: str
    sources: List[SearchResult]

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


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if client is None:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY nao configurada")

    # Recuperacao
    query_clean = normalize_text(request.message)
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

    sources = [
        {"id": row.id, "content": row.content, "distance": float(row.distance)}
        for row in rows
    ]

    context_lines = "\n".join([f"- {s['content']}" for s in sources]) or "(sem contexto)"

    try:
        completion = client.chat.completions.create(
            model=llm_model,
            temperature=0.3,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Voce e um assistente culinario amigavel. Responda em portugues de forma concisa. "
                        "Baseie-se apenas no contexto fornecido. Se o contexto nao ajudar, diga que nao encontrou "
                        "informacoes relevantes e sugira refazer a pergunta."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Pergunta: {request.message}\n\nContexto:\n{context_lines}",
                },
            ],
        )
    except APIConnectionError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Nao consegui conectar ao provedor LLM. Verifique LLM_BASE_URL (use host.docker.internal quando "
                "o Ollama roda na maquina host) e se o servico esta escutando. "
                "Se o Ollama estiver no WSL, suba com OLLAMA_HOST=0.0.0.0 para permitir acesso externo. "
                f"URL atual: {llm_base_url or 'nao configurada'}. Erro: {exc}"
            ),
        ) from exc

    answer = completion.choices[0].message.content.strip()

    return ChatResponse(answer=answer, sources=sources)


@app.get("/llm/health")
def llm_health():
    if client is None:
        raise HTTPException(status_code=503, detail="LLM nao configurado (sem API key ou base URL)")

    try:
        client.models.list()
        return {"status": "ok", "base_url": llm_base_url or "default"}
    except APIConnectionError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Nao consegui conectar ao provedor LLM. Confirme que o host/porta estao acessiveis a partir do container "
                "(se Ollama estiver no WSL, inicie com OLLAMA_HOST=0.0.0.0). "
                f"Base URL: {llm_base_url or 'nao configurada'}. Erro: {exc}"
            ),
        ) from exc
    except Exception as exc:  # catch-all para erros de autenticacao ou schema
        raise HTTPException(status_code=500, detail=f"Erro ao consultar modelos do LLM: {exc}")
