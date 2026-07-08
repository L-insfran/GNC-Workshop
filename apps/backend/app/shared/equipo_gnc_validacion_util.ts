import { DateTime } from 'luxon'
import type EquipoGnc from '#models/equipo_gnc'
import type Cilindro from '#models/cilindro'
import { permiteObleaVencida, permitePhVencida } from '@gnc/shared-types'

export function validarEquipoParaNuevaOt(
  equipo: EquipoGnc,
  cilindros: Cilindro[],
  tipoTrabajoNombre: string
): void {
  const hoy = DateTime.now().startOf('day')

  if (!permiteObleaVencida(tipoTrabajoNombre)) {
    const vencimientoOblea = equipo.fechaVencimientoOblea.startOf('day')
    if (vencimientoOblea < hoy) {
      throw new Error('OBLEA_VENCIDA')
    }
  }

  if (!permitePhVencida(tipoTrabajoNombre)) {
    const cilindrosActivos = cilindros.filter(
      (c) => c.estado === 'activo' || c.estado === 'vencido' || c.estado === 'en_ph'
    )

    const phVencida = cilindrosActivos.some(
      (cilindro) => cilindro.fechaVencimientoPh.startOf('day') < hoy
    )

    if (phVencida) {
      throw new Error('PH_VENCIDA')
    }
  }
}
