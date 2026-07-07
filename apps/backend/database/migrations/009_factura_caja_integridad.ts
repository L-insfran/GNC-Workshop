import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('facturas', (table) => {
      table
        .uuid('factura_referencia_id')
        .nullable()
        .references('id')
        .inTable('facturas')
        .onDelete('SET NULL')
    })

    this.schema.alterTable('caja_movimientos', (table) => {
      table
        .uuid('factura_id')
        .nullable()
        .references('id')
        .inTable('facturas')
        .onDelete('SET NULL')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS facturas_ot_activa_unique
        ON facturas (orden_trabajo_id)
        WHERE orden_trabajo_id IS NOT NULL
          AND estado IN ('borrador', 'emitida')
          AND deleted_at IS NULL
      `)

      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS caja_movimientos_factura_ingreso_unique
        ON caja_movimientos (factura_id)
        WHERE factura_id IS NOT NULL AND tipo = 'ingreso'
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS caja_movimientos_factura_ingreso_unique')
      await db.rawQuery('DROP INDEX IF EXISTS facturas_ot_activa_unique')
    })

    this.schema.alterTable('caja_movimientos', (table) => {
      table.dropColumn('factura_id')
    })

    this.schema.alterTable('facturas', (table) => {
      table.dropColumn('factura_referencia_id')
    })
  }
}
