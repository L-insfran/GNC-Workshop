import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().maxLength(255).optional(),
    password: vine.string().minLength(8).maxLength(255).optional(),
    fullName: vine.string().minLength(2).maxLength(255).optional(),
    phone: vine.string().maxLength(50).nullable().optional(),
    roleIds: vine.array(vine.string().uuid()).minLength(1).optional(),
    isActive: vine.boolean().optional(),
  })
)
