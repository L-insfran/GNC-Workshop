# Módulo: Facturación

## Estado: Implementado (MVP interna) — Fase 7

## Responsabilidad

Emisión de comprobantes **internos** del taller (con IVA), anulaciones y notas de crédito.
Integración AFIP **pendiente**.

## Tablas

- `facturas`
- `factura_items`
- `afip_config` (futuro)
- `puntos_venta` (futuro)

## Endpoints actuales

```
GET    /api/v1/facturas
GET    /api/v1/facturas/:id
POST   /api/v1/facturas
PATCH  /api/v1/facturas/:id/anular
GET    /api/v1/facturas/:id/nota-credito-borrador
GET    /api/v1/ordenes-trabajo/:id/factura-borrador
GET    /api/v1/ordenes-trabajo/:id/factura-vinculada
```

## Frontend

- `/facturacion` — listado
- `/facturacion/nueva` — alta (desde OT o NC)
- `/facturacion/:id` — detalle

## Integración AFIP (pendiente)

- WSAA (autenticación)
- WSFEv1 (factura electrónica)
- Hasta entonces, los comprobantes son de uso interno del taller (no fiscales AFIP)
