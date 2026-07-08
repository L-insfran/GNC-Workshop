import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UpsertOtControlCalidadDTO } from '@gnc/shared-types'
import { otControlCalidadService } from '@/services/otControlCalidadService'

const QUERY_KEY = 'ot-control-calidad'

export function useOtControlCalidad(ordenTrabajoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEY, ordenTrabajoId],
    queryFn: async () => {
      if (!ordenTrabajoId) throw new Error('ID requerido')
      const response = await otControlCalidadService.get(ordenTrabajoId)
      return response.data ?? null
    },
    enabled: Boolean(ordenTrabajoId) && enabled,
  })
}

export function useOtControlCalidadMutations(ordenTrabajoId: string | undefined) {
  const queryClient = useQueryClient()

  const upsert = useMutation({
    mutationFn: (data: UpsertOtControlCalidadDTO) => {
      if (!ordenTrabajoId) throw new Error('ID requerido')
      return otControlCalidadService.upsert(ordenTrabajoId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, ordenTrabajoId] })
      queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo', ordenTrabajoId] })
    },
  })

  return { upsert }
}
