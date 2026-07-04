# Módulo: Dashboard

## Responsabilidad

Módulo estrella del sistema. KPIs, gráficos, alertas de vencimientos.

## Endpoints

```
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/vencimientos
GET /api/v1/dashboard/produccion
```

## KPIs

- Órdenes activas
- Órdenes del día
- Clientes activos
- Vencimientos próximos (oblea 30d / PH 60d)
- Facturación del mes
- Producción del mes

## Frontend

DashboardPage con StatCards, alertas y gráfico de producción (Recharts).
