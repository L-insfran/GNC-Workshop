import db from '@adonisjs/lucid/services/db'
import type { CreateProductoDTO, MovimientoStockDTO, UpdateProductoDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type Producto from '#models/producto'
import StockMovimiento from '#models/stock_movimiento'
import CategoriaProducto from '#models/categoria_producto'
import { BaseService } from '#shared/base_service'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'
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

  async createCategoria(data: { nombre: string; descripcion?: string }, user: User) {
    const nombre = data.nombre.trim()
    const existing = await CategoriaProducto.query().whereILike('nombre', nombre).first()
    if (existing) {
      throw new Error('NOMBRE_DUPLICADO')
    }

    const categoria = await CategoriaProducto.create({
      nombre,
      descripcion: data.descripcion ?? null,
    })

    await EntityCreated.dispatch({
      userId: user.id,
      entityType: 'categoria_producto',
      entityId: categoria.id,
      newValues: { nombre: categoria.nombre },
    })

    return categoria
  }

  async updateCategoria(
    id: string,
    data: { nombre?: string; descripcion?: string | null },
    user: User
  ) {
    const categoria = await CategoriaProducto.find(id)
    if (!categoria) return null

    const oldValues = { nombre: categoria.nombre, descripcion: categoria.descripcion }

    if (data.nombre) {
      const nombre = data.nombre.trim()
      const existing = await CategoriaProducto.query()
        .whereILike('nombre', nombre)
        .whereNot('id', id)
        .first()
      if (existing) {
        throw new Error('NOMBRE_DUPLICADO')
      }
      categoria.nombre = nombre
    }

    if (data.descripcion !== undefined) {
      categoria.descripcion = data.descripcion
    }

    await categoria.save()

    await EntityUpdated.dispatch({
      userId: user.id,
      entityType: 'categoria_producto',
      entityId: categoria.id,
      oldValues,
      newValues: { nombre: categoria.nombre, descripcion: categoria.descripcion },
    })

    return categoria
  }

  async deleteCategoria(id: string, user: User) {
    const categoria = await CategoriaProducto.find(id)
    if (!categoria) return false

    const oldValues = { nombre: categoria.nombre, descripcion: categoria.descripcion }
    await categoria.delete()

    await EntityDeleted.dispatch({
      userId: user.id,
      entityType: 'categoria_producto',
      entityId: id,
      oldValues,
    })

    return true
  }
}
