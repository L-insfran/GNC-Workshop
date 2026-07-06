import vine from '@vinejs/vine'

export const updateEstadoValidator = vine.compile(
  vine.object({
    estado: vine.enum([
      'borrador',
      'recepcion',
      'en_taller',
      'en_espera_repuesto',
      'control_calidad',
      'finalizada',
      'entregada',
      'cancelada',
    ]),
    observacion: vine.string().optional(),
    mecanicoAsignadoId: vine.string().uuid().optional(),
  })
)
