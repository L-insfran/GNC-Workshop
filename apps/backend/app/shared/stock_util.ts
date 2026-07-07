import db from '@adonisjs/lucid/services/db'

export interface IStockDisponibilidadOptions {
  excludeOtItemId?: string
}

export interface IStockDisponibilidad {
  stockActual: number
  stockReservado: number
  /** @deprecated Usar stockReservado */
  stockComprometido: number
  stockDisponible: number
}

export async function calcularStockReservado(
  productoId: string,
  options: IStockDisponibilidadOptions = {}
): Promise<number> {
  let query = db
    .from('stock_reservas')
    .where('producto_id', productoId)
    .whereNull('released_at')

  if (options.excludeOtItemId) {
    query = query.whereNot('ot_item_id', options.excludeOtItemId)
  }

  const result = await query.sum('cantidad as total').first()
  return Math.ceil(Number(result?.total ?? 0))
}

/** @deprecated Usar calcularStockReservado */
export async function calcularStockComprometido(
  productoId: string,
  options: IStockDisponibilidadOptions = {}
): Promise<number> {
  return calcularStockReservado(productoId, options)
}

export async function getStockDisponibilidad(
  stockActual: number,
  productoId: string,
  options: IStockDisponibilidadOptions = {}
): Promise<IStockDisponibilidad> {
  const reservado = await calcularStockReservado(productoId, options)
  const disponible = Math.max(0, stockActual - reservado)

  return {
    stockActual,
    stockReservado: reservado,
    stockComprometido: reservado,
    stockDisponible: disponible,
  }
}

export async function validarStockParaOtItem(
  productoId: string,
  stockActual: number,
  cantidad: number,
  options: IStockDisponibilidadOptions = {}
): Promise<void> {
  const { stockDisponible } = await getStockDisponibilidad(stockActual, productoId, options)
  const cantidadRequerida = Math.ceil(Number(cantidad))

  if (stockDisponible < cantidadRequerida) {
    throw new Error('STOCK_INSUFICIENTE_OT_ITEM')
  }
}
