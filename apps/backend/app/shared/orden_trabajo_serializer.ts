import type OrdenTrabajo from '#models/orden_trabajo'
import type { IOrdenCobroResumen, IOrdenMargenResumen } from '@gnc/shared-types'
import { serializeVehiculo } from '#shared/vehiculo_serializer'

export function serializeOrdenTrabajo(
  orden: OrdenTrabajo,
  resumenCobro?: IOrdenCobroResumen,
  resumenMargen?: IOrdenMargenResumen
) {
  const data = orden.serialize() as Record<string, unknown>

  return {
    ...data,
    clienteNombre: orden.cliente?.razonSocial ?? null,
    vehiculoPatente: orden.vehiculo?.patente ?? null,
    vehiculoMarcaNombre: orden.vehiculo?.marca?.nombre ?? null,
    vehiculoModeloNombre: orden.vehiculo?.modelo?.nombre ?? null,
    equipoGncNumeroSerie: orden.equipoGnc?.numeroSerieEquipo ?? null,
    tipoTrabajoNombre: orden.tipoTrabajo?.nombre ?? null,
    mecanicoNombre: orden.mecanico?.fullName ?? null,
    recepcionistaNombre: orden.recepcionista?.fullName ?? null,
    resumenCobro,
    resumenMargen,
    cliente: orden.cliente?.serialize(),
    vehiculo: orden.vehiculo ? serializeVehiculo(orden.vehiculo) : undefined,
    equipoGnc: orden.equipoGnc?.serialize(),
    tipoTrabajo: orden.tipoTrabajo?.serialize(),
    mecanico: orden.mecanico?.serialize(),
    recepcionista: orden.recepcionista?.serialize(),
  }
}

export function serializeOrdenesTrabajo(
  ordenes: OrdenTrabajo[],
  resumenesCobro?: Map<string, IOrdenCobroResumen>,
  resumenesMargen?: Map<string, IOrdenMargenResumen>
) {
  return ordenes.map((orden) =>
    serializeOrdenTrabajo(
      orden,
      resumenesCobro?.get(orden.id),
      resumenesMargen?.get(orden.id)
    )
  )
}
