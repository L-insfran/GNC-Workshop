# Deployment

## Estado actual

| Pieza | Estado |
|-------|--------|
| Docker Compose (PG, Redis, MinIO) | ✅ En `infra/docker/` |
| Backend / frontend en Docker Compose | ❌ App corre en host (dev) o PM2 (VM) |
| Nginx config de ejemplo | ✅ En `infra/nginx/` |
| CI (typecheck, migrations, test, build) | ✅ GitHub Actions |
| Deploy automatizado | ❌ Manual vía git pull + PM2 |

Ver también flujo de trabajo en el README raíz del repo.

## Desarrollo local

```bash
docker compose -f infra/docker/docker-compose.yml up -d
npm install   # o pnpm install
npm run dev
```

## Servicios Docker (hoy en compose)

| Servicio | Puerto | Imagen |
|----------|--------|--------|
| postgres | 5432 | postgres:16-alpine |
| redis | 6379 | redis:7-alpine |
| minio | 9000/9001 | minio/minio |

Nginx y las apps se despliegan fuera del compose actual (host / PM2 / reverse proxy).

## Producción (objetivo / práctica actual en VM)

1. Ubuntu Server 22.04+
2. Docker Compose para datos (PG/Redis/MinIO)
3. Backend y frontend con Node + PM2 (o equivalente)
4. Nginx con SSL (Let's Encrypt) como reverse proxy
5. Variables de entorno en `.env` del servidor
6. Backups de PostgreSQL

## CI (GitHub Actions)

Workflow actual: typecheck (shared/backend/frontend) → migrations → tests → build frontend.
No incluye deploy automático.

## Variables de entorno requeridas

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE
REDIS_HOST, REDIS_PORT
MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY
APP_KEY, APP_URL
```
