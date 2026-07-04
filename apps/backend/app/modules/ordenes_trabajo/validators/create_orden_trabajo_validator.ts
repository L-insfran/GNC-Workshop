import vine from '@vinejs/vine'

export const createOrdenTrabajoValidator = vine.compile(
  vine.object({
    clienteId: vine.string().uuid(),
    vehiculoId: vine.string().uuid(),
    equipoGncId: vine.string().uuid().optional(),
    tipoTrabajoId: vine.string().uuid(),
    prioridad: vine.enum(['baja', 'normal', 'alta', 'urgente']).optional(),
    fechaEstimadaEntrega: vine.string().optional(),
    mecanicoAsignadoId: vine.string().uuid().optional(),
    kilometrajeIngreso: vine.number().min(0).optional(),
    descripcionProblema: vine.string().optional(),
    observacionesInternas: vine.string().optional(),
  })
)
