-- Ejecutar en PostgreSQL si node ace migration:run no está disponible.
-- Crea la tabla de ítems de presupuesto de órdenes de trabajo (migración 006).

CREATE TABLE IF NOT EXISTS ot_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_trabajo_id uuid NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('servicio', 'repuesto', 'material')),
  producto_id uuid NULL REFERENCES productos(id) ON DELETE SET NULL,
  descripcion varchar(255) NOT NULL,
  cantidad decimal(10, 2) NOT NULL DEFAULT 1,
  precio_unitario decimal(12, 2) NOT NULL,
  subtotal decimal(12, 2) NOT NULL,
  es_estimado boolean NOT NULL DEFAULT true,
  created_by uuid NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS ot_items_orden_trabajo_id_index ON ot_items (orden_trabajo_id);
CREATE INDEX IF NOT EXISTS ot_items_producto_id_index ON ot_items (producto_id);

INSERT INTO adonis_schema (name, batch, migration_time)
SELECT
  'database/migrations/006_create_ot_items_table',
  COALESCE((SELECT MAX(batch) FROM adonis_schema), 0) + 1,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM adonis_schema WHERE name = 'database/migrations/006_create_ot_items_table'
);
