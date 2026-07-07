import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('stock_reservas', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('producto_id')
        .notNullable()
        .references('id')
        .inTable('productos')
        .onDelete('RESTRICT')
      table
        .uuid('orden_trabajo_id')
        .notNullable()
        .references('id')
        .inTable('ordenes_trabajo')
        .onDelete('RESTRICT')
      table
        .uuid('ot_item_id')
        .notNullable()
        .references('id')
        .inTable('ot_items')
        .onDelete('RESTRICT')
      table.integer('cantidad').notNullable()
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('released_at', { useTz: true }).nullable()
      table.string('motivo_liberacion', 50).nullable()

      table.index(['producto_id'])
      table.index(['orden_trabajo_id'])
      table.index(['ot_item_id'])
      table.index(['released_at'])
    })

    this.schema.raw(`
      CREATE UNIQUE INDEX stock_reservas_ot_item_activa_unique
      ON stock_reservas (ot_item_id)
      WHERE released_at IS NULL
    `)
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS stock_reservas_ot_item_activa_unique')
    this.schema.dropTable('stock_reservas')
  }
}
