import vine from '@vinejs/vine'
import { cilindroInputSchema } from '#modules/equipos_gnc/validators/cilindro_schema'

export const createEquipoGncValidator = vine.compile(
  vine.object({
    vehiculoId: vine.string().uuid(),
    numeroSerieEquipo: vine.string().trim().minLength(1).maxLength(50),
    marcaRegulador: vine.string().trim().minLength(1).maxLength(100),
    modeloRegulador: vine.string().trim().minLength(1).maxLength(100),
    fechaInstalacion: vine.string(),
    certificadorCrpc: vine.string().trim().maxLength(100).optional(),
    notas: vine.string().optional(),
    cilindros: vine.array(cilindroInputSchema).minLength(1).maxLength(4),
  })
)
