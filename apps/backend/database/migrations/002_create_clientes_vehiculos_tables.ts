import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('clientes', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.enum('tipo', ['persona_fisica', 'persona_juridica']).notNullable()
      table.string('razon_social', 255).notNullable()
      table.string('nombre', 100).nullable()
      table.string('apellido', 100).nullable()
      table.enum('documento_tipo', ['dni', 'cuit', 'cuil']).notNullable()
      table.string('documento_numero', 20).notNullable().unique()
      table.string('email', 255).nullable()
      table.string('telefono', 50).nullable()
      table.string('telefono_alt', 50).nullable()
      table
        .enum('condicion_iva', [
          'responsable_inscripto',
          'monotributo',
          'consumidor_final',
          'exento',
        ])
        .notNullable()
      table.text('notas').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['documento_numero'])
      table.index(['razon_social'])
    })

    this.schema.createTable('vehiculo_marcas', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('nombre', 100).notNullable().unique()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('vehiculo_modelos', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('marca_id')
        .notNullable()
        .references('id')
        .inTable('vehiculo_marcas')
        .onDelete('RESTRICT')
      table.string('nombre', 100).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['marca_id', 'nombre'])
    })

    this.schema.createTable('vehiculos', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('cliente_id')
        .notNullable()
        .references('id')
        .inTable('clientes')
        .onDelete('RESTRICT')
      table.string('patente', 10).notNullable().unique()
      table
        .uuid('marca_id')
        .notNullable()
        .references('id')
        .inTable('vehiculo_marcas')
        .onDelete('RESTRICT')
      table
        .uuid('modelo_id')
        .notNullable()
        .references('id')
        .inTable('vehiculo_modelos')
        .onDelete('RESTRICT')
      table.smallint('anio').notNullable()
      table.string('color', 50).nullable()
      table.enum('tipo_combustible', ['nafta', 'diesel', 'gnc', 'dual']).notNullable()
      table.string('numero_motor', 50).nullable()
      table.string('numero_chasis', 50).nullable()
      table.integer('kilometraje').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['cliente_id'])
      table.index(['patente'])
    })
  }

  async down() {
    this.schema.dropTable('vehiculos')
    this.schema.dropTable('vehiculo_modelos')
    this.schema.dropTable('vehiculo_marcas')
    this.schema.dropTable('clientes')
  }
}
