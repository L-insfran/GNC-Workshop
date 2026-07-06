import type Vehiculo from '#models/vehiculo'

export function serializeVehiculo(vehiculo: Vehiculo) {
  const data = vehiculo.serialize() as Record<string, unknown>

  return {
    ...data,
    marcaNombre: vehiculo.marca?.nombre ?? null,
    modeloNombre: vehiculo.modelo?.nombre ?? null,
  }
}

export function serializeVehiculos(vehiculos: Vehiculo[]) {
  return vehiculos.map(serializeVehiculo)
}
