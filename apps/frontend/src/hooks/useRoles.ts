import { useQuery } from '@tanstack/react-query'
import { roleService } from '@/services/roleService'

const QUERY_KEY = 'roles'

export function useRoles() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const response = await roleService.list()
      return response.data ?? []
    },
  })
}
