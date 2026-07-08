import { DateTime } from 'luxon'
import type { CreateCajaMovimientoDTO, IArqueo, ICajaSaldo, IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type CajaMovimiento from '#models/caja_movimiento'
import Factura from '#models/factura'
import CajaRepository from '#modules/caja/repositories/caja_repository'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'
import { validarMontoCobro } from '#shared/factura_cobro_util'
import { serializeCajaMovimientos } from '#shared/caja_movimiento_serializer'

export default class CajaService {
  private repository = new CajaRepository()
  private facturaRepository = new FacturaRepository()

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

    const result = await this.repository.listMovimientos(caja.id, params)
    const data = await serializeCajaMovimientos(result.data)

    return {
      data,
      meta: result.meta,
    }
  }

  async createMovimiento(data: CreateCajaMovimientoDTO, user: User): Promise<CajaMovimiento> {
    const caja = data.cajaId
      ? await this.repository.findById(data.cajaId)
      : await this.repository.getOrCreateDefault()

    if (!caja) {
      throw new Error('CAJA_NO_ENCONTRADA')
    }

    if (data.facturaId && data.tipo === 'ingreso') {
      const factura = await Factura.query()
        .where('id', data.facturaId)
        .whereNull('deleted_at')
        .first()

      if (!factura) {
        throw new Error('FACTURA_NO_ENCONTRADA')
      }

      if (factura.estado !== 'emitida') {
        throw new Error('FACTURA_NO_EMITIDA')
      }

      const totalCobrado = await this.facturaRepository.sumCobradoByFacturaId(factura.id)
      validarMontoCobro(Number(factura.total), totalCobrado, data.monto)
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
      facturaId: data.facturaId ?? null,
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
    const movimientosSerializados = await serializeCajaMovimientos(movimientos)

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
      movimientos: movimientosSerializados,
    }
  }
}
