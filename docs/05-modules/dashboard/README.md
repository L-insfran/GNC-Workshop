# Módulo: Dashboard

## Estado: Implementado — Fase 6

## Responsabilidad

KPIs, gráficos, alertas de vencimientos/operativas y notificaciones a clientes (asistidas hoy, API mañana).

## Endpoints

```
GET  /api/v1/dashboard/kpis
GET  /api/v1/dashboard/vencimientos
GET  /api/v1/dashboard/vencimientos/pendientes-notificar
POST /api/v1/dashboard/vencimientos/:alertaId/marcar-notificado
GET  /api/v1/dashboard/notificaciones/config
GET  /api/v1/dashboard/alertas-operativas
GET  /api/v1/dashboard/produccion
```

## Notificaciones (arquitectura)

```
VencimientosNotificacionService
        ↓
createNotificacionAdapter()   ← config NOTIFICACION_DRIVER
        ↓
 ManualAssistidoAdapter  |  WhatsappCloudAdapter (stub listo)
        ↓
   wa.me / mailto        |  Meta Graph API (pendiente HTTP)
```

| Driver | Env | Comportamiento |
|--------|-----|----------------|
| `manual` (default) | `NOTIFICACION_DRIVER=manual` | Deep links en Dashboard; $0 |
| `whatsapp_cloud` | + `WHATSAPP_CLOUD_TOKEN` + `PHONE_NUMBER_ID` | Mismo contrato; completar `enviar()` en el adapter |

Tabla `vencimiento_notificaciones`: historial de avisos (asistidos o automáticos). Una alerta deja de listarse como pendiente cuando hay registro `enviado` para el mismo `alerta_id` + `fecha_vencimiento`.

## Comando

```bash
cd apps/backend && npm run vencimientos:alertar
```

## Frontend

- `DashboardPage` + `VencimientosNotificacionSection`
- Ficha de equipo: `EquipoVencimientosNotificacionCard` (mismo flujo asistido; incluye ya notificados para reenviar)
- Botones WhatsApp / Email + “Marcar notificado”

Query params en pendientes:

```
GET /api/v1/dashboard/vencimientos/pendientes-notificar?equipoGncId=:id&incluirYaNotificados=true
```
