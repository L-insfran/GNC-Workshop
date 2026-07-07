import vine from '@vinejs/vine'

export const createProductoValidator = vine.compile(
  vine.object({
    codigo: vine.string().trim().minLength(1).maxLength(50),
    nombre: vine.string().trim().minLength(2).maxLength(255),
    categoriaId: vine.string().uuid().optional(),
    precioCompra: vine.number().min(0),
    precioVenta: vine.number().min(0),
    stockMinimo: vine.number().min(0).optional(),
    stockInicial: vine.number().min(0).optional(),
    unidadMedida: vine.string().trim().maxLength(20).optional(),
    isActive: vine.boolean().optional(),
  })
)
