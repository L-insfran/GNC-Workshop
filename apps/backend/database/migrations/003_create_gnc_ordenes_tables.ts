import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('equipos_gnc', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('vehiculo_id')
        .notNullable()
        .references('id')
        .inTable('vehiculos')
        .onDelete('RESTRICT')
      table.string('numero_serie_equipo', 50).notNullable().unique()
      table.string('marca_regulador', 100).notNullable()
      table.string('modelo_regulador', 100).notNullable()
      table.date('fecha_instalacion').notNullable()
      table.date('fecha_vencimiento_oblea').notNullable()
      table
        .enum('estado', ['activo', 'vencido', 'desinstalado', 'en_revision'])
        .notNullable()
        .defaultTo('activo')
      table.string('certificador_crpc', 100).nullable()
      table.text('notas').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['vehiculo_id'])
      table.index(['fecha_vencimiento_oblea'])
    })

    this.schema.createTable('cilindros', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('equipo_gnc_id')
        .notNullable()
        .references('id')
        .inTable('equipos_gnc')
        .onDelete('RESTRICT')
      table.string('numero_serie', 50).notNullable().unique()
      table.decimal('capacidad_m3', 5, 2).notNullable()
      table.string('marca', 100).notNullable()
      table.date('fecha_fabricacion').nullable()
      table.date('fecha_ultima_ph').notNullable()
      table.date('fecha_vencimiento_ph').notNullable()
      table.enum('estado', ['activo', 'vencido', 'retirado', 'en_ph']).notNullable().defaultTo('activo')
      table.smallint('posicion').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['equipo_gnc_id'])
      table.index(['fecha_vencimiento_ph'])
    })

    this.schema.createTable('tipos_trabajo', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('nombre', 100).notNullable().unique()
      table.text('descripcion').nullable()
      table.integer('duracion_estimada_horas').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('ordenes_trabajo', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('numero', 20).notNullable().unique()
      table
        .uuid('cliente_id')
        .notNullable()
        .references('id')
        .inTable('clientes')
        .onDelete('RESTRICT')
      table
        .uuid('vehiculo_id')
        .notNullable()
        .references('id')
        .inTable('vehiculos')
        .onDelete('RESTRICT')
      table
        .uuid('equipo_gnc_id')
        .nullable()
        .references('id')
        .inTable('equipos_gnc')
        .onDelete('SET NULL')
      table
        .uuid('tipo_trabajo_id')
        .notNullable()
        .references('id')
        .inTable('tipos_trabajo')
        .onDelete('RESTRICT')
      table
        .enum('estado', [
          'borrador',
          'recepcion',
          'en_taller',
          'en_espera_repuesto',
          'control_calidad',
          'finalizada',
          'entregada',
          'cancelada',
        ])
        .notNullable()
        .defaultTo('borrador')
      table.enum('prioridad', ['baja', 'normal', 'alta', 'urgente']).notNullable().defaultTo('normal')
      table.timestamp('fecha_ingreso', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('fecha_estimada_entrega', { useTz: true }).nullable()
      table.timestamp('fecha_entrega_real', { useTz: true }).nullable()
      table.uuid('mecanico_asignado_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.uuid('recepcionista_id').notNullable().references('id').inTable('users').onDelete('RESTRICT')
      table.integer('kilometraje_ingreso').nullable()
      table.text('descripcion_problema').nullable()
      table.text('observaciones_internas').nullable()
      table.decimal('total_estimado', 12, 2).nullable()
      table.decimal('total_final', 12, 2).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['cliente_id'])
      table.index(['vehiculo_id'])
      table.index(['estado'])
      table.index(['fecha_ingreso'])
    })

    this.schema.createTable('ot_estados_historial', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('orden_trabajo_id')
        .notNullable()
        .references('id')
        .inTable('ordenes_trabajo')
        .onDelete('CASCADE')
      table.string('estado_anterior', 50).nullable()
      table.string('estado_nuevo', 50).notNullable()
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.text('observacion').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('ot_estados_historial')
    this.schema.dropTable('ordenes_trabajo')
    this.schema.dropTable('tipos_trabajo')
    this.schema.dropTable('cilindros')
    this.schema.dropTable('equipos_gnc')
  }
}
