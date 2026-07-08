import { DateTime } from 'luxon'
import type {
  IAlertaOperativa,
  IDashboardKpi,
  IProduccionDiaria,
  IVencimientoAlerta,
} from '@gnc/shared-types'
import Cliente from '#models/cliente'
import Cilindro from '#models/cilindro'
import EquipoGnc from '#models/equipo_gnc'
import Factura from '#models/factura'
import OrdenTrabajo from '#models/orden_trabajo'
import Producto from '#models/producto'

const OBLEA_ALERTA_DIAS = 30
const PH_ALERTA_DIAS = 60

export default class DashboardService {
  async getKpis(): Promise<IDashboardKpi> {
    const hoy = DateTime.now().startOf('day')
    const finHoy = hoy.endOf('day')
    const inicioMes = DateTime.now().startOf('month')

    const ordenesActivas = await OrdenTrabajo.query()
      .whereNull('deleted_at')
      .whereNotIn('estado', ['entregada', 'cancelada'])
      .count('* as total')

    const ordenesHoy = await OrdenTrabajo.query()
      .whereNull('deleted_at')
      .where('fecha_ingreso', '>=', hoy.toSQL()!)
      .where('fecha_ingreso', '<=', finHoy.toSQL()!)
      .count('* as total')

    const clientesActivos = await Cliente.query()
      .whereNull('deleted_at')
      .where('is_active', true)
      .count('* as total')

    const vencimientos = await this.getVencimientos()
    const alertasOperativas = await this.getAlertasOperativas()

    const produccionMes = await OrdenTrabajo.query()
      .whereNull('deleted_at')
      .where('estado', 'entregada')
      .where('fecha_entrega_real', '>=', inicioMes.toSQL()!)
      .count('* as total')

    const facturacionMesResult = await Factura.query()
      .where('estado', 'emitida')
      .where('fecha_emision', '>=', inicioMes.toSQL()!)
      .sum('total as total')

    return {
      ordenesActivas: Number(ordenesActivas[0].$extras.total),
      ordenesHoy: Number(ordenesHoy[0].$extras.total),
      clientesActivos: Number(clientesActivos[0].$extras.total),
      vencimientosProximos: vencimientos.length,
      stockBajo: alertasOperativas.filter((a) => a.tipo === 'stock_bajo').length,
      otEsperaRepuesto: alertasOperativas.filter((a) => a.tipo === 'ot_espera_repuesto').length,
      facturacionMes: Number(facturacionMesResult[0].$extras.total ?? 0),
      produccionMes: Number(produccionMes[0].$extras.total),
    }
  }

