import vine from '@vinejs/vine'

export const cilindroInputSchema = vine.object({
  id: vine.string().uuid().optional(),
  numeroSerie: vine.string().trim().minLength(1).maxLength(50),
  capacidadM3: vine.number().min(0.1).max(200),
  marca: vine.string().trim().minLength(1).maxLength(100),
  fechaFabricacion: vine.string().optional(),
  fechaUltimaPh: vine.string(),
  posicion: vine.number().min(1).max(4),
})
