import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('vehiculos', (table) => {
      table.dropUnique(['patente'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS vehiculos_patente_unique_active
        ON vehiculos (patente)
        WHERE deleted_at IS NULL
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS vehiculos_patente_unique_active')
    })

    this.schema.alterTable('vehiculos', (table) => {
      table.unique(['patente'])
    })
  }
}
