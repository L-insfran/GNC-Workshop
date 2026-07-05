import { DateTime } from 'luxon'
import type { CreateCajaMovimientoDTO, IArqueo, ICajaSaldo, IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type CajaMovimiento from '#models/caja_movimiento'
import CajaRepository from '#modules/caja/repositories/caja_repository'

export default class CajaService {
  private repository = new CajaRepository()

  async getSaldo(cajaId?: string): Promise<ICajaSaldo> {
    const caja = cajaId
      ? await this.repository.findById(cajaId)
      : await this.repository.getOrCreateDefault()

    if (!caja) {
      throw new Error('CAJA_NO_ENCONTRADA')
    }

    const totales = await this.repository.calcularSaldo(caja.id)

    return {
      cajaId: caja.id,
      cajaNombre: caja.nombre,
      ...totales,
    }
  }

  async listMovimientos(params?: IPaginationParams & { cajaId?: string }) {
    const caja = params?.cajaId
      ? await this.repository.findById(params.cajaId)
      : await this.repository.getOrCreateDefault()

    if (!caja) {
      throw new Error('CAJA_NO_ENCONTRADA')
    }

    return this.repository.listMovimientos(caja.id, params)
  }

  async createMovimiento(data: CreateCajaMovimientoDTO, user: User): Promise<CajaMovimiento> {
    const caja = data.cajaId
      ? await this.repository.findById(data.cajaId)
      : await this.repository.getOrCreateDefault()

    if (!caja) {
      throw new Error('CAJA_NO_ENCONTRADA')
    }

    if (data.tipo === 'egreso') {
      const { saldo } = await this.repository.calcularSaldo(caja.id)
      if (saldo < data.monto) {
        throw new Error('SALDO_INSUFICIENTE')
      }
    }

    return this.repository.createMovimiento({
      cajaId: caja.id,
      tipo: data.tipo,
      monto: data.monto,
      concepto: data.concepto.trim(),
      userId: user.id,
    })
  }

  async arqueo(fecha?: string, cajaId?: string): Promise<IArqueo> {
    const caja = cajaId
      ? await this.repository.findById(cajaId)
      : await this.repository.getOrCreateDefault()

    if (!caja) {
      throw new Error('CAJA_NO_ENCONTRADA')
    }

    const dia = fecha ? DateTime.fromISO(fecha, { zone: 'utc' }) : DateTime.utc()
    const movimientos = await this.repository.movimientosDelDia(caja.id, dia)

    const ingresos = movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((acc, m) => acc + Number(m.monto), 0)
    const egresos = movimientos
      .filter((m) => m.tipo === 'egreso')
      .reduce((acc, m) => acc + Number(m.monto), 0)

    const saldoTotal = await this.repository.calcularSaldo(caja.id)
    const saldoFinal = saldoTotal.saldo
    const saldoInicial = saldoFinal - ingresos + egresos

    return {
      fecha: dia.toISODate()!,
      cajaId: caja.id,
      cajaNombre: caja.nombre,
      saldoInicial,
      ingresos,
      egresos,
      saldoFinal,
      movimientos: movimientos.map((m) => ({
        id: m.id,
        cajaId: m.cajaId,
        tipo: m.tipo,
        monto: Number(m.monto),
        concepto: m.concepto,
        userId: m.userId ?? undefined,
        userNombre: m.user?.fullName,
        createdAt: m.createdAt.toISO()!,
      })),
    }
  }
}
