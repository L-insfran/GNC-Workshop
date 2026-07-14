# Módulo: Agenda / Turnos

## Estado: Implementado (MVP) — Fase 7

## Responsabilidad

Calendario de turnos para recepción de vehículos y generación de OT desde turno.

## Tablas

- `turnos` (con vínculo a OT)
- `turno_tipos` (futuro)
- `calendario_bloqueos` (futuro)

## Endpoints actuales

```
GET/POST     /api/v1/agenda/turnos
GET/PUT/DEL  /api/v1/agenda/turnos/:id
GET          /api/v1/agenda/por-fecha
POST         /api/v1/agenda/turnos/:id/generar-ot
```

## Frontend

- `/agenda` — calendario / listado
- `/agenda/nuevo` | `/:id/editar`

## Flujo actual

Cliente / recepción crea turno → confirmación manual → al llegar se puede `generar-ot`.

## Pendiente

- Recordatorios automáticos
- Bloqueos de calendario
- Tipos de turno configurables
