# GNC Workshop Management System

ERP especializado para talleres de GNC (Gas Natural Comprimido) en Argentina.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind |
| Backend | AdonisJS 6 + TypeScript |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Storage | MinIO |
| Infra | Docker + Nginx |

## Estructura

```
GNC-Workshop/
├── .cursor/rules/     # 16 reglas de contexto para Cursor AI
├── apps/
│   ├── backend/       # API AdonisJS 6
│   └── frontend/      # SPA React 19
├── packages/
│   ├── shared-types/  # DTOs compartidos FE-BE
│   └── config/        # TS/ESLint config compartida
├── infra/docker/      # Docker Compose
├── infra/nginx/       # Reverse proxy
└── docs/              # Documentación técnica completa
```

## Requisitos

- Node.js >= 20
- Docker y Docker Compose
- npm (o pnpm 9+)

## Inicio rápido

### 1. Infraestructura

```bash
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up -d
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Backend

```bash
cp .env.example apps/backend/.env
cd apps/backend
npm run migration:run
npm run db:seed
npm run dev
```

API disponible en `http://localhost:3333`

### 4. Frontend

```bash
cd apps/frontend
npm run dev
```

App disponible en `http://localhost:5173`

## Credenciales de desarrollo

| Campo | Valor |
|-------|-------|
| Email | admin@gnc.local |
| Password | Admin123! |
| Rol | Administrador |

## Módulos implementados

- **MVP**: Auth, Users, Clientes, Vehículos, Equipos GNC, Órdenes de Trabajo, Dashboard
- **Planificados**: Inventario, Caja, Facturación, Agenda, Marketing, Reportes

## Documentación

Ver [docs/README.md](docs/README.md) para documentación técnica completa.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca backend + frontend |
| `npm run dev:backend` | Solo backend |
| `npm run dev:frontend` | Solo frontend |
| `npm run build` | Build de producción |
| `npm run test` | Ejecuta tests |
| `npm run lint` | Linting |

## Licencia

Privado - Todos los derechos reservados.
