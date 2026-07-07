import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('equipos_gnc', (table) => {
      table.dropUnique(['numero_serie_equipo'])
    })

    this.schema.alterTable('cilindros', (table) => {
      table.dropUnique(['numero_serie'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE cilindros
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE deleted_at IS NULL
          AND equipo_gnc_id IN (
            SELECT id FROM equipos_gnc WHERE deleted_at IS NOT NULL
          )
      `)

      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS equipos_gnc_numero_serie_unique_active
        ON equipos_gnc (numero_serie_equipo)
        WHERE deleted_at IS NULL
      `)
      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS cilindros_numero_serie_unique_active
        ON cilindros (numero_serie)
        WHERE deleted_at IS NULL
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS equipos_gnc_numero_serie_unique_active')
      await db.rawQuery('DROP INDEX IF EXISTS cilindros_numero_serie_unique_active')
    })

    this.schema.alterTable('equipos_gnc', (table) => {
      table.unique(['numero_serie_equipo'])
    })

    this.schema.alterTable('cilindros', (table) => {
      table.unique(['numero_serie'])
    })
  }
}
