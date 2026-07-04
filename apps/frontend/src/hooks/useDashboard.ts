import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const response = await dashboardService.getKpis()
      return response.data
    },
  })
}

export function useDashboardVencimientos() {
  return useQuery({
    queryKey: ['dashboard', 'vencimientos'],
    queryFn: async () => {
      const response = await dashboardService.getVencimientos()
      return response.data ?? []
    },
  })
}

export function useDashboardProduccion(dias = 7) {
  return useQuery({
    queryKey: ['dashboard', 'produccion', dias],
    queryFn: async () => {
      const response = await dashboardService.getProduccion(dias)
      return response.data ?? []
    },
  })
}
