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

export type NotificacionCanal = 'email' | 'whatsapp'
export type NotificacionDriver = 'manual' | 'whatsapp_cloud'

/** Contrato listo para cablear WhatsApp Cloud / otros proveedores */
export interface INotificacionDriverInfo {
  driver: NotificacionDriver
  envioAutomaticoDisponible: boolean
  tallerNombre: string
}

export interface IVencimientoPendienteNotificar extends IVencimientoAlerta {
  canalSugerido: NotificacionCanal
  motivo: string
  clienteEmail: string | null
  clienteTelefono: string | null
  asuntoEmail: string
  mensaje: string
  whatsappUrl: string | null
  mailtoUrl: string | null
  puedeWhatsapp: boolean
  puedeEmail: boolean
  modoDriver: NotificacionDriver
  envioAutomaticoDisponible: boolean
  /** True si ya hay registro `enviado` para esta alerta + fecha */
  yaNotificado: boolean
}

export interface IListPendientesNotificarParams {
  equipoGncId?: string
  /** En ficha de equipo: incluir críticos aunque ya estén marcados como notificados */
  incluirYaNotificados?: boolean
}

export interface IRegistrarVencimientoNotificacionDTO {
  canal: NotificacionCanal
  modo?: 'asistido' | 'automatico'
  estado?: 'enviado' | 'omitido'
}

export interface IProduccionDiaria {
  fecha: string
  ordenesCompletadas: number
  ordenesIngresadas: number
}
