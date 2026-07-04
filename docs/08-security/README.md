# Seguridad y Auditoría

## RBAC - Roles

| Rol | Permisos clave |
|-----|---------------|
| administrador | * (todo) |
| supervisor | CRUD operativo, reportes, aprobaciones |
| recepcion | Clientes, vehículos, OT (crear/editar) |
| mecanico | OT asignadas (ejecutar, checklist) |
| caja | Cobros, movimientos caja |
| deposito | Inventario, stock |
| invitado | Solo lectura limitada |

## Auditoría

Toda acción CRUD y export queda en `audit_logs`:

```json
{
  "user_id": "uuid",
  "action": "update",
  "entity_type": "clientes",
  "entity_id": "uuid",
  "old_values": { "telefono": "111" },
  "new_values": { "telefono": "222" },
  "ip_address": "192.168.1.1",
  "created_at": "2026-07-03T14:00:00Z"
}
```

## Implementación

- Guards en rutas protegidas (middleware auth)
- Policies por recurso (Bouncer de AdonisJS)
- Events: EntityCreated, EntityUpdated, EntityDeleted
- AuditListener persiste en audit_logs

## Buenas prácticas

- Validar permisos en backend SIEMPRE
- Rate limiting en /auth/login
- Tokens con expiración
- CORS restrictivo
- Secrets en variables de entorno
