import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { esPruebaHidraulica, esRenovacionOblea } from '@gnc/shared-types'
import EquipoGnc from '#models/equipo_gnc'
import Cilindro from '#models/cilindro'
import type TipoTrabajo from '#models/tipo_trabajo'

const OBLEA_YEARS = 1
const PH_YEARS = 5

export default class OtEquipoRegulatoryService {
  async aplicarAlFinalizar(
    equipoGncId: string,
    tipoTrabajo: TipoTrabajo,
    trx: TransactionClientContract
  ): Promise<void> {
    const nombre = tipoTrabajo.nombre
    const hoy = DateTime.now().setZone('utc').startOf('day')

    if (esRenovacionOblea(nombre)) {
      await this.renovarOblea(equipoGncId, hoy, trx)
      return
    }

    if (esPruebaHidraulica(nombre)) {
      await this.renovarPhCilindros(equipoGncId, hoy, trx)
    }
  }

  private async renovarOblea(
    equipoGncId: string,
    hoy: DateTime,
    trx: TransactionClientContract
  ): Promise<void> {
    const nuevaFecha = hoy.plus({ years: OBLEA_YEARS })

    await EquipoGnc.query({ client: trx })
      .where('id', equipoGncId)
      .whereNull('deleted_at')
      .update({
        fecha_vencimiento_oblea: nuevaFecha.toISODate(),
        estado: 'activo',
        updated_at: DateTime.now().toSQL(),
      })
  }

  private async renovarPhCilindros(
    equipoGncId: string,
    hoy: DateTime,
    trx: TransactionClientContract
  ): Promise<void> {
    const nuevaVencimiento = hoy.plus({ years: PH_YEARS })
    const now = DateTime.now().toSQL()

    await Cilindro.query({ client: trx })
      .where('equipo_gnc_id', equipoGncId)
      .whereNull('deleted_at')
      .whereNot('estado', 'retirado')
      .update({
        fecha_ultima_ph: hoy.toISODate(),
        fecha_vencimiento_ph: nuevaVencimiento.toISODate(),
        estado: 'activo',
        updated_at: now,
      })
  }
}
