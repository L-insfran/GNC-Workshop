# Módulos del Sistema

Cada módulo es una unidad aislada. Ver subcarpetas para README y diagramas.

## MVP (Fases 3-5)

| Módulo | Carpeta | Estado |
|--------|---------|--------|
| Auth | [auth](auth/README.md) | Core |
| Users | [users](users/README.md) | Core |
| Clientes | [clientes](clientes/README.md) | MVP |
| Vehículos | [vehiculos](vehiculos/README.md) | MVP |
| Equipos GNC | [equipos-gnc](equipos-gnc/README.md) | MVP |
| Órdenes de Trabajo | [ordenes-trabajo](ordenes-trabajo/README.md) | MVP |
| Dashboard | [dashboard](dashboard/README.md) | Fase 6 |

## Post-MVP (Fase 7+)

| Módulo | Carpeta |
|--------|---------|
| Inventario | [inventario](inventario/README.md) |
| Caja | [caja](caja/README.md) |
| Facturación | [facturacion](facturacion/README.md) |
| Agenda | [agenda](agenda/README.md) |
| Marketing | [marketing](marketing/README.md) |
| Reportes | [reportes](reportes/README.md) |
| Configuración | [configuracion](configuracion/README.md) |
| Auditoría | [auditoria](auditoria/README.md) |

## Patrón de implementación por módulo

1. Documentar en `docs/05-modules/{modulo}/`
2. Migraciones en `apps/backend/database/migrations/`
3. Módulo backend en `apps/backend/app/modules/{modulo}/`
4. Páginas frontend en `apps/frontend/src/pages/{modulo}/`
5. Tests unit + integración
6. Actualizar rutas y sidebar
