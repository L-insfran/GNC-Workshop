import type Turno from '#models/turno'

export function serializeTurno(turno: Turno) {
  const data = turno.serialize() as Record<string, unknown>

  return {
    ...data,
    clienteNombre: turno.cliente?.razonSocial ?? undefined,
    vehiculoPatente: turno.vehiculo?.patente ?? undefined,
    tipoTrabajoId: turno.tipoTrabajoId ?? undefined,
    tipoTrabajoNombre: turno.tipoTrabajo?.nombre ?? undefined,
    ordenTrabajoId: turno.ordenTrabajoId ?? undefined,
    ordenTrabajoNumero: turno.ordenTrabajo?.numero ?? undefined,
  }
}

export function serializeTurnos(turnos: Turno[]) {
  return turnos.map(serializeTurno)
}
