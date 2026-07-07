import { DateTime } from 'luxon'
import Caja from '#models/caja'
import CajaMovimiento from '#models/caja_movimiento'
import type { IPaginationParams } from '@gnc/shared-types'

export default class CajaRepository {
  async getOrCreateDefault(): Promise<Caja> {
    return Caja.updateOrCreate(
      { nombre: 'Caja Principal' },
      { nombre: 'Caja Principal', isActive: true }
    )
  }

  async findById(id: string): Promise<Caja | null> {
    return Caja.query().where('id', id).where('is_active', true).first()
  }

  async listMovimientos(cajaId: string, params: IPaginationParams = {}) {
    const page = params.page ?? 1
    const perPage = Math.min(params.perPage ?? 20, 100)

    let query = CajaMovimiento.query()
      .where('caja_id', cajaId)
      .preload('user')
      .orderBy('created_at', 'desc')

    if (params.search) {
      query = query.whereILike('concepto', `%${params.search}%`)
    }

    const result = await query.paginate(page, perPage)

    return {
      data: result.all(),
      meta: {
        page: result.currentPage,
        perPage: result.perPage,
        total: result.total,
        lastPage: result.lastPage,
      },
    }
  }

  async calcularSaldo(cajaId: string) {
    const ingresos = await CajaMovimiento.query()
      .where('caja_id', cajaId)
      .where('tipo', 'ingreso')
      .sum('monto as total')

    const egresos = await CajaMovimiento.query()
      .where('caja_id', cajaId)
      .where('tipo', 'egreso')
      .sum('monto as total')

    const totalIngresos = Number(ingresos[0]?.$extras.total ?? 0)
    const totalEgresos = Number(egresos[0]?.$extras.total ?? 0)

    return {
      ingresos: totalIngresos,
      egresos: totalEgresos,
      saldo: totalIngresos - totalEgresos,
    }
  }

  async movimientosDelDia(cajaId: string, fecha: DateTime) {
    const inicio = fecha.startOf('day').toSQL()
    const fin = fecha.endOf('day').toSQL()

    return CajaMovimiento.query()
      .where('caja_id', cajaId)
      .whereBetween('created_at', [inicio!, fin!])
      .preload('user')
      .orderBy('created_at', 'asc')
  }

  async createMovimiento(data: {
    cajaId: string
    tipo: 'ingreso' | 'egreso'
    monto: number
    concepto: string
    facturaId?: string | null
    userId: string
  }) {
    return CajaMovimiento.create(data)
  }
}
