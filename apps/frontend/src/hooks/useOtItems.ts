import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateOtItemDTO, UpdateOtItemDTO } from '@gnc/shared-types'
import { otItemService } from '@/services/otItemService'

const QUERY_KEY = 'ot-items'
const ORDEN_QUERY_KEY = 'ordenes-trabajo'

export function useOtPresupuesto(ordenTrabajoId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, ordenTrabajoId],
    queryFn: async () => {
      if (!ordenTrabajoId) throw new Error('ID requerido')
      const response = await otItemService.getPresupuesto(ordenTrabajoId)
      return response.data
    },
    enabled: Boolean(ordenTrabajoId),
  })
}

export function useOtItemMutations(ordenTrabajoId: string | undefined) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, ordenTrabajoId] })
    queryClient.invalidateQueries({ queryKey: [ORDEN_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['inventario'] })
  }

  return {
    create: useMutation({
      mutationFn: (data: CreateOtItemDTO) => {
        if (!ordenTrabajoId) throw new Error('ID requerido')
        return otItemService.create(ordenTrabajoId, data)
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ itemId, data }: { itemId: string; data: UpdateOtItemDTO }) => {
        if (!ordenTrabajoId) throw new Error('ID requerido')
        return otItemService.update(ordenTrabajoId, itemId, data)
      },
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (itemId: string) => {
        if (!ordenTrabajoId) throw new Error('ID requerido')
        return otItemService.remove(ordenTrabajoId, itemId)
      },
      onSuccess: invalidate,
    }),
  }
}
