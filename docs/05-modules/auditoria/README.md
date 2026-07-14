# Módulo: Auditoría

## Estado: Parcial (infraestructura write-only)

## Responsabilidad

Registrar acciones importantes del sistema en `audit_logs` de forma desacoplada vía events/listeners.

## Implementado

- Tabla `audit_logs`
- `AuditListener` reaccionando a eventos de dominio (create/update/delete en varios services)
- Campos típicos: user, action, entity, entity_id, old/new values, ip, timestamp

## No implementado

- API de consulta / filtros
- Pantalla en Configuración o menú admin
- Exportación de logs
- Módulo backend dedicado en `app/modules/auditoria/`

## Roles previstos (cuando haya UI)

- Administrador: acceso total
- Supervisor: lectura según política

## Próximo paso sugerido

Endpoint paginado + pantalla admin con filtros por entidad, usuario y rango de fechas.
