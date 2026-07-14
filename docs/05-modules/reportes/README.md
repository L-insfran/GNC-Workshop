# Módulo: Reportes

## Estado: Pendiente

Sin módulo backend/frontend ni rutas en el sidebar.

## Responsabilidad (diseño objetivo)

Exportación de datos y estadísticas avanzadas.

## Features previstas

- Reportes de producción mensual
- Reportes de facturación
- Exportación CSV/PDF (auditada)
- Filtros avanzados por fecha, cliente, mecánico

## Relación con lo existente

Parte de la información ya se visualiza en Dashboard (KPIs y producción). Reportes formaliza exportación y auditoría `export`.

## Auditoría

Toda exportación deberá registrarse en `audit_logs` con action `export`.
