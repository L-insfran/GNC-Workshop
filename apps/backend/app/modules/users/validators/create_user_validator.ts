import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().maxLength(255),
    password: vine.string().minLength(8).maxLength(255),
    fullName: vine.string().minLength(2).maxLength(255),
    phone: vine.string().maxLength(50).optional(),
    roleIds: vine.array(vine.string().uuid()).minLength(1),
    isActive: vine.boolean().optional(),
  })
)
