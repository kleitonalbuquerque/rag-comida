# 🍝 RAG Comida

Projeto **RAG (Retrieval-Augmented Generation)** focado em **conteúdos culinários**, utilizando **FastAPI**, **PostgreSQL + pgvector** e **embeddings semânticos** para permitir buscas por significado (e não apenas por palavras-chave).

O objetivo é armazenar textos (receitas, dicas, curiosidades, descrições de pratos etc.), gerar embeddings vetoriais e permitir consultas inteligentes que retornem os conteúdos mais relevantes com base na similaridade semântica, **reduzindo alucinações** e garantindo respostas baseadas em dados reais.

---

## 🧠 O que esse projeto faz

* Armazena conteúdos textuais relacionados a comida
* Gera embeddings semânticos (vetores de 384 dimensões)
* Salva os vetores no PostgreSQL usando **pgvector**
* Executa **busca semântica** por similaridade vetorial
* Expõe endpoints REST usando **FastAPI**
* Serve como base para um pipeline **RAG completo**

---

## 🛠️ Tecnologias utilizadas

* **Python 3.11**
* **FastAPI**
* **Uvicorn**
* **PostgreSQL 15**
* **pgvector**
* **SQLAlchemy**
* **Sentence-Transformers** (embeddings)
* **Docker & Docker Compose**

---

## 📂 Estrutura do projeto

```text
rag-comida/
├── app/
│   ├── main.py          # Inicialização da API FastAPI
│   ├── database.py      # Conexão com o banco de dados
│   ├── models.py        # Modelos SQLAlchemy
│   ├── schemas.py       # Schemas Pydantic
│   └── routes/          # Rotas da aplicação
│       └── query.py     # Endpoint de busca semântica
│
├── scripts/
│   └── ingest.py        # Script de ingestão de conteúdos
│
├── docker-compose.yml   # Subida do PostgreSQL + pgvector
├── requirements.txt     # Dependências do projeto
├── .env.example         # Exemplo de variáveis de ambiente
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de começar, você precisa ter instalado:

* Python **3.11+**
* Docker
* Docker Compose
* Git

---

## 🐳 Subindo o banco com Docker

O projeto utiliza PostgreSQL com a extensão **pgvector** para armazenar e consultar embeddings vetoriais.

### 1️⃣ Subir o container

Na raiz do projeto:

```bash
docker compose up -d
```

Isso irá subir:

* PostgreSQL
* Extensão **pgvector** já habilitada

---

### 2️⃣ Acessar o banco (opcional)

```bash
docker exec -it vector_db psql -U postgres -d vector_db
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Exemplo de `.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/vector_db
```

---

## 🐍 Configurando o ambiente Python

### 1️⃣ Criar e ativar o ambiente virtual

**Windows (PowerShell):**

```powershell
python -m venv venv
. venv\Scripts\Activate.ps1
```

**Linux / Mac:**

```bash
python -m venv venv
source venv/bin/activate
```

---

### 2️⃣ Instalar dependências

```bash
python -m pip install -r requirements.txt
```

---

## 🚀 Rodando a aplicação

Com o ambiente virtual ativado:

```bash
python -m uvicorn app.main:app --reload
```

A aplicação estará disponível em:

* API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## ❤️ Endpoint de saúde

Para validar se está tudo funcionando corretamente:

```http
GET /health
```

Resposta esperada:

```json
{ "status": "ok" }
```

---

## 🧠 Fluxo RAG (resumo)

1. Textos culinários são ingeridos na base
2. Cada texto gera um embedding vetorial
3. Os vetores são armazenados no PostgreSQL
4. O usuário faz uma pergunta
5. A pergunta vira um embedding
6. O pgvector retorna os textos semanticamente mais próximos
7. Esses textos podem ser usados por um LLM para gerar respostas confiáveis

---

## 🧩 Próximas etapas do projeto

* [ ] Serviço de geração de embeddings
* [ ] Endpoint de ingestão de documentos
* [ ] Endpoint de busca semântica
* [ ] Integração com LLM (RAG completo)
* [ ] Testes automatizados
* [ ] Frontend simples (chat ou busca)

---

## 📌 Observação

Este projeto foi criado com foco **didático e prático**, servindo como base para estudos e aplicações reais de **RAG com banco vetorial** usando pgvector.

---

🚀 **Pronto! O projeto agora pode ser facilmente entendido, instalado e evoluído por qualquer pessoa do time.**
