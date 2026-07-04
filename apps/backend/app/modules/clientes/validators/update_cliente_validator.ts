import vine from '@vinejs/vine'

const clienteTipo = () => vine.enum(['persona_fisica', 'persona_juridica'])
const documentoTipo = () => vine.enum(['dni', 'cuit', 'cuil'])
const condicionIva = () =>
  vine.enum(['responsable_inscripto', 'monotributo', 'consumidor_final', 'exento'])

export const updateClienteValidator = vine.compile(
  vine.object({
    tipo: clienteTipo().optional(),
    razonSocial: vine.string().minLength(2).maxLength(255).optional(),
    nombre: vine.string().maxLength(100).nullable().optional(),
    apellido: vine.string().maxLength(100).nullable().optional(),
    documentoTipo: documentoTipo().optional(),
    documentoNumero: vine.string().minLength(5).maxLength(20).optional(),
    email: vine.string().email().maxLength(255).nullable().optional(),
    telefono: vine.string().maxLength(50).nullable().optional(),
    telefonoAlt: vine.string().maxLength(50).nullable().optional(),
    condicionIva: condicionIva().optional(),
    notas: vine.string().nullable().optional(),
    isActive: vine.boolean().optional(),
  })
)
