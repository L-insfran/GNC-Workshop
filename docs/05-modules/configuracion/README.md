# Módulo Configuración

Hub administrativo para parámetros y catálogos del taller.

## Sub-módulos

| Sección | Ruta | Roles |
|---------|------|-------|
| Hub | `/configuracion` | Administrador, Supervisor, Depósito |
| Usuarios | `/configuracion/usuarios` | Administrador |
| Marcas y modelos | `/configuracion/marcas-modelos` | Administrador, Supervisor |
| Categorías | `/configuracion/categorias` | Administrador, Supervisor, Depósito |

## APIs relacionadas

- `GET/POST/PUT/DELETE /api/v1/users` — solo administrador
- `GET /api/v1/roles` — solo administrador
- `GET/POST/PUT/DELETE /api/v1/vehiculo-marcas` — escritura: admin/supervisor
- `GET/POST/PUT/DELETE /api/v1/vehiculo-modelos` — escritura: admin/supervisor
- `GET/POST/PUT/DELETE /api/v1/inventario/categorias` — escritura: admin/supervisor/depósito

## Flujo

```mermaid
flowchart LR
  Hub[ConfiguracionPage] --> Users[Usuarios]
  Hub --> Marcas[MarcasModelos]
  Hub --> Cats[Categorias]
  Users --> APIUsers[users + roles API]
  Marcas --> APIMarcas[vehiculo-marcas/modelos API]
  Cats --> APICats[inventario/categorias API]
```

## Atajos operativos

- Formulario de producto: modal "+ Nueva categoría"
- Formulario de vehículo: link "Gestionar marcas y modelos"
- Formulario de OT: link "Registrar vehículo" si el cliente no tiene vehículos
