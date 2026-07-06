import { useUsers } from '@/hooks/useUsers'
import { ROLES } from '@/constants/roles'

export function useMecanicos() {
  const { data, isLoading, error } = useUsers({ perPage: 100 })

  const mecanicos = (data?.data ?? []).filter(
    (user) => user.isActive && user.roles.some((role) => role.name === ROLES.MECANICO),
  )

  return {
    mecanicos,
    hayMecanicos: mecanicos.length > 0,
    isLoading,
    error,
  }
}
