import os
import sys
import traceback
import unicodedata
from itertools import product, islice
from pathlib import Path

from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

# Ensure project root on PYTHONPATH when running as script inside container
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from app.db.database import SessionLocal
from app.db.models import Document


BASE_RECIPES = [
    "Feijoada e um prato tipico brasileiro feito com feijao preto e carnes.",
    "Pizza napolitana tem massa fina e molho de tomate.",
    "Salada Caesar e uma opcao leve para o jantar.",
    "Lasanha a bolonhesa e um prato italiano com camadas de massa e carne.",
    "Sopa de legumes e nutritiva e ideal para dias frios."
]


CUISINES = [
    "brasileira",
    "italiana",
    "mexicana",
    "mediterranea",
    "asiatica",
    "indiana",
    "francesa",
    "arabe",
]

PROTEINS = [
    "frango",
    "carne bovina",
    "porco",
    "peixe",
    "camarao",
    "grão-de-bico",
    "lentilha",
    "tofu",
    "ovo",
    "cordeiro",
]

METHODS = [
    "assado",
    "grelhado",
    "ensopado",
    "salteado",
    "confitado",
    "braseado",
    "cozido no vapor",
    "na airfryer",
]

CARBS = [
    "arroz",
    "massa",
    "batata",
    "pao",
    "cuscuz",
    "quinoa",
]

EXTRAS = [
    "com ervas frescas",
    "com molho de iogurte",
    "com legumes tostados",
    "com alho e limao",
    "com pimenta defumada",
    "com queijo maturado",
]


def normalize_text(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()


def generate_recipes(total: int = 1000) -> list[str]:
    recipes: list[str] = []
    combos = product(CUISINES, PROTEINS, METHODS, CARBS, EXTRAS)
    for i, (cuisine, protein, method, carb, extra) in enumerate(islice(combos, total)):
        title = f"Receita {i + 1}: {protein} {method} com {carb} ({cuisine})"
        body = (
            f"{title}. Preparo {method}, base de {carb}, cozinha {cuisine}. "
            f"Proteina principal: {protein}. Finalize {extra}."
        )
        recipes.append(body)
    return recipes


def run():
    print("Iniciando ingestao com base+synthetic...")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    db: Session = SessionLocal()

    try:
        texts = BASE_RECIPES + generate_recipes(1000)
        cleaned = [normalize_text(t) for t in texts]
        embeddings = model.encode(cleaned, batch_size=64)

        for text, emb in zip(cleaned, embeddings):
            doc = Document(content=text, embedding=emb.tolist())
            db.add(doc)

        db.commit()
        print(f"Ingestao concluida: {len(texts)} documentos")

    except Exception:
        db.rollback()
        with open("ingest_error.log", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())
        print("Erro durante ingestao. Veja o arquivo ingest_error.log")

    finally:
        db.close()


if __name__ == "__main__":
    run()