  async getVencimientos(): Promise<IVencimientoAlerta[]> {
    const alertas: IVencimientoAlerta[] = []
    const hoy = DateTime.now().startOf('day')

    const equipos = await EquipoGnc.query()
      .whereNull('deleted_at')
      .where('estado', 'activo')
      .where('fecha_vencimiento_oblea', '<=', hoy.plus({ days: OBLEA_ALERTA_DIAS }).toISODate()!)
      .preload('vehiculo', (query) => query.preload('cliente'))

    for (const equipo of equipos) {
      const fechaVenc = equipo.fechaVencimientoOblea.startOf('day')
      const diasRestantes = Math.floor(fechaVenc.diff(hoy, 'days').days)

      alertas.push({
        id: `oblea-${equipo.id}`,
        tipo: 'oblea',
        entidadTipo: 'equipo',
        entidadId: equipo.id,
        descripcion: `Oblea GNC equipo ${equipo.numeroSerieEquipo}`,
        vehiculoPatente: equipo.vehiculo.patente,
        clienteNombre: equipo.vehiculo.cliente.razonSocial,
        clienteId: equipo.vehiculo.clienteId,
        equipoGncId: equipo.id,
        fechaVencimiento: fechaVenc.toISODate()!,
        diasRestantes,
        nivel: diasRestantes <= 0 ? 'danger' : diasRestantes <= 15 ? 'warning' : 'info',
      })
    }

    const cilindros = await Cilindro.query()
      .whereNull('deleted_at')
      .where('estado', 'activo')
      .where('fecha_vencimiento_ph', '<=', hoy.plus({ days: PH_ALERTA_DIAS }).toISODate()!)
      .preload('equipoGnc', (query) =>
        query.preload('vehiculo', (vehiculoQuery) => vehiculoQuery.preload('cliente'))
      )

    for (const cilindro of cilindros) {
      const fechaVenc = cilindro.fechaVencimientoPh.startOf('day')
      const diasRestantes = Math.floor(fechaVenc.diff(hoy, 'days').days)

      alertas.push({
        id: `ph-${cilindro.id}`,
        tipo: 'ph',
        entidadTipo: 'cilindro',
        entidadId: cilindro.id,
        descripcion: `PH cilindro ${cilindro.numeroSerie}`,
        vehiculoPatente: cilindro.equipoGnc.vehiculo.patente,
        clienteNombre: cilindro.equipoGnc.vehiculo.cliente.razonSocial,
        clienteId: cilindro.equipoGnc.vehiculo.clienteId,
        equipoGncId: cilindro.equipoGncId,
        fechaVencimiento: fechaVenc.toISODate()!,
        diasRestantes,
        nivel: diasRestantes <= 0 ? 'danger' : diasRestantes <= 30 ? 'warning' : 'info',
      })
    }

    return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes)
  }

  async getAlertasOperativas(): Promise<IAlertaOperativa[]> {
    const alertas: IAlertaOperativa[] = []

    const productosStockBajo = await Producto.query()
      .whereNull('deleted_at')
      .where('is_active', true)
      .whereRaw('stock_actual <= stock_minimo')
      .orderBy('stock_actual', 'asc')
      .limit(20)

    for (const producto of productosStockBajo) {
      const stockActual = Number(producto.stockActual)
      const stockMinimo = Number(producto.stockMinimo)

      alertas.push({
        id: `stock-${producto.id}`,
        tipo: 'stock_bajo',
        titulo: `${producto.codigo} — ${producto.nombre}`,
        descripcion:
          stockActual === 0
            ? 'Sin stock en depósito'
            : `Stock en mínimo (${stockActual} ${producto.unidadMedida})`,
        entidadId: producto.id,
        nivel: stockActual === 0 ? 'danger' : 'warning',
        stockActual,
        stockMinimo,
        unidadMedida: producto.unidadMedida,
      })
    }

    const ordenesEspera = await OrdenTrabajo.query()
      .whereNull('deleted_at')
      .where('estado', 'en_espera_repuesto')
      .preload('cliente')
      .preload('vehiculo')
      .orderBy('fecha_ingreso', 'asc')
      .limit(20)

    for (const orden of ordenesEspera) {
      alertas.push({
        id: `ot-espera-${orden.id}`,
        tipo: 'ot_espera_repuesto',
        titulo: `OT ${orden.numero} esperando repuesto`,
        descripcion: `${orden.cliente.razonSocial} · ${orden.vehiculo.patente}`,
        entidadId: orden.id,
        nivel: orden.prioridad === 'urgente' || orden.prioridad === 'alta' ? 'danger' : 'warning',
        ordenNumero: orden.numero,
        clienteNombre: orden.cliente.razonSocial,
        vehiculoPatente: orden.vehiculo.patente,
      })
    }

    return alertas.sort((a, b) => {
      const nivelOrden = { danger: 0, warning: 1, info: 2 }
      const diff = nivelOrden[a.nivel] - nivelOrden[b.nivel]
      if (diff !== 0) return diff
      return a.titulo.localeCompare(b.titulo, 'es')
    })
  }

  async getProduccion(dias = 30): Promise<IProduccionDiaria[]> {
    const resultado: IProduccionDiaria[] = []
    const hoy = DateTime.now().startOf('day')

    for (let i = dias - 1; i >= 0; i--) {
      const fecha = hoy.minus({ days: i })
      const finDia = fecha.endOf('day')

      const ingresadas = await OrdenTrabajo.query()
        .whereNull('deleted_at')
        .where('fecha_ingreso', '>=', fecha.toSQL()!)
        .where('fecha_ingreso', '<=', finDia.toSQL()!)
        .count('* as total')

      const completadas = await OrdenTrabajo.query()
        .whereNull('deleted_at')
        .where('estado', 'entregada')
        .where('fecha_entrega_real', '>=', fecha.toSQL()!)
        .where('fecha_entrega_real', '<=', finDia.toSQL()!)
        .count('* as total')

      resultado.push({
        fecha: fecha.toISODate()!,
        ordenesIngresadas: Number(ingresadas[0].$extras.total),
        ordenesCompletadas: Number(completadas[0].$extras.total),
      })
    }

    return resultado
  }
}
