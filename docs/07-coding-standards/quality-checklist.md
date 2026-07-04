# Checklist de Calidad por Tarea

Antes de finalizar cualquier tarea de desarrollo, verificar:

## Código
- [ ] Sin tipo `any`
- [ ] Sin funciones > 150 líneas
- [ ] Sin valores hardcodeados
- [ ] Naming conventions respetadas
- [ ] Imports limpios y ordenados

## Arquitectura
- [ ] Lógica en Service, no en Controller
- [ ] Datos vía Repository, no SQL directo
- [ ] Módulos no acoplados entre sí
- [ ] DTOs tipados para entrada/salida

## Seguridad
- [ ] Policies aplicadas
- [ ] Validación con VineJS/Zod
- [ ] Acciones auditadas

## Frontend
- [ ] Componentes pequeños y reutilizables
- [ ] Loading, empty y error states
- [ ] Formularios validados
- [ ] Sin consultas directas al API desde componentes

## Tests
- [ ] Tests unitarios para lógica de negocio
- [ ] Tests pasan localmente

## Performance
- [ ] Paginación server-side en listados
- [ ] Índices en campos de búsqueda
- [ ] Sin N+1 queries
