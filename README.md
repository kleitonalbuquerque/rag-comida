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

### 3️⃣ Ver logs em tempo real

```bash
docker compose logs -f api
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

Interface de chat que consome `POST /search` da API.

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
- Mensagens listadas em chat (usuário/bot).
- Faz `POST /search` com `{ query, top_k }` e responde com o documento mais relevante.

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
