import User from '#models/user'

export async function countActiveMecanicos(): Promise<number> {
  const result = await User.query()
    .where('is_active', true)
    .whereNull('deleted_at')
    .whereHas('roles', (query) => {
      query.where('name', 'mecanico')
    })
    .count('* as total')

  return Number(result[0]?.$extras.total ?? 0)
}

export async function findActiveMecanico(id: string): Promise<User | null> {
  return User.query()
    .where('id', id)
    .where('is_active', true)
    .whereNull('deleted_at')
    .whereHas('roles', (query) => {
      query.where('name', 'mecanico')
    })
    .first()
}
