import vine from '@vinejs/vine'

export const createFacturaValidator = vine.compile(
  vine.object({
    clienteId: vine.string().uuid(),
    ordenTrabajoId: vine.string().uuid().optional(),
    tipo: vine.enum(['factura_a', 'factura_b', 'factura_c', 'nota_credito']),
    emitir: vine.boolean().optional(),
    items: vine
      .array(
        vine.object({
          descripcion: vine.string().trim().minLength(1).maxLength(255),
          cantidad: vine.number().min(0.01),
          precioUnitario: vine.number().min(0),
        })
      )
      .minLength(1),
  })
)
