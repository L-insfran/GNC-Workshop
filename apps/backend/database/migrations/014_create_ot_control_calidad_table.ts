import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('ot_control_calidad', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('orden_trabajo_id')
        .notNullable()
        .unique()
        .references('id')
        .inTable('ordenes_trabajo')
        .onDelete('CASCADE')
      table.boolean('sin_fugas').notNullable().defaultTo(false)
      table.boolean('presion_regulador_ok').notNullable().defaultTo(false)
      table.boolean('valvulas_seguridad_ok').notNullable().defaultTo(false)
      table.boolean('estanqueidad_ok').notNullable().defaultTo(false)
      table.boolean('documentacion_completa').notNullable().defaultTo(false)
      table.text('observaciones').nullable()
      table
        .uuid('aprobado_por_id')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('aprobado_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('ot_control_calidad')
  }
}
