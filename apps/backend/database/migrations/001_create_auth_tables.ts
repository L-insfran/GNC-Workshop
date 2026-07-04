import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    this.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('full_name', 255).notNullable()
      table.string('phone', 50).nullable()
      table.text('avatar_url').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('last_login_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })

    this.schema.createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name', 50).notNullable().unique()
      table.string('display_name', 100).notNullable()
      table.text('description').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable('user_roles', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE')
      table.unique(['user_id', 'role_id'])
    })

    this.schema.createTable('auth_access_tokens', (table) => {
      table.increments('id')
      table
        .uuid('tokenable_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('last_used_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
    })

    this.schema.createTable('audit_logs', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('action', 50).notNullable()
      table.string('entity_type', 100).notNullable()
      table.uuid('entity_id').nullable()
      table.jsonb('old_values').nullable()
      table.jsonb('new_values').nullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['entity_type', 'entity_id'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable('audit_logs')
    this.schema.dropTable('auth_access_tokens')
    this.schema.dropTable('user_roles')
    this.schema.dropTable('roles')
    this.schema.dropTable('users')
  }
}
