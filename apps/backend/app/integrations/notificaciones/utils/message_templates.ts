import type { IVencimientoAlerta } from '@gnc/shared-types'
import notificacionesConfig from '#config/notificaciones'

export function buildVencimientoMensaje(
  alerta: Pick<
    IVencimientoAlerta,
    'tipo' | 'descripcion' | 'vehiculoPatente' | 'clienteNombre' | 'fechaVencimiento' | 'diasRestantes'
  >
): { asunto: string; mensaje: string; motivo: string } {
  const taller = notificacionesConfig.tallerNombre
  const conceptoOk = alerta.tipo === 'oblea' ? 'oblea GNC' : 'prueba hidráulica (PH)'

  const motivo =
    alerta.tipo === 'oblea'
      ? 'Oblea GNC próxima a vencer o vencida'
      : 'Prueba hidráulica próxima a vencer o vencida'

  const estadoDias =
    alerta.diasRestantes < 0
      ? `venció hace ${Math.abs(alerta.diasRestantes)} día(s)`
      : alerta.diasRestantes === 0
        ? 'vence hoy'
        : `vence en ${alerta.diasRestantes} día(s)`

  const asunto = `${taller}: recordatorio de ${conceptoOk} — ${alerta.vehiculoPatente}`

  const mensaje = [
    `Hola ${alerta.clienteNombre},`,
    '',
    `Le escribimos desde ${taller} para recordarle que la ${conceptoOk} de su vehículo ${alerta.vehiculoPatente} ${estadoDias} (${alerta.fechaVencimiento}).`,
    '',
    `Detalle: ${alerta.descripcion}.`,
    '',
    'Puede responder este mensaje o comunicarse con el taller para coordinar un turno.',
    '',
    `Saludos,\n${taller}`,
  ].join('\n')

  return { asunto, mensaje, motivo }
}
