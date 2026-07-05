import db from '@adonisjs/lucid/services/db'
import type { CreateProductoDTO, MovimientoStockDTO, UpdateProductoDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type Producto from '#models/producto'
import StockMovimiento from '#models/stock_movimiento'
import CategoriaProducto from '#models/categoria_producto'
import { BaseService } from '#shared/base_service'
import ProductoRepository from '#modules/inventario/repositories/producto_repository'

export default class ProductoService extends BaseService<Producto> {
  protected entityType = 'producto'
  protected repository = new ProductoRepository()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithCategoria(params)
  }

  async getById(id: string): Promise<Producto | null> {
    return this.repository.findByIdWithCategoria(id)
  }

  async create(data: CreateProductoDTO, user: User): Promise<Producto> {
    const existing = await this.repository.findByCodigo(data.codigo)
    if (existing) {
      throw new Error('CODIGO_DUPLICADO')
    }

    return super.create(
      {
        codigo: data.codigo.trim().toUpperCase(),
        nombre: data.nombre.trim(),
        categoriaId: data.categoriaId ?? null,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        stockMinimo: data.stockMinimo ?? 0,
        stockActual: 0,
        unidadMedida: data.unidadMedida ?? 'unidad',
        isActive: data.isActive ?? true,
      },
      user
    )
  }

  async update(id: string, data: UpdateProductoDTO, user: User): Promise<Producto | null> {
    if (data.codigo) {
      const existing = await this.repository.findByCodigo(data.codigo)
      if (existing && existing.id !== id) {
        throw new Error('CODIGO_DUPLICADO')
      }
      data.codigo = data.codigo.trim().toUpperCase()
    }

    return super.update(id, data as Partial<Producto>, user)
  }

  async registrarMovimiento(data: MovimientoStockDTO, user: User): Promise<Producto> {
    const producto = await this.repository.findById(data.productoId)
    if (!producto) {
      throw new Error('PRODUCTO_NO_ENCONTRADO')
    }

    const cantidad = Math.abs(Number(data.cantidad))
    let nuevoStock = producto.stockActual

    if (data.tipo === 'ingreso') {
      nuevoStock += cantidad
    } else if (data.tipo === 'egreso') {
      if (producto.stockActual < cantidad) {
        throw new Error('STOCK_INSUFICIENTE')
      }
      nuevoStock -= cantidad
    } else {
      nuevoStock = cantidad
    }

    await db.transaction(async (trx) => {
      await StockMovimiento.create(
        {
          productoId: producto.id,
          tipo: data.tipo,
          cantidad,
          motivo: data.motivo ?? null,
          userId: user.id,
        },
        { client: trx }
      )

      producto.useTransaction(trx)
      producto.stockActual = nuevoStock
      await producto.save()
    })

    return (await this.repository.findByIdWithCategoria(producto.id))!
  }

  async alertasStock(): Promise<Producto[]> {
    return this.repository.findStockBajo()
  }

  async listCategorias() {
    return CategoriaProducto.query().orderBy('nombre', 'asc')
  }

  async createCategoria(data: { nombre: string; descripcion?: string }) {
    return CategoriaProducto.updateOrCreate(
      { nombre: data.nombre.trim() },
      { nombre: data.nombre.trim(), descripcion: data.descripcion ?? null }
    )
  }
}
