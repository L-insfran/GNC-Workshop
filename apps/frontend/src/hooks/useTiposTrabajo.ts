import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTipoTrabajoDTO, UpdateTipoTrabajoDTO } from '@gnc/shared-types'
import { tipoTrabajoService } from '@/services/tipoTrabajoService'

const QUERY_KEY = 'tipos-trabajo'

export function useTiposTrabajoConfig() {
  return useQuery({
    queryKey: [QUERY_KEY, 'config'],
    queryFn: async () => {
      const response = await tipoTrabajoService.list(true)
      return response.data ?? []
    },
  })
}

export function useTipoTrabajoMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
  }

  const create = useMutation({
    mutationFn: (data: CreateTipoTrabajoDTO) => tipoTrabajoService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTipoTrabajoDTO }) =>
      tipoTrabajoService.update(id, data),
    onSuccess: invalidate,
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => tipoTrabajoService.deactivate(id),
    onSuccess: invalidate,
  })

  return { create, update, deactivate }
}
