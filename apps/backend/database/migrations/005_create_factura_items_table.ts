import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('factura_items', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('factura_id')
        .notNullable()
        .references('id')
        .inTable('facturas')
        .onDelete('CASCADE')
      table.string('descripcion', 255).notNullable()
      table.decimal('cantidad', 12, 2).notNullable().defaultTo(1)
      table.decimal('precio_unitario', 12, 2).notNullable()
      table.decimal('subtotal', 12, 2).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['factura_id'])
    })

    this.schema.alterTable('productos', (table) => {
      table.integer('stock_actual').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable('productos', (table) => {
      table.dropColumn('stock_actual')
    })
    this.schema.dropTable('factura_items')
  }
}
