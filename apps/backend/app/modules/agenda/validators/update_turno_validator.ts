import vine from '@vinejs/vine'

export const updateTurnoValidator = vine.compile(
  vine.object({
    clienteId: vine.string().uuid().optional(),
    vehiculoId: vine.string().uuid().nullable().optional(),
    tipoTrabajoId: vine.string().uuid().nullable().optional(),
    fechaHora: vine.string().optional(),
    estado: vine.enum(['pendiente', 'confirmado', 'cancelado', 'completado']).optional(),
    notas: vine.string().trim().optional(),
  })
)
