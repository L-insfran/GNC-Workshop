# Módulo: Inventario / Depósito

## Estado: Planificado (Fase 7)

## Responsabilidad

Gestión de stock de repuestos y materiales GNC.

## Tablas

- `categorias_producto`
- `productos`
- `stock_movimientos`
- `proveedores` (futuro)
- `ordenes_compra` (futuro)

## Endpoints planificados

```
GET/POST   /api/v1/productos
GET/PUT    /api/v1/productos/:id
POST       /api/v1/stock/movimientos
GET        /api/v1/stock/alertas
```

## Roles

- Depósito: CRUD productos y movimientos
- Supervisor: lectura + aprobaciones
- Administrador: acceso total
