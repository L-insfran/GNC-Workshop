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
  stockInicial?: number
  unidadMedida?: string
  isActive?: boolean
}

export interface IStockDisponibilidad {
  stockActual: number
  stockReservado: number
  /** Alias de stockReservado para compatibilidad */
  stockComprometido: number
  stockDisponible: number
}

export interface IListMovimientosParams {
  page?: number
  perPage?: number
  productoId?: string
  ordenTrabajoId?: string
}

export type UpdateProductoDTO = Partial<CreateProductoDTO>

export type StockMovimientoTipo = 'ingreso' | 'egreso' | 'ajuste'

export interface IStockMovimiento {
  id: string
  productoId: string
  productoNombre?: string
  productoCodigo?: string
  tipo: StockMovimientoTipo
  cantidad: number
  motivo?: string
  ordenTrabajoId?: string
  ordenTrabajoNumero?: string
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

export interface UpdateCategoriaProductoDTO {
  nombre?: string
  descripcion?: string | null
}
