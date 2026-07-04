# Deployment

## Desarrollo local

```bash
docker compose -f infra/docker/docker-compose.yml up -d
pnpm install
pnpm dev
```

## Servicios Docker

| Servicio | Puerto | Imagen |
|----------|--------|--------|
| postgres | 5432 | postgres:16-alpine |
| redis | 6379 | redis:7-alpine |
| minio | 9000/9001 | minio/minio |
| backend | 3333 | custom Dockerfile |
| frontend | 5173 (dev) | custom Dockerfile |
| nginx | 80/443 | nginx:alpine |

## Producción

1. Ubuntu Server 22.04+
2. Docker + Docker Compose
3. Nginx con SSL (Let's Encrypt)
4. Variables de entorno en `.env` del servidor
5. Backups automáticos de PostgreSQL

## CI/CD (GitHub Actions)

```yaml
on: [push, pull_request]
jobs:
  lint: pnpm lint
  test: pnpm test
  build: pnpm build
  deploy: (solo main) SSH + docker compose up
```

## Variables de entorno requeridas

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE
REDIS_HOST, REDIS_PORT
MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY
APP_KEY, APP_URL
```
