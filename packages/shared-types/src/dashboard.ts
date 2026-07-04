export interface IDashboardKpi {
  ordenesActivas: number
  ordenesHoy: number
  clientesActivos: number
  vencimientosProximos: number
  facturacionMes: number
  produccionMes: number
}

export interface IVencimientoAlerta {
  id: string
  tipo: 'oblea' | 'ph'
  entidadTipo: 'equipo' | 'cilindro'
  entidadId: string
  descripcion: string
  vehiculoPatente: string
  clienteNombre: string
  fechaVencimiento: string
  diasRestantes: number
  nivel: 'info' | 'warning' | 'danger'
}

export interface IProduccionDiaria {
  fecha: string
  ordenesCompletadas: number
  ordenesIngresadas: number
}
