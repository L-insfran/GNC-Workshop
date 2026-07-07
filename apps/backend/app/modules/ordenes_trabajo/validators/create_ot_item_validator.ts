import vine from '@vinejs/vine'

export const createOtItemValidator = vine.compile(
  vine.object({
    tipo: vine.enum(['servicio', 'repuesto', 'material']),
    productoId: vine.string().uuid().optional(),
    descripcion: vine.string().trim().minLength(1).maxLength(255),
    cantidad: vine.number().min(0.01),
    precioUnitario: vine.number().min(0),
    esEstimado: vine.boolean().optional(),
  })
)
