import vine from '@vinejs/vine'

const cilindroSchema = vine.object({
  numeroSerie: vine.string().trim().minLength(1).maxLength(50),
  capacidadM3: vine.number().min(0.1).max(200),
  marca: vine.string().trim().minLength(1).maxLength(100),
  fechaFabricacion: vine.string().optional(),
  fechaUltimaPh: vine.string(),
  posicion: vine.number().min(1).max(4),
})

export const createEquipoGncValidator = vine.compile(
  vine.object({
    vehiculoId: vine.string().uuid(),
    numeroSerieEquipo: vine.string().trim().minLength(1).maxLength(50),
    marcaRegulador: vine.string().trim().minLength(1).maxLength(100),
    modeloRegulador: vine.string().trim().minLength(1).maxLength(100),
    fechaInstalacion: vine.string(),
    certificadorCrpc: vine.string().trim().maxLength(100).optional(),
    notas: vine.string().optional(),
    cilindros: vine.array(cilindroSchema).minLength(1).maxLength(4),
  })
)
