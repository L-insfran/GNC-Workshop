import vine from '@vinejs/vine'

const clienteTipo = () => vine.enum(['persona_fisica', 'persona_juridica'])
const documentoTipo = () => vine.enum(['dni', 'cuit', 'cuil'])
const condicionIva = () =>
  vine.enum(['responsable_inscripto', 'monotributo', 'consumidor_final', 'exento'])

export const createClienteValidator = vine.compile(
  vine.object({
    tipo: clienteTipo(),
    razonSocial: vine.string().minLength(2).maxLength(255),
    nombre: vine.string().maxLength(100).optional(),
    apellido: vine.string().maxLength(100).optional(),
    documentoTipo: documentoTipo(),
    documentoNumero: vine.string().minLength(5).maxLength(20),
    email: vine.string().email().maxLength(255).optional(),
    telefono: vine.string().maxLength(50).optional(),
    telefonoAlt: vine.string().maxLength(50).optional(),
    condicionIva: condicionIva(),
    notas: vine.string().optional(),
  })
)
