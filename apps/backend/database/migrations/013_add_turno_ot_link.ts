import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('turnos', (table) => {
      table
        .uuid('tipo_trabajo_id')
        .nullable()
        .references('id')
        .inTable('tipos_trabajo')
        .onDelete('SET NULL')
      table
        .uuid('orden_trabajo_id')
        .nullable()
        .unique()
        .references('id')
        .inTable('ordenes_trabajo')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable('turnos', (table) => {
      table.dropColumn('orden_trabajo_id')
      table.dropColumn('tipo_trabajo_id')
    })
  }
}
