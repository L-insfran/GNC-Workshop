import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('ot_items', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('orden_trabajo_id')
        .notNullable()
        .references('id')
        .inTable('ordenes_trabajo')
        .onDelete('RESTRICT')
      table.enum('tipo', ['servicio', 'repuesto', 'material']).notNullable()
      table
        .uuid('producto_id')
        .nullable()
        .references('id')
        .inTable('productos')
        .onDelete('SET NULL')
      table.string('descripcion', 255).notNullable()
      table.decimal('cantidad', 10, 2).notNullable().defaultTo(1)
      table.decimal('precio_unitario', 12, 2).notNullable()
      table.decimal('subtotal', 12, 2).notNullable()
      table.boolean('es_estimado').notNullable().defaultTo(true)
      table
        .uuid('created_by')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['orden_trabajo_id'])
      table.index(['producto_id'])
    })
  }

  async down() {
    this.schema.dropTable('ot_items')
  }
}
