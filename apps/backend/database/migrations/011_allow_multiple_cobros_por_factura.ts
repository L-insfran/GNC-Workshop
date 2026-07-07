import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Permite múltiples ingresos (seña + saldo) vinculados a la misma factura.
 * La migración 009 creó un índice único pensado para cobro único; los cobros
 * parciales requieren eliminarlo.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS caja_movimientos_factura_ingreso_unique')
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS caja_movimientos_factura_ingreso_unique
        ON caja_movimientos (factura_id)
        WHERE factura_id IS NOT NULL AND tipo = 'ingreso'
      `)
    })
  }
}
