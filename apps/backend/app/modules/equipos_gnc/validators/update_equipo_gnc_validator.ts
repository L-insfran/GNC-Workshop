import vine from '@vinejs/vine'
import { cilindroInputSchema } from '#modules/equipos_gnc/validators/cilindro_schema'

export const updateEquipoGncValidator = vine.compile(
  vine.object({
    numeroSerieEquipo: vine.string().trim().minLength(1).maxLength(50).optional(),
    marcaRegulador: vine.string().trim().minLength(1).maxLength(100).optional(),
    modeloRegulador: vine.string().trim().minLength(1).maxLength(100).optional(),
    fechaInstalacion: vine.string().optional(),
    certificadorCrpc: vine.string().trim().maxLength(100).optional(),
    notas: vine.string().optional(),
    cilindros: vine.array(cilindroInputSchema).minLength(1).maxLength(4).optional(),
  })
)
