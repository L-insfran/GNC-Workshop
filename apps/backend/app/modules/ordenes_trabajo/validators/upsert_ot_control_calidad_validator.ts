import vine from '@vinejs/vine'

export const upsertOtControlCalidadValidator = vine.compile(
  vine.object({
    sinFugas: vine.boolean(),
    presionReguladorOk: vine.boolean(),
    valvulasSeguridadOk: vine.boolean(),
    estanqueidadOk: vine.boolean(),
    documentacionCompleta: vine.boolean(),
    observaciones: vine.string().trim().maxLength(1000).optional(),
  })
)
