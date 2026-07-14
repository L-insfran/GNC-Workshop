export interface IDashboardKpi {
  ordenesActivas: number
  ordenesHoy: number
  clientesActivos: number
  vencimientosProximos: number
  stockBajo: number
  otEsperaRepuesto: number
  facturacionMes: number
  produccionMes: number
}

export type AlertaOperativaTipo = 'stock_bajo' | 'ot_espera_repuesto'

export interface IAlertaOperativa {
  id: string
  tipo: AlertaOperativaTipo
  titulo: string
  descripcion: string
  entidadId: string
  nivel: 'info' | 'warning' | 'danger'
  stockActual?: number
  stockMinimo?: number
  unidadMedida?: string
  ordenNumero?: string
  clienteNombre?: string
  vehiculoPatente?: string
}

export interface IVencimientoAlerta {
  id: string
  tipo: 'oblea' | 'ph'
  entidadTipo: 'equipo' | 'cilindro'
  entidadId: string
  descripcion: string
  vehiculoPatente: string
  clienteNombre: string
  clienteId: string
  equipoGncId: string
  fechaVencimiento: string
  diasRestantes: number
  nivel: 'info' | 'warning' | 'danger'
}

export interface IVencimientoPendienteNotificar extends IVencimientoAlerta {
  canalSugerido: 'email' | 'whatsapp'
  motivo: string
}

export interface IProduccionDiaria {
  fecha: string
  ordenesCompletadas: number
  ordenesIngresadas: number
}
