import vine from '@vinejs/vine'

export const updateCategoriaValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(2).maxLength(100).optional(),
    descripcion: vine.string().trim().nullable().optional(),
  })
)
