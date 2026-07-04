# Estándares de Código

Ver también `.cursor/rules/09-coding-standards.mdc`

## Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Variables | camelCase | `fechaVencimiento` |
| Componentes | PascalCase | `ClienteTable` |
| Constantes | UPPER_CASE | `MAX_CILINDROS` |
| Archivos | kebab-case | `cliente-table.tsx` |
| Interfaces | I prefix | `ICliente` |
| DTOs | Sufijo DTO | `CreateVehicleDTO` |

## Estructura de archivos backend

```
app/modules/clientes/
  controllers/cliente_controller.ts
  services/cliente_service.ts
  repositories/cliente_repository.ts
  validators/create_cliente_validator.ts
  policies/cliente_policy.ts
  dtos/create_cliente_dto.ts
  models/cliente.ts
```

## Estructura de archivos frontend

```
src/pages/clientes/
  ClientesPage.tsx
  ClienteDetailPage.tsx
src/components/clientes/
  ClienteTable.tsx
  ClienteForm.tsx
src/hooks/
  useClientes.ts
src/services/
  clienteService.ts
```

## Prohibiciones

- `any`, funciones 300+ líneas, hardcode, SQL repetido
- Lógica en controllers, consultas desde React
- Componentes duplicados o enormes
