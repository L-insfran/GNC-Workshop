export interface ICategoriaProducto {
  id: string
  nombre: string
  descripcion?: string
  createdAt: string
}

export interface IProducto {
  id: string
  codigo: string
  nombre: string
  categoriaId?: string
  categoriaNombre?: string
  precioCompra: number
  precioVenta: number
  stockMinimo: number
  stockActual: number
  unidadMedida: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductoDTO {
  codigo: string
  nombre: string
  categoriaId?: string
  precioCompra: number
  precioVenta: number
  stockMinimo?: number
  unidadMedida?: string
  isActive?: boolean
}

export type UpdateProductoDTO = Partial<CreateProductoDTO>

export type StockMovimientoTipo = 'ingreso' | 'egreso' | 'ajuste'

export interface IStockMovimiento {
  id: string
  productoId: string
  productoNombre?: string
  tipo: StockMovimientoTipo
  cantidad: number
  motivo?: string
  userId?: string
  userNombre?: string
  createdAt: string
}

export interface MovimientoStockDTO {
  productoId: string
  tipo: StockMovimientoTipo
  cantidad: number
  motivo?: string
}

export interface CreateCategoriaProductoDTO {
  nombre: string
  descripcion?: string
}
