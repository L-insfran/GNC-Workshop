export type EquipoEstado = 'activo' | 'vencido' | 'desinstalado' | 'en_revision'
export type CilindroEstado = 'activo' | 'vencido' | 'retirado' | 'en_ph'

export interface ICilindro {
  id: string
  equipoGncId: string
  numeroSerie: string
  capacidadM3: number
  marca: string
  fechaFabricacion?: string
  fechaUltimaPh: string
  fechaVencimientoPh: string
  estado: CilindroEstado
  posicion: number
}

export interface IEquipoGnc {
  id: string
  vehiculoId: string
  numeroSerieEquipo: string
  marcaRegulador: string
  modeloRegulador: string
  fechaInstalacion: string
  fechaVencimientoOblea: string
  estado: EquipoEstado
  certificadorCrpc?: string
  notas?: string
  cilindros?: ICilindro[]
  createdAt: string
  updatedAt: string
}

export interface CreateEquipoGncDTO {
  vehiculoId: string
  numeroSerieEquipo: string
  marcaRegulador: string
  modeloRegulador: string
  fechaInstalacion: string
  certificadorCrpc?: string
  notas?: string
  cilindros: CreateCilindroDTO[]
}

export interface CreateCilindroDTO {
  numeroSerie: string
  capacidadM3: number
  marca: string
  fechaFabricacion?: string
  fechaUltimaPh: string
  posicion: number
}
