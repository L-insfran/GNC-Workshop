import vine from '@vinejs/vine'

export const updateKitItemValidator = vine.compile(
  vine.object({
    tipo: vine.enum(['servicio', 'repuesto', 'material']).optional(),
    productoId: vine.string().uuid().nullable().optional(),
    descripcion: vine.string().trim().minLength(1).maxLength(255).optional(),
    cantidad: vine.number().min(0.01).optional(),
    precioUnitario: vine.number().min(0).nullable().optional(),
    esEstimado: vine.boolean().optional(),
    orden: vine.number().min(0).optional(),
  })
)
