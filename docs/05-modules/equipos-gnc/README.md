# Módulo: Equipos GNC

## Responsabilidad

Gestión de equipos GNC instalados en vehículos: regulador, cilindros, obleas y PH.

## Reglas de negocio

- Oblea vence a 1 año de la instalación
- PH de cilindro vence a 5 años
- Máximo 4 cilindros por equipo
- Número de serie único por cilindro

## Endpoints

```
GET/POST   /api/v1/equipos-gnc
GET/PUT    /api/v1/equipos-gnc/:id
DELETE     /api/v1/equipos-gnc/:id
```
