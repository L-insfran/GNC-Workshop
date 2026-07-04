import vine from '@vinejs/vine'

export const createVehiculoValidator = vine.compile(
  vine.object({
    clienteId: vine.string().uuid(),
    patente: vine.string().minLength(5).maxLength(10),
    marcaId: vine.string().uuid(),
    modeloId: vine.string().uuid(),
    anio: vine.number().min(1900).max(2100),
    color: vine.string().maxLength(50).optional(),
    tipoCombustible: vine.enum(['nafta', 'diesel', 'gnc', 'dual']),
    numeroMotor: vine.string().maxLength(50).optional(),
    numeroChasis: vine.string().maxLength(50).optional(),
    kilometraje: vine.number().min(0).optional(),
  })
)
