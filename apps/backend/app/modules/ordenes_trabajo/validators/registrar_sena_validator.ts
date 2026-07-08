import vine from '@vinejs/vine'

export const registrarSenaValidator = vine.compile(
  vine.object({
    monto: vine.number().min(0.01),
  })
)
