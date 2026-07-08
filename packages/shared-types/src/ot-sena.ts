import type { ICajaMovimientoResumen } from './facturacion'

export interface IOtSenaResumen {
  totalSena: number
  movimientos: ICajaMovimientoResumen[]
}
