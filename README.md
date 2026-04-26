# Mind Systems

## Prerequisites

- Node.js ≥20
- pnpm
- Python ≥3.11
- Docker

## First-time setup

```
cp .env.example api/.env
cp .env.example web/.env.local
docker compose up -d postgres
cd api && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
alembic upgrade head
python -m app.seed
cd ../web && pnpm install
```

## Daily run

```
# Terminal A
cd api && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal B
cd web && pnpm dev
```

## Reset

To reset the database:

```
docker compose down -v
docker compose up -d postgres
cd api && source .venv/bin/activate && alembic upgrade head && python -m app.seed
```