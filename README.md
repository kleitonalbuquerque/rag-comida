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
├── app/                 # Backend FastAPI
│   ├── main.py          # Entrypoint, /health e /search
│   ├── db/              # Conexão, modelos e init do pgvector
│   └── ...
├── scripts/
│   └── ingest.py        # Script de ingestão usando all-MiniLM-L6-v2
├── frontend/            # Frontend Next.js (chat UI)
│   ├── app/page.js      # Chat com fetch para /search
│   └── app/layout.js
├── docker-compose.yml   # Postgres + API
├── Dockerfile           # Build da API
├── requirements.txt     # Dependências da API
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

## 🐳 Subindo com Docker (API + Postgres)

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe Postgres (pgvector habilitado) e a API. Para acompanhar:

```bash
docker compose ps
docker compose logs -f api
```

#### LLM (Ollama) acessível pelo container

- Inicie o Ollama ouvindo em todas as interfaces (no host ou no WSL):
	```bash
	OLLAMA_HOST=0.0.0.0:11434 ollama serve
	```
- A API usa endpoint compatível OpenAI em `http://host.docker.internal:11434/v1` (config no `.env`).
- Após subir, faça um ping de aquecimento para evitar cold start:
	```bash
	docker compose exec api curl -s -X POST http://localhost:8000/chat \
		-H "Content-Type: application/json" \
		-d '{"message":"Diga apenas: ok","top_k":1}'
	```

> Se quiser verificar saúde do LLM via API: `docker compose exec api curl -s http://localhost:8000/llm/health`

#### Acessar o banco (opcional)

```bash
docker exec -it rag-postgres psql -U postgres -d vector_db
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Principais chaves usadas atualmente:

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=vector_db
DB_USER=postgres
DB_PASSWORD=postgres

# LLM (Ollama via API compatível OpenAI)
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_API_KEY=sk-local
LLM_MODEL=llama3.2:3b
LLM_TIMEOUT=60
```

> Dica: se o Ollama estiver no WSL, mantenha-o ouvindo em `0.0.0.0:11434` e use `host.docker.internal` no `.env` da API. Se estiver em outro host/IP, ajuste `LLM_BASE_URL` conforme.

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

## 🚀 Rodando a aplicação (API)

Com o ambiente virtual ativado (ou via container):

```bash
python -m uvicorn app.main:app --reload
```

Ou com Docker Compose:

```bash
docker compose up -d
```

A API fica em http://127.0.0.1:8000 (docs: http://127.0.0.1:8000/docs).

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

## 🧭 Frontend (Next.js + styled-components)

Interface de chat que consome `POST /chat` da API.

### Pré-requisitos
- Node 18+
- API rodando em http://localhost:8000 (ou defina `NEXT_PUBLIC_API_URL`)

### Setup
```bash
cd frontend
npm install
npm run dev
# abre em http://localhost:3000
```

Se a API estiver em outro host/porta, crie `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Como funciona
- Header com título e botão “Limpar chat”.
- Input e botão de envio travam enquanto o fetch está em andamento.
- Mensagens listadas em chat (usuário/bot) com horário.
- Respostas do bot renderizam Markdown (negrito, listas, etc.).
- Faz `POST /chat` com `{ message, top_k }` e retorna resposta + fontes.

---

## 🧠 Fluxo RAG (resumo)

1. Textos culinários são ingeridos na base
2. Cada texto gera um embedding vetorial
3. Os vetores são armazenados no PostgreSQL
4. O usuário faz uma pergunta
5. A pergunta vira um embedding
6. O pgvector retorna os textos semanticamente mais próximos
7. Esses textos são usados por um LLM (via /chat) para gerar respostas confiáveis

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
