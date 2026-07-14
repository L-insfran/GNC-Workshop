# Módulo: Caja

## Estado: Implementado (MVP) — Fase 7

## Responsabilidad

Movimientos de caja, cobros vinculados a factura/OT y arqueo diario (consulta).

## Tablas

- `cajas`
- `caja_movimientos` (vínculo a factura y/o `orden_trabajo_id`)
- `caja_arqueos` (futuro — hoy el arqueo es cálculo/consulta, no tabla persistida)
- `cobros` / desglose avanzado (futuro)

## Endpoints actuales

```
GET   /api/v1/caja
GET   /api/v1/caja/saldo
GET   /api/v1/caja/movimientos
POST  /api/v1/caja/movimientos
GET   /api/v1/caja/arqueo
```

## Frontend

- `/caja` — resumen y movimientos
- `/caja/movimiento` — alta de movimiento
- `/caja/arqueo` — arqueo del día

## Integración

Se vincula con Órdenes de Trabajo (cobro / seña) y Facturación.
