import { DateTime } from 'luxon'
import type { CreateClienteDTO, IClienteFichaOperativa } from '@gnc/shared-types'
import type User from '#models/user'
import type Cliente from '#models/cliente'
import Vehiculo from '#models/vehiculo'
import EquipoGnc from '#models/equipo_gnc'
import OrdenTrabajo from '#models/orden_trabajo'
import Turno from '#models/turno'
import Factura from '#models/factura'
import { BaseService } from '#shared/base_service'
import { sumSenasByOrdenTrabajoIds } from '#shared/ot_sena_util'
import { calcularEstadoCobro, calcularSaldoPendiente } from '#shared/factura_cobro_util'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'
import ClienteRepository from '#modules/clientes/repositories/cliente_repository'

export default class ClienteService extends BaseService<Cliente> {
  protected entityType = 'cliente'
  protected repository = new ClienteRepository()
  private facturaRepository = new FacturaRepository()

  async getFichaOperativa(clienteId: string): Promise<IClienteFichaOperativa | null> {
    const cliente = await this.repository.findById(clienteId)
    if (!cliente) return null

    const hoy = DateTime.now().startOf('day')

    const vehiculos = await Vehiculo.query()
      .where('cliente_id', clienteId)
      .whereNull('deleted_at')
      .preload('marca')
      .preload('modelo')
      .orderBy('created_at', 'desc')

    const vehiculoIds = vehiculos.map((v) => v.id)
    const equipos =
      vehiculoIds.length > 0
        ? await EquipoGnc.query()
            .whereIn('vehiculo_id', vehiculoIds)
            .whereNull('deleted_at')
            .preload('cilindros', (q) => q.whereNull('deleted_at'))
        : []

    const equiposPorVehiculo = new Map<string, typeof equipos>()
    for (const equipo of equipos) {
      const lista = equiposPorVehiculo.get(equipo.vehiculoId) ?? []
      lista.push(equipo)
      equiposPorVehiculo.set(equipo.vehiculoId, lista)
    }

    const ordenes = await OrdenTrabajo.query()
      .where('cliente_id', clienteId)
      .whereNull('deleted_at')
      .preload('tipoTrabajo')
      .preload('vehiculo')
      .orderBy('fecha_ingreso', 'desc')
      .limit(15)

    const senasPorOt = await sumSenasByOrdenTrabajoIds(ordenes.map((o) => o.id))

    const turnos = await Turno.query()
      .where('cliente_id', clienteId)
      .whereNull('deleted_at')
      .whereIn('estado', ['pendiente', 'confirmado'])
      .where('fecha_hora', '>=', DateTime.now().toSQL()!)
      .preload('vehiculo')
      .preload('tipoTrabajo')
      .preload('ordenTrabajo')
      .orderBy('fecha_hora', 'asc')
      .limit(10)

    const facturas = await Factura.query()
      .where('cliente_id', clienteId)
      .whereNull('deleted_at')
      .orderBy('fecha_emision', 'desc')
      .limit(10)

    const facturasRecientes = await Promise.all(
      facturas.map(async (factura) => {
        const totalCobrado =
          factura.estado === 'emitida'
            ? await this.facturaRepository.sumCobradoByFacturaId(factura.id)
            : 0
        const total = Number(factura.total)

        return {
          id: factura.id,
          numero: factura.numero,
          estado: factura.estado,
          estadoCobro:
            factura.estado === 'emitida'
              ? calcularEstadoCobro(total, totalCobrado)
              : undefined,
          total,
          saldoPendiente:
            factura.estado === 'emitida' ? calcularSaldoPendiente(total, totalCobrado) : undefined,
          fechaEmision: factura.fechaEmision.toISO()!,
          ordenTrabajoId: factura.ordenTrabajoId ?? undefined,
        }
      })
    )

    return {
      vehiculos: vehiculos.map((vehiculo) => ({
        id: vehiculo.id,
        patente: vehiculo.patente,
        marcaNombre: vehiculo.marca?.nombre,
        modeloNombre: vehiculo.modelo?.nombre,
        anio: vehiculo.anio,
        equipos: (equiposPorVehiculo.get(vehiculo.id) ?? []).map((equipo) => {
          const obleaVencida = equipo.fechaVencimientoOblea.startOf('day') < hoy
          const cilindrosActivos = (equipo.cilindros ?? []).filter((c) => c.estado !== 'retirado')
          const phVencida = cilindrosActivos.some(
            (c) => c.fechaVencimientoPh.startOf('day') < hoy
          )

          return {
            id: equipo.id,
            numeroSerieEquipo: equipo.numeroSerieEquipo,
            estado: equipo.estado,
            fechaVencimientoOblea: equipo.fechaVencimientoOblea.toISODate()!,
            obleaVencida,
            phVencida,
          }
        }),
      })),
      ordenesRecientes: ordenes.map((orden) => ({
        id: orden.id,
        numero: orden.numero,
        estado: orden.estado,
        tipoTrabajoNombre: orden.tipoTrabajo?.nombre,
        vehiculoPatente: orden.vehiculo?.patente,
        fechaIngreso: orden.fechaIngreso.toISO()!,
        totalEstimado: orden.totalEstimado ? Number(orden.totalEstimado) : undefined,
        totalSena: senasPorOt.get(orden.id) ?? undefined,
      })),
      turnosProximos: turnos.map((turno) => ({
        id: turno.id,
        fechaHora: turno.fechaHora.toISO()!,
        estado: turno.estado,
        vehiculoPatente: turno.vehiculo?.patente,
        tipoTrabajoNombre: turno.tipoTrabajo?.nombre,
        ordenTrabajoId: turno.ordenTrabajoId ?? undefined,
        ordenTrabajoNumero: turno.ordenTrabajo?.numero,
      })),
      facturasRecientes,
    }
  }

  async create(data: CreateClienteDTO, user: User): Promise<Cliente> {
    const existing = await this.repository.findByDocumento(data.documentoNumero)
    if (existing) {
      throw new Error('DOCUMENTO_DUPLICADO')
    }

    return super.create(
      {
        ...data,
        isActive: true,
        createdBy: user.id,
      },
      user
    )
  }
}
