import vine from '@vinejs/vine'

export const createVehiculoMarcaValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(2).maxLength(100),
  })
)

export const updateVehiculoMarcaValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(2).maxLength(100),
  })
)
