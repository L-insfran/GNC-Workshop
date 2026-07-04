import type { ReactNode } from 'react'

export type {
  IApiResponse,
  IApiError,
  IPaginationMeta,
  IPaginationParams,
  IAuthUser,
  IAuthResponse,
  ILoginDTO,
  ICliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  ClienteTipo,
  DocumentoTipo,
  CondicionIva,
  IVehiculo,
  CreateVehicleDTO,
  UpdateVehicleDTO,
  IVehiculoMarca,
  IVehiculoModelo,
  TipoCombustible,
  IEquipoGnc,
  ICilindro,
  CreateEquipoGncDTO,
  CreateCilindroDTO,
  EquipoEstado,
  CilindroEstado,
  IOrdenTrabajo,
  CreateOrdenTrabajoDTO,
  UpdateOrdenEstadoDTO,
  ITipoTrabajo,
  OrdenEstado,
  OrdenPrioridad,
  IDashboardKpi,
  IVencimientoAlerta,
  IProduccionDiaria,
  RoleName,
  IRole,
} from '@gnc/shared-types'

export interface INavItem {
  label: string
  path: string
  icon: string
  roles: import('@gnc/shared-types').RoleName[]
}

export interface ISelectOption {
  value: string
  label: string
}

export interface ITableColumn<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}
