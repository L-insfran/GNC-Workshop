import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('stock_movimientos', (table) => {
      table
        .uuid('orden_trabajo_id')
        .nullable()
        .references('id')
        .inTable('ordenes_trabajo')
        .onDelete('SET NULL')
      table.index(['orden_trabajo_id'], 'idx_stock_movimientos_orden_trabajo_id')
    })
  }

  async down() {
    this.schema.alterTable('stock_movimientos', (table) => {
      table.dropIndex(['orden_trabajo_id'], 'idx_stock_movimientos_orden_trabajo_id')
      table.dropColumn('orden_trabajo_id')
    })
  }
}
