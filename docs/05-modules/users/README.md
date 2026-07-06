# Módulo Users

Gestión de usuarios del sistema y asignación de roles (RBAC).

## Roles disponibles

| Rol | Acceso típico |
|-----|---------------|
| Administrador | Acceso total, configuración, usuarios |
| Supervisor | Supervisión operativa, catálogos |
| Recepción | Clientes, vehículos, OT recepción |
| Mecánico | OT en taller |
| Caja | Cobros y facturación |
| Depósito | Inventario y categorías |
| Invitado | Solo lectura limitada |

## Alta de usuario

1. Ir a **Configuración → Usuarios → Nuevo**
2. Completar email, nombre, contraseña (mín. 8 caracteres)
3. Seleccionar uno o más roles
4. El sidebar y rutas del frontend se adaptan al rol primario del usuario

## API

```
GET    /api/v1/users
POST   /api/v1/users        { email, password, fullName, roleIds[], ... }
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/roles
```

Solo el rol **Administrador** puede gestionar usuarios (validado en backend y frontend).

## Reglas de seguridad

- Un administrador no puede desactivarse ni quitarse su propio rol administrador
- Contraseñas hasheadas con scrypt (AdonisJS Auth)
- Acciones auditadas en `audit_logs`

## Usuario inicial (seed)

- Email: `admin@gnc.local`
- Password: `Admin123!`
- Rol: Administrador
