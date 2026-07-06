import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateUserDTO, IPaginationParams, UpdateUserDTO } from '@gnc/shared-types'
import { userService } from '@/services/userService'

const QUERY_KEY = 'users'

export function useUsers(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await userService.list(params)
      return { data: response.data ?? [], meta: response.meta }
    },
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await userService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  return {
    create: useMutation({
      mutationFn: (data: CreateUserDTO) => userService.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
        userService.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => userService.remove(id),
      onSuccess: invalidate,
    }),
  }
}
