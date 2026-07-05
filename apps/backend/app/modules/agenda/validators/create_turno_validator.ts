import vine from '@vinejs/vine'

export const createTurnoValidator = vine.compile(
  vine.object({
    clienteId: vine.string().uuid(),
    vehiculoId: vine.string().uuid().optional(),
    fechaHora: vine.string(),
    estado: vine.enum(['pendiente', 'confirmado', 'cancelado', 'completado']).optional(),
    notas: vine.string().trim().optional(),
  })
)
