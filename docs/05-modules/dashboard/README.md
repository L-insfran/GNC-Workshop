# Módulo: Dashboard

## Estado: Implementado — Fase 6 (notificaciones stub)

## Responsabilidad

Módulo estrella del sistema. KPIs, gráficos, alertas de vencimientos y alertas operativas.

## Endpoints

```
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/vencimientos
GET /api/v1/dashboard/vencimientos/pendientes-notificar
GET /api/v1/dashboard/alertas-operativas
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

`DashboardPage` con StatCards, alertas, gráfico de producción (Recharts) y sección de pendientes de notificar (stub).

## Notificaciones

- Comando: `node ace vencimientos:alertar` (lista pendientes; **sin envío real**)
- Próximo paso: adapter email/WhatsApp sin cambiar el contrato del comando
