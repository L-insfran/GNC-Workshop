# Módulo: Inventario / Depósito

## Estado: Implementado (MVP) — Fase 7

## Responsabilidad

Gestión de stock de repuestos y materiales GNC, con reservas desde órdenes de trabajo.

## Tablas

- `categorias_producto`
- `productos`
- `stock_movimientos` (con vínculo opcional a OT)
- `stock_reservas`
- `proveedores` (futuro)
- `ordenes_compra` (futuro)

## Endpoints actuales

```
GET/POST     /api/v1/inventario/productos
GET/PUT/DEL  /api/v1/inventario/productos/:id
GET          /api/v1/inventario/productos/:id/disponibilidad
POST         /api/v1/inventario/movimientos
GET          /api/v1/inventario/movimientos
GET          /api/v1/inventario/alertas
GET/POST     /api/v1/inventario/categorias
PUT/DEL      /api/v1/inventario/categorias/:id
```

## Frontend

- `/inventario` — listado de productos (filtro stock bajo)
- `/inventario/nuevo` | `/:id` | `/:id/editar`
- `/inventario/movimiento` — ingreso / egreso / ajuste
- Categorías desde Configuración

## Roles

- Depósito: CRUD productos y movimientos
- Supervisor: lectura + aprobaciones de catálogo
- Administrador: acceso total

## Pendiente post-MVP

- Proveedores y órdenes de compra
- Multi-depósito
