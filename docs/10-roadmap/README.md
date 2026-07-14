# Roadmap Técnico y Funcional

> Última sincronización con código: julio 2026.
> Este documento refleja el **estado real** del repositorio, no solo el diseño objetivo.

## Resumen de estado

| Fase | Estado |
|------|--------|
| 0 — Contexto | ✅ Completa |
| 1 — Infraestructura | ⚠️ Parcial |
| 2 — Backend core | ⚠️ Parcial (auditoría sin UI; Policies pendientes) |
| 3 — MVP Backend | ✅ Completa |
| 4 — Frontend foundation | ✅ Completa |
| 5 — MVP Frontend | ✅ Completa |
| 6 — Dashboard | ⚠️ Hecho; notificaciones en stub |
| 7 — Módulos adicionales | ⚠️ Parcial (faltan Marketing y Reportes) |
| 8 — Calidad y deploy | ⚠️ Parcial (CI básico; tests finos; deploy incompleto) |

---

## Fase 0 - Contexto ✅

- [x] Reglas `.cursor/rules/`
- [x] Documentación técnica en `docs/`
- [x] Modelo de datos (catálogo aspiracional 80+ tablas; migraciones reales ~25 de negocio)

## Fase 1 - Infraestructura ⚠️

- [x] Monorepo workspaces (`apps/*`, `packages/*`; `packageManager` pnpm, uso habitual npm)
- [x] Docker Compose de datos: PostgreSQL 16, Redis 7, MinIO
- [ ] Docker Compose completo (backend/frontend/nginx en el mismo stack)
- [x] Scaffolding AdonisJS 6 + React 19 + Vite + TypeScript

## Fase 2 - Backend Core ⚠️

- [x] Auth + access tokens (login / logout / me)
- [x] RBAC (7 roles; middleware `role` en subset de rutas + RoleGuard FE)
- [x] Auditoría transversal (events → `AuditListener` → `audit_logs`)
- [ ] API/UI de consulta de auditoría
- [ ] Policies granulares por recurso (Bouncer scaffolding; sin carpetas `policies/` por módulo)
- [x] Capas Repository / Service / Validator / DTO
- [x] CRUD Usuarios + listado de roles

## Fase 3 - MVP Backend ✅

- [x] Clientes, Vehículos, Equipos GNC, Órdenes de Trabajo
- [x] Reglas de vencimiento (oblea / PH) y renovación regulatoria al finalizar OT
- [x] API REST del núcleo + fichas (cliente/vehículo/equipo)

## Fase 4 - Frontend Foundation ✅

- [x] Design system + componentes base (Tailwind)
- [x] Layout (sidebar + topbar)
- [x] Auth + routing + guards por rol

## Fase 5 - MVP Frontend ✅

- [x] Pantallas del núcleo (clientes, vehículos, equipos, OT)
- [x] Flujo recepción → taller → QC → entrega
- [x] Tablero de OT, impresión, kits y tipos de trabajo

## Fase 6 - Dashboard ⚠️

- [x] KPIs, gráficos de producción, alertas de vencimientos
- [x] Alertas operativas (stock bajo, OT, etc.)
- [x] Comando `vencimientos:alertar` + endpoint pendientes de notificar
- [ ] Envío real de notificaciones (email / WhatsApp); hoy es **stub**

## Fase 7 - Módulos adicionales ⚠️

| Módulo | Estado | Notas |
|--------|--------|-------|
| Inventario | ✅ MVP | Productos, categorías, movimientos, alertas, reservas desde OT. Sin proveedores/OC |
| Caja | ✅ MVP | Saldo, movimientos, arqueo, vínculo factura/OT. Sin tabla persistida `caja_arqueos` |
| Facturación | ✅ MVP interna | Emitir / listar / anular / NC / borrador desde OT. **Sin AFIP** |
| Agenda | ✅ MVP | CRUD turnos, por fecha, generar OT. Sin bloqueos ni recordatorios |
| Configuración | ✅ Hub | Usuarios, marcas/modelos, categorías, tipos y kits de trabajo |
| Marketing | ❌ Pendiente | Tabla `campanas` en migraciones; sin API/UI |
| Reportes | ❌ Pendiente | Sin módulo BE/FE |

## Fase 8 - Calidad y Deploy ⚠️

- [x] Tests unitarios puntuales (reglas GNC, roles, OT/factura/kits)
- [ ] Tests de integración del flujo OT → stock → factura → caja
- [ ] Tests e2e
- [x] CI GitHub Actions (typecheck, migrations, test, build frontend)
- [ ] Deploy automatizado a producción
- [x] Guía operativa con PM2 / Nginx en VM (README raíz)
- [ ] Stack Docker de app listo para producción

---

## Próximos focos (prioridad sugerida)

1. Policies / autorización granular en API
2. Notificaciones reales de vencimientos (reemplazar stub)
3. AFIP / marcar explícitamente factura interna vs fiscal
4. Módulo Reportes mínimo (export CSV/PDF + auditoría `export`)
5. UI/API de Auditoría
6. Tests de integración del flujo comercial
7. Completar infra de deploy (compose o guía alineada a `docs/09-deployment`)
8. Marketing (solo si hay necesidad de negocio) o retirar `campanas` del alcance MVP

## Nota sobre el modelo de datos

El catálogo en `docs/03-data-model/` describe el **diseño objetivo** (80+ tablas). El esquema migrado actual cubre el MVP operativo; tablas como proveedores, OC, AFIP, bloqueos de agenda, etc. siguen siendo aspiracionales.
