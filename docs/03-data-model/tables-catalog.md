# Catálogo de Tablas - Definición Detallada

> Catálogo de **diseño objetivo**. No todas las tablas listadas existen en migraciones.
> Estado de módulos: [docs/10-roadmap](../10-roadmap/README.md).

## Auth & Users

### users
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password | VARCHAR(255) | scrypt hash |
| full_name | VARCHAR(255) | |
| phone | VARCHAR(50) | nullable |
| avatar_url | TEXT | nullable |
| is_active | BOOLEAN DEFAULT true | |
| last_login_at | TIMESTAMPTZ | nullable |
| created_at, updated_at, deleted_at | TIMESTAMPTZ | |

### roles
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| name | VARCHAR(50) UNIQUE | administrador, supervisor, etc. |
| display_name | VARCHAR(100) | |
| description | TEXT | nullable |

### permissions, role_permissions, user_roles, access_tokens, password_reset_tokens, sessions
Tablas estándar RBAC y auth de AdonisJS.

---

## Clientes

### clientes
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| tipo | ENUM | persona_fisica, persona_juridica |
| razon_social | VARCHAR(255) | |
| nombre, apellido | VARCHAR(100) | nullable (PF) |
| documento_tipo | ENUM | dni, cuit, cuil |
| documento_numero | VARCHAR(20) UNIQUE | |
| email | VARCHAR(255) | nullable |
| telefono | VARCHAR(50) | nullable |
| telefono_alt | VARCHAR(50) | nullable |
| condicion_iva | ENUM | responsable_inscripto, monotributo, consumidor_final, exento |
| notas | TEXT | nullable |
| is_active | BOOLEAN DEFAULT true | |
| created_by | UUID FK users | |

### cliente_contactos, cliente_direcciones, cliente_documentos, cliente_notas, cliente_tags
Tablas relacionadas 1-N con clientes.

---

## Vehículos

### vehiculos
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| cliente_id | UUID FK clientes | |
| patente | VARCHAR(10) UNIQUE | formato AR |
| marca_id | UUID FK vehiculo_marcas | |
| modelo_id | UUID FK vehiculo_modelos | |
| anio | SMALLINT | |
| color | VARCHAR(50) | nullable |
| tipo_combustible | ENUM | nafta, diesel, gnc, dual |
| numero_motor | VARCHAR(50) | nullable |
| numero_chasis | VARCHAR(50) | nullable |
| kilometraje | INTEGER | nullable |
| is_active | BOOLEAN DEFAULT true | |

---

## Equipos GNC

### equipos_gnc
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| vehiculo_id | UUID FK vehiculos | |
| numero_serie_equipo | VARCHAR(50) UNIQUE | |
| marca_regulador | VARCHAR(100) | |
| modelo_regulador | VARCHAR(100) | |
| fecha_instalacion | DATE | |
| fecha_vencimiento_oblea | DATE | calculado +1 año |
| estado | ENUM | activo, vencido, desinstalado, en_revision |
| certificador_crpc | VARCHAR(100) | nullable |
| notas | TEXT | nullable |

### cilindros
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| equipo_gnc_id | UUID FK equipos_gnc | |
| numero_serie | VARCHAR(50) UNIQUE | |
| capacidad_m3 | DECIMAL(5,2) | |
| marca | VARCHAR(100) | |
| fecha_fabricacion | DATE | nullable |
| fecha_ultima_ph | DATE | |
| fecha_vencimiento_ph | DATE | calculado +5 años |
| estado | ENUM | activo, vencido, retirado, en_ph |
| posicion | SMALLINT | 1, 2, 3... |

### oblea_certificados, ph_certificados, reguladores, equipo_componentes, equipo_documentos, equipo_historial
Historial y certificados asociados al equipo.

---

## Órdenes de Trabajo

### ordenes_trabajo
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| numero | VARCHAR(20) UNIQUE | auto-generado OT-YYYY-NNNNN |
| cliente_id | UUID FK clientes | |
| vehiculo_id | UUID FK vehiculos | |
| equipo_gnc_id | UUID FK equipos_gnc | nullable |
| tipo_trabajo_id | UUID FK tipos_trabajo | |
| estado | ENUM | borrador, recepcion, en_taller, en_espera_repuesto, control_calidad, finalizada, entregada, cancelada |
| prioridad | ENUM | baja, normal, alta, urgente |
| fecha_ingreso | TIMESTAMPTZ | |
| fecha_estimada_entrega | TIMESTAMPTZ | nullable |
| fecha_entrega_real | TIMESTAMPTZ | nullable |
| mecanico_asignado_id | UUID FK users | nullable |
| recepcionista_id | UUID FK users | |
| kilometraje_ingreso | INTEGER | nullable |
| descripcion_problema | TEXT | nullable |
| observaciones_internas | TEXT | nullable |
| total_estimado | DECIMAL(12,2) | nullable |
| total_final | DECIMAL(12,2) | nullable |

### ot_items, ot_estados_historial, ot_checklist_items, ot_fotos, ot_notas, ot_tiempos, ot_repuestos, ot_servicios, tipos_trabajo
Detalle y seguimiento de la OT.

---

## Inventario (9 tablas)

### productos
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| codigo | VARCHAR(50) UNIQUE | |
| nombre | VARCHAR(255) | |
| categoria_id | UUID FK | |
| precio_compra | DECIMAL(12,2) | |
| precio_venta | DECIMAL(12,2) | |
| stock_minimo | INTEGER DEFAULT 0 | |
| unidad_medida | VARCHAR(20) | unidad, metro, litro |
| is_active | BOOLEAN | |

### categorias_producto, proveedores, stock_movimientos, stock_actual, depositos, deposito_ubicaciones, ordenes_compra, orden_compra_items

---

## Caja (6 tablas)
`cajas`, `caja_movimientos`, `caja_arqueos`, `metodos_pago`, `cobros`, `cobro_items`

## Facturación (8 tablas)
`facturas`, `factura_items`, `notas_credito`, `tipos_comprobante`, `puntos_venta`, `afip_config`, `afip_logs`, `impuestos`

## Agenda (4 tablas)
`turnos`, `turno_tipos`, `calendario_bloqueos`, `turno_recordatorios`

## Dashboard & Reportes (3 tablas)
`dashboard_widgets`, `reportes_config`, `reportes_ejecuciones`

## Configuración (6 tablas)
`config_taller`, `config_sucursales`, `config_parametros`, `config_feriados`, `config_plantillas`, `config_numeracion`

## Marketing (4 tablas)
`campanas`, `campana_destinatarios`, `plantillas_comunicacion`, `comunicacion_logs`

## Auditoría & Seguridad (4 tablas)

### audit_logs
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| user_id | UUID FK users | nullable (sistema) |
| action | VARCHAR(50) | create, update, delete, export |
| entity_type | VARCHAR(100) | nombre de tabla/entidad |
| entity_id | UUID | |
| old_values | JSONB | nullable |
| new_values | JSONB | nullable |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | nullable |
| created_at | TIMESTAMPTZ | |

### login_attempts, ip_whitelist, security_events

## Notificaciones (4 tablas)
`notificaciones`, `notificacion_preferencias`, `notificacion_plantillas`, `notificacion_logs`

## Soporte (6 tablas)
`archivos`, `etiquetas`, `etiqueta_entidades`, `comentarios`, `adjuntos`, `versiones_documento`
