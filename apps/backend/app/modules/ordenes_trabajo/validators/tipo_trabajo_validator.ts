import vine from '@vinejs/vine'

export const createTipoTrabajoValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(2).maxLength(100),
    descripcion: vine.string().trim().maxLength(500).optional(),
    duracionEstimadaHoras: vine.number().min(1).max(168).optional(),
  })
)

export const updateTipoTrabajoValidator = vine.compile(
  vine.object({
    nombre: vine.string().trim().minLength(2).maxLength(100).optional(),
    descripcion: vine.string().trim().maxLength(500).nullable().optional(),
    duracionEstimadaHoras: vine.number().min(1).max(168).nullable().optional(),
    isActive: vine.boolean().optional(),
  })
)
