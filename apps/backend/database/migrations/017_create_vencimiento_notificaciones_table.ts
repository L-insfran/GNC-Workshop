import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vencimiento_notificaciones'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('alerta_id', 80).notNullable()
      table.enum('tipo', ['oblea', 'ph']).notNullable()
      table.enum('entidad_tipo', ['equipo', 'cilindro']).notNullable()
      table.uuid('entidad_id').notNullable()
      table.uuid('cliente_id').notNullable().references('id').inTable('clientes').onDelete('RESTRICT')
      table.uuid('equipo_gnc_id').notNullable()
      table.date('fecha_vencimiento').notNullable()
      table.enum('canal', ['whatsapp', 'email']).notNullable()
      table.enum('modo', ['asistido', 'automatico']).notNullable().defaultTo('asistido')
      table.enum('estado', ['enviado', 'fallido', 'omitido']).notNullable().defaultTo('enviado')
      table.string('destino', 255).nullable()
      table.text('mensaje').nullable()
      table.string('provider_message_id', 255).nullable()
      table.uuid('notificado_por').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('notificado_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['alerta_id', 'fecha_vencimiento'], 'idx_venc_notif_alerta_fecha')
      table.index(['cliente_id'], 'idx_venc_notif_cliente')
      table.index(['notificado_at'], 'idx_venc_notif_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
