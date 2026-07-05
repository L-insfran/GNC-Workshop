import vine from '@vinejs/vine'

export const createCategoriaValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(2).maxLength(100),
    descripcion: vine.string().trim().optional(),
  })
)
