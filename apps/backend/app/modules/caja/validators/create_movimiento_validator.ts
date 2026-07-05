import vine from '@vinejs/vine'

export const createMovimientoValidator = vine.compile(
  vine.object({
    cajaId: vine.string().uuid().optional(),
    tipo: vine.enum(['ingreso', 'egreso']),
    monto: vine.number().min(0.01),
    concepto: vine.string().trim().minLength(2).maxLength(255),
  })
)
