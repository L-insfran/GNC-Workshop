import vine from '@vinejs/vine'

export const registrarNotificacionValidator = vine.compile(
  vine.object({
    canal: vine.enum(['whatsapp', 'email'] as const),
    modo: vine.enum(['asistido', 'automatico'] as const).optional(),
    estado: vine.enum(['enviado', 'omitido'] as const).optional(),
  })
)
