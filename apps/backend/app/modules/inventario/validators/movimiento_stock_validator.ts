import vine from '@vinejs/vine'

export const movimientoStockValidator = vine.compile(
  vine.object({
    productoId: vine.string().uuid(),
    tipo: vine.enum(['ingreso', 'egreso', 'ajuste']),
    cantidad: vine.number().min(1),
    motivo: vine.string().trim().maxLength(500).optional(),
  })
)
