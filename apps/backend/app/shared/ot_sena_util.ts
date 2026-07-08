import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import CajaMovimiento from '#models/caja_movimiento'
import Factura from '#models/factura'
import type { IOtSenaResumen } from '@gnc/shared-types'

export async function sumSenaByOrdenTrabajoId(ordenTrabajoId: string): Promise<number> {
  const movimientos = await findSenasByOrdenTrabajoId(ordenTrabajoId)
  return movimientos.reduce((acc, m) => acc + Number(m.monto), 0)
}

export async function findSenasByOrdenTrabajoId(ordenTrabajoId: string): Promise<CajaMovimiento[]> {
  return CajaMovimiento.query()
    .where('orden_trabajo_id', ordenTrabajoId)
    .where('tipo', 'ingreso')
    .whereNull('factura_id')
    .orderBy('created_at', 'asc')
}

export async function sumSenasByOrdenTrabajoIds(
  ordenIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (ordenIds.length === 0) return map

  const movimientos = await CajaMovimiento.query()
    .whereIn('orden_trabajo_id', ordenIds)
    .where('tipo', 'ingreso')
    .whereNull('factura_id')

  for (const mov of movimientos) {
    if (!mov.ordenTrabajoId) continue
    const actual = map.get(mov.ordenTrabajoId) ?? 0
    map.set(mov.ordenTrabajoId, actual + Number(mov.monto))
  }

  return map
}

export async function aplicarSenasAFactura(
  ordenTrabajoId: string,
  facturaId: string,
  trx?: TransactionClientContract
): Promise<number> {
  const movimientos = await CajaMovimiento.query({ client: trx })
    .where('orden_trabajo_id', ordenTrabajoId)
    .where('tipo', 'ingreso')
    .whereNull('factura_id')

  let total = 0
  for (const mov of movimientos) {
    mov.facturaId = facturaId
    await mov.useTransaction(trx!).save()
    total += Number(mov.monto)
  }

  return Number(total.toFixed(2))
}

export async function sumAllSenasByOrdenTrabajoId(ordenTrabajoId: string): Promise<number> {
  const movimientos = await CajaMovimiento.query()
    .where('orden_trabajo_id', ordenTrabajoId)
    .where('tipo', 'ingreso')

  return Number(
    movimientos.reduce((acc, m) => acc + Number(m.monto), 0).toFixed(2)
  )
}

export async function buildOtSenaResumen(ordenTrabajoId: string): Promise<IOtSenaResumen | null> {
  const movimientos = await CajaMovimiento.query()
    .where('orden_trabajo_id', ordenTrabajoId)
    .where('tipo', 'ingreso')
    .orderBy('created_at', 'asc')

  if (movimientos.length === 0) return null

  const totalSena = movimientos.reduce((acc, m) => acc + Number(m.monto), 0)

  const facturaIds = [
    ...new Set(movimientos.map((m) => m.facturaId).filter((id): id is string => Boolean(id))),
  ]
  const facturas =
    facturaIds.length > 0 ? await Factura.query().whereIn('id', facturaIds) : []
  const facturasMap = new Map(facturas.map((f) => [f.id, f]))

  return {
    totalSena: Number(totalSena.toFixed(2)),
    movimientos: movimientos.map((m) => ({
      id: m.id,
      monto: Number(m.monto),
      concepto: m.concepto,
      createdAt: m.createdAt.toISO()!,
      facturaId: m.facturaId ?? undefined,
      facturaNumero: m.facturaId ? facturasMap.get(m.facturaId)?.numero : undefined,
      ordenTrabajoId: m.ordenTrabajoId ?? undefined,
    })),
  }
}
