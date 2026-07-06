import vine from '@vinejs/vine'

export const createVehiculoModeloValidator = vine.compile(
  vine.object({
    marcaId: vine.string().uuid(),
    nombre: vine.string().trim().minLength(1).maxLength(100),
  })
)

export const updateVehiculoModeloValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(1).maxLength(100),
  })
)
