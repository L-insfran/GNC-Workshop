export type ClienteTipo = 'persona_fisica' | 'persona_juridica'
export type DocumentoTipo = 'dni' | 'cuit' | 'cuil'
export type CondicionIva = 'responsable_inscripto' | 'monotributo' | 'consumidor_final' | 'exento'

export interface ICliente {
  id: string
  tipo: ClienteTipo
  razonSocial: string
  nombre?: string
  apellido?: string
  documentoTipo: DocumentoTipo
  documentoNumero: string
  email?: string
  telefono?: string
  telefonoAlt?: string
  condicionIva: CondicionIva
  notas?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateClienteDTO {
  tipo: ClienteTipo
  razonSocial: string
  nombre?: string
  apellido?: string
  documentoTipo: DocumentoTipo
  documentoNumero: string
  email?: string
  telefono?: string
  telefonoAlt?: string
  condicionIva: CondicionIva
  notas?: string
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>
