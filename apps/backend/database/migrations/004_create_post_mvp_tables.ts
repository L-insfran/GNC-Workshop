import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('categorias_producto', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('nombre', 100).notNullable().unique()
      table.text('descripcion').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('productos', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('codigo', 50).notNullable().unique()
      table.string('nombre', 255).notNullable()
      table.uuid('categoria_id').nullable().references('id').inTable('categorias_producto').onDelete('SET NULL')
      table.decimal('precio_compra', 12, 2).notNullable().defaultTo(0)
      table.decimal('precio_venta', 12, 2).notNullable().defaultTo(0)
      table.integer('stock_minimo').notNullable().defaultTo(0)
      table.string('unidad_medida', 20).notNullable().defaultTo('unidad')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })

    this.schema.createTable('stock_movimientos', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('producto_id').notNullable().references('id').inTable('productos').onDelete('RESTRICT')
      table.enum('tipo', ['ingreso', 'egreso', 'ajuste']).notNullable()
      table.integer('cantidad').notNullable()
      table.text('motivo').nullable()
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('cajas', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('nombre', 100).notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('caja_movimientos', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('caja_id').notNullable().references('id').inTable('cajas').onDelete('RESTRICT')
      table.enum('tipo', ['ingreso', 'egreso']).notNullable()
      table.decimal('monto', 12, 2).notNullable()
      table.string('concepto', 255).notNullable()
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('facturas', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('numero', 20).notNullable().unique()
      table.uuid('cliente_id').notNullable().references('id').inTable('clientes').onDelete('RESTRICT')
      table.uuid('orden_trabajo_id').nullable().references('id').inTable('ordenes_trabajo').onDelete('SET NULL')
      table.enum('tipo', ['factura_a', 'factura_b', 'factura_c', 'nota_credito']).notNullable()
      table.decimal('subtotal', 12, 2).notNullable()
      table.decimal('iva', 12, 2).notNullable().defaultTo(0)
      table.decimal('total', 12, 2).notNullable()
      table.enum('estado', ['borrador', 'emitida', 'anulada']).notNullable().defaultTo('borrador')
      table.timestamp('fecha_emision', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })

    this.schema.createTable('turnos', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('cliente_id').notNullable().references('id').inTable('clientes').onDelete('RESTRICT')
      table.uuid('vehiculo_id').nullable().references('id').inTable('vehiculos').onDelete('SET NULL')
      table.timestamp('fecha_hora', { useTz: true }).notNullable()
      table.enum('estado', ['pendiente', 'confirmado', 'cancelado', 'completado']).notNullable().defaultTo('pendiente')
      table.text('notas').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })

    this.schema.createTable('campanas', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('nombre', 255).notNullable()
      table.enum('canal', ['email', 'whatsapp', 'sms']).notNullable()
      table.enum('estado', ['borrador', 'programada', 'enviada', 'cancelada']).notNullable().defaultTo('borrador')
      table.text('contenido').notNullable()
      table.timestamp('fecha_envio', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('campanas')
    this.schema.dropTable('turnos')
    this.schema.dropTable('facturas')
    this.schema.dropTable('caja_movimientos')
    this.schema.dropTable('cajas')
    this.schema.dropTable('stock_movimientos')
    this.schema.dropTable('productos')
    this.schema.dropTable('categorias_producto')
  }
}
