import { useQuery } from '@tanstack/react-query'
import { ordenTrabajoService } from '@/services/ordenTrabajoService'

const QUERY_KEY = 'ot-factura-vinculada'

export function useFacturaVinculadaOT(ordenTrabajoId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, ordenTrabajoId],
    queryFn: async () => {
      if (!ordenTrabajoId) throw new Error('ID requerido')
      const response = await ordenTrabajoService.getFacturaVinculada(ordenTrabajoId)
      return response.data ?? null
    },
    enabled: Boolean(ordenTrabajoId),
  })
}
