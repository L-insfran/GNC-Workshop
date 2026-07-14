import type OtEstadoHistorial from '#models/ot_estado_historial'

export function serializeOtEstadoHistorial(item: OtEstadoHistorial) {
  return {
    id: item.id,
    ordenTrabajoId: item.ordenTrabajoId,
    estadoAnterior: item.estadoAnterior ?? undefined,
    estadoNuevo: item.estadoNuevo,
    userId: item.userId ?? undefined,
    userNombre: item.user?.fullName ?? item.user?.email ?? undefined,
    observacion: item.observacion ?? undefined,
    createdAt: item.createdAt.toISO()!,
  }
}

export function serializeOtEstadosHistorial(items: OtEstadoHistorial[]) {
  return items.map(serializeOtEstadoHistorial)
}
