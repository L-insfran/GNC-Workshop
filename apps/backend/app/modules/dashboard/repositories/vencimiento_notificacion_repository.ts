import { DateTime } from 'luxon'
import VencimientoNotificacion from '#models/vencimiento_notificacion'

export interface IRegistrarNotificacionDTO {
  alertaId: string
  tipo: 'oblea' | 'ph'
  entidadTipo: 'equipo' | 'cilindro'
  entidadId: string
  clienteId: string
  equipoGncId: string
  fechaVencimiento: string
  canal: 'whatsapp' | 'email'
  modo: 'asistido' | 'automatico'
  estado: 'enviado' | 'fallido' | 'omitido'
  destino: string | null
  mensaje: string | null
  providerMessageId: string | null
  notificadoPor: string | null
}

export default class VencimientoNotificacionRepository {
  async findEnviadasKeys(keys: Array<{ alertaId: string; fechaVencimiento: string }>): Promise<Set<string>> {
    if (keys.length === 0) return new Set()

    const alertaIds = [...new Set(keys.map((k) => k.alertaId))]
    const rows = await VencimientoNotificacion.query()
      .whereIn('alerta_id', alertaIds)
      .where('estado', 'enviado')

    const wanted = new Set(keys.map((k) => `${k.alertaId}|${k.fechaVencimiento}`))
    const found = new Set<string>()

    for (const row of rows) {
      const fecha = row.fechaVencimiento.toISODate()!
      const key = `${row.alertaId}|${fecha}`
      if (wanted.has(key)) found.add(key)
    }

    return found
  }

  async create(dto: IRegistrarNotificacionDTO): Promise<VencimientoNotificacion> {
    return VencimientoNotificacion.create({
      alertaId: dto.alertaId,
      tipo: dto.tipo,
      entidadTipo: dto.entidadTipo,
      entidadId: dto.entidadId,
      clienteId: dto.clienteId,
      equipoGncId: dto.equipoGncId,
      fechaVencimiento: DateTime.fromISO(dto.fechaVencimiento),
      canal: dto.canal,
      modo: dto.modo,
      estado: dto.estado,
      destino: dto.destino,
      mensaje: dto.mensaje,
      providerMessageId: dto.providerMessageId,
      notificadoPor: dto.notificadoPor,
      notificadoAt: DateTime.now(),
    })
  }
}
