# Módulos del Sistema

Cada módulo es una unidad aislada. Ver subcarpetas para README y diagramas.

> Estado sincronizado con código: julio 2026. Roadmap completo en [docs/10-roadmap](../10-roadmap/README.md).

## Implementados

| Módulo | Carpeta | Madurez | Notas |
|--------|---------|---------|-------|
| Auth | [auth](auth/README.md) | Avanzado | Login, tokens, sesión |
| Users | [users](users/README.md) | Avanzado | CRUD + roles (admin) |
| Clientes | [clientes](clientes/README.md) | Avanzado | CRUD + ficha |
| Vehículos | _(sin README dedicado)_¹ | Avanzado | CRUD + ficha + marcas/modelos |
| Equipos GNC | [equipos-gnc](equipos-gnc/README.md) | Avanzado | Cilindros, oblea, PH |
| Órdenes de Trabajo | [ordenes-trabajo](ordenes-trabajo/README.md) | Avanzado | Estados, ítems, kits, QC, tablero |
| Dashboard | [dashboard](dashboard/README.md) | Avanzado² | KPIs y alertas; notificaciones stub |
| Inventario | [inventario](inventario/README.md) | MVP | Sin proveedores/OC |
| Caja | [caja](caja/README.md) | MVP | Movimientos y arqueo |
| Facturación | [facturacion](facturacion/README.md) | MVP interna | Sin AFIP |
| Agenda | [agenda](agenda/README.md) | MVP | Turnos + generar OT |
| Configuración | [configuracion](configuracion/README.md) | Hub MVP | Catálogos operativos |

¹ No hay `docs/05-modules/vehiculos/`; el dominio está cubierto por modelo de datos y reglas de negocio.  
² Notificación real de vencimientos pendiente.

## Parciales / pendientes

| Módulo | Carpeta | Estado |
|--------|---------|--------|
| Auditoría | [auditoria](auditoria/README.md) | Write-only (`audit_logs`); sin API/UI de consulta |
| Marketing | [marketing](marketing/README.md) | Pendiente (tabla `campanas` sin uso) |
| Reportes | [reportes](reportes/README.md) | Pendiente |

## Patrón de implementación por módulo

1. Documentar en `docs/05-modules/{modulo}/`
2. Migraciones en `apps/backend/database/migrations/`
3. Módulo backend en `apps/backend/app/modules/{modulo}/`
4. Páginas frontend en `apps/frontend/src/pages/{modulo}/`
5. Tests unit + integración
6. Actualizar rutas y sidebar
7. Actualizar este índice y el roadmap
