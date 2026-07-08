import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateKitItemDTO, UpdateKitItemDTO } from '@gnc/shared-types'
import { kitTrabajoService } from '@/services/kitTrabajoService'

const QUERY_KEY = 'kit-trabajos'

export function useKitItems(tipoTrabajoId: string | null | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, tipoTrabajoId],
    queryFn: async () => {
      if (!tipoTrabajoId) throw new Error('tipoTrabajoId requerido')
      const response = await kitTrabajoService.listByTipo(tipoTrabajoId)
      return response.data ?? []
    },
    enabled: Boolean(tipoTrabajoId),
  })
}

export function useKitTrabajoMutations(tipoTrabajoId: string | null | undefined) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, tipoTrabajoId] })

  return {
    create: useMutation({
      mutationFn: (data: CreateKitItemDTO) => {
        if (!tipoTrabajoId) throw new Error('tipoTrabajoId requerido')
        return kitTrabajoService.create(tipoTrabajoId, data)
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ itemId, data }: { itemId: string; data: UpdateKitItemDTO }) =>
        kitTrabajoService.update(itemId, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (itemId: string) => kitTrabajoService.remove(itemId),
      onSuccess: invalidate,
    }),
  }
}
