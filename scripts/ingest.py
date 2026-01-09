import os
import sys
import traceback
import unicodedata
from pathlib import Path

from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

# Ensure project root on PYTHONPATH when running as script inside container
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from app.db.database import SessionLocal
from app.db.models import Document


FOOD_TEXTS = [
    "Feijoada e um prato tipico brasileiro feito com feijao preto e carnes.",
    "Pizza napolitana tem massa fina e molho de tomate.",
    "Salada Caesar e uma opcao leve para o jantar.",
    "Lasanha a bolonhesa e um prato italiano com camadas de massa e carne.",
    "Sopa de legumes e nutritiva e ideal para dias frios."
]


def normalize_text(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()


def run():
    print("Iniciando ingestao...")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    db: Session = SessionLocal()

    try:
        for text in FOOD_TEXTS:
            clean_text = normalize_text(text)
            embedding = model.encode(clean_text).tolist()

            doc = Document(
                content=clean_text,
                embedding=embedding
            )
            db.add(doc)

        db.commit()
        print("Ingestao concluida com sucesso")

    except Exception as e:
          db.rollback()
          with open("ingest_error.log", "w", encoding="utf-8") as f:
              f.write(traceback.format_exc())
          print("Erro durante ingestao. Veja o arquivo ingest_error.log")


    finally:
        db.close()


if __name__ == "__main__":
    run()
