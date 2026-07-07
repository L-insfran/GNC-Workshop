import vine from '@vinejs/vine'

/**
 * Update no exige clienteId (el frontend no lo reenvía al editar).
 */
export const updateVehiculoValidator = vine.compile(
  vine.object({
    patente: vine.string().trim().minLength(5).maxLength(10).optional(),
    marcaId: vine.string().uuid().optional(),
    modeloId: vine.string().uuid().optional(),
    anio: vine.number().min(1900).max(2100).optional(),
    color: vine.string().maxLength(50).optional(),
    tipoCombustible: vine.enum(['nafta', 'diesel', 'gnc', 'dual']).optional(),
    numeroMotor: vine.string().maxLength(50).optional(),
    numeroChasis: vine.string().maxLength(50).optional(),
    kilometraje: vine.number().min(0).optional(),
  })
)
