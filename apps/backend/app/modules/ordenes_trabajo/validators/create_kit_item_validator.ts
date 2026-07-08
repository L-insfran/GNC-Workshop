import vine from '@vinejs/vine'

export const createKitItemValidator = vine.compile(
  vine.object({
    tipo: vine.enum(['servicio', 'repuesto', 'material']),
    productoId: vine.string().uuid().optional(),
    descripcion: vine.string().trim().minLength(1).maxLength(255),
    cantidad: vine.number().min(0.01),
    precioUnitario: vine.number().min(0).nullable().optional(),
    esEstimado: vine.boolean().optional(),
    orden: vine.number().min(0).optional(),
  })
)
