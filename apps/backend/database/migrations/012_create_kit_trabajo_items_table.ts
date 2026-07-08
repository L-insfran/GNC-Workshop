import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('kit_trabajo_items', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('tipo_trabajo_id')
        .notNullable()
        .references('id')
        .inTable('tipos_trabajo')
        .onDelete('CASCADE')
      table.enum('tipo', ['servicio', 'repuesto', 'material']).notNullable()
      table
        .uuid('producto_id')
        .nullable()
        .references('id')
        .inTable('productos')
        .onDelete('SET NULL')
      table.string('descripcion', 255).notNullable()
      table.decimal('cantidad', 10, 2).notNullable().defaultTo(1)
      table.decimal('precio_unitario', 12, 2).nullable()
      table.boolean('es_estimado').notNullable().defaultTo(true)
      table.integer('orden').notNullable().defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['tipo_trabajo_id'])
      table.index(['producto_id'])
    })
  }

  async down() {
    this.schema.dropTable('kit_trabajo_items')
  }
}
