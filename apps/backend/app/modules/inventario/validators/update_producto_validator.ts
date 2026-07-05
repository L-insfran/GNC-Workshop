import vine from '@vinejs/vine'

export const updateProductoValidator = vine.compile(
  vine.object({
    codigo: vine.string().trim().minLength(1).maxLength(50).optional(),
    nombre: vine.string().trim().minLength(2).maxLength(255).optional(),
    categoriaId: vine.string().uuid().optional(),
    precioCompra: vine.number().min(0).optional(),
    precioVenta: vine.number().min(0).optional(),
    stockMinimo: vine.number().min(0).optional(),
    unidadMedida: vine.string().trim().maxLength(20).optional(),
    isActive: vine.boolean().optional(),
  })
)
