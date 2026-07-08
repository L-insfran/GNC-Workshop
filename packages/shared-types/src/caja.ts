export interface ICaja {
  id: string
  nombre: string
  isActive: boolean
  createdAt: string
}

export type CajaMovimientoTipo = 'ingreso' | 'egreso'

export interface ICajaMovimiento {
  id: string
  cajaId: string
  tipo: CajaMovimientoTipo
  monto: number
  concepto: string
  facturaId?: string
  facturaNumero?: string
  ordenTrabajoId?: string
  ordenTrabajoNumero?: string
  userId?: string
  userNombre?: string
  createdAt: string
}

export interface CreateCajaMovimientoDTO {
  cajaId?: string
  tipo: CajaMovimientoTipo
  monto: number
  concepto: string
  facturaId?: string
  ordenTrabajoId?: string
}

export interface ICajaSaldo {
  cajaId: string
  cajaNombre: string
  saldo: number
  ingresos: number
  egresos: number
}

export interface IArqueo {
  fecha: string
  cajaId: string
  cajaNombre: string
  saldoInicial: number
  ingresos: number
  egresos: number
  saldoFinal: number
  movimientos: ICajaMovimiento[]
}
