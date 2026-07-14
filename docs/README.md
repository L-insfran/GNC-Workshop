# GNC Workshop Management System - Documentación Técnica

ERP especializado para talleres de GNC (Gas Natural Comprimido) en Argentina.

> **Estado del producto:** ver [10-roadmap](10-roadmap/README.md) (sincronizado julio 2026).
> El modelo de datos en `03-data-model/` incluye el diseño objetivo (80+ tablas); el esquema migrado cubre el MVP operativo.

## Índice

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Visión del Producto](01-vision/product-vision.md) | Qué es, para quién, objetivos |
| 02 | [Arquitectura](02-architecture/system-architecture.md) | Stack, capas, flujos, diagramas |
| 03 | [Modelo de Datos](03-data-model/README.md) | ERD objetivo, catálogo, relaciones |
| 04 | [Reglas de Negocio](04-business-rules/README.md) | Reglas GNC por módulo |
| 05 | [Módulos](05-modules/README.md) | Catálogo, estado real y flujos |
| 06 | [Design System](06-design-system/README.md) | UI/UX, tokens, componentes |
| 07 | [Estándares de Código](07-coding-standards/README.md) | Convenciones y prohibiciones |
| 08 | [Seguridad](08-security/README.md) | RBAC, auditoría, políticas |
| 09 | [Deployment](09-deployment/README.md) | Docker, Nginx, CI/CD |
| 10 | [Roadmap](10-roadmap/README.md) | Fases y estado real de implementación |

## Convenciones

- Toda documentación en español
- Diagramas en Mermaid
- Cada módulo tiene su README con estado (implementado / parcial / pendiente)
- Actualizar docs y roadmap al implementar cambios significativos
