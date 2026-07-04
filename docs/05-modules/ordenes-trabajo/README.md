# Módulo: Órdenes de Trabajo

## Responsabilidad

Ciclo de vida completo de una orden de trabajo en el taller GNC.

## Estados

`borrador` → `recepcion` → `en_taller` → `en_espera_repuesto` → `control_calidad` → `finalizada` → `entregada`

## API Endpoints

```
GET    /api/v1/ordenes-trabajo
GET    /api/v1/ordenes-trabajo/:id
POST   /api/v1/ordenes-trabajo
PUT    /api/v1/ordenes-trabajo/:id
PATCH  /api/v1/ordenes-trabajo/:id/estado
POST   /api/v1/ordenes-trabajo/:id/items
GET    /api/v1/ordenes-trabajo/:id/historial
```

## Tipos de trabajo GNC

- Instalación nueva
- Revisión anual
- Renovación de oblea
- Prueba hidráulica
- Reparación / cambio de cilindro
- Desinstalación

## Flujo principal

```mermaid
stateDiagram-v2
  [*] --> borrador
  borrador --> recepcion: confirmar
  recepcion --> en_taller: asignar mecánico
  en_taller --> en_espera_repuesto: falta repuesto
  en_espera_repuesto --> en_taller: repuesto llegó
  en_taller --> control_calidad: trabajo terminado
  control_calidad --> finalizada: aprobado
  control_calidad --> en_taller: rechazado
  finalizada --> entregada: cliente retira
  recepcion --> cancelada
  en_taller --> cancelada
```
