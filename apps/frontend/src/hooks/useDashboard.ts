import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IRegistrarVencimientoNotificacionDTO } from '@gnc/shared-types'
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

export function useDashboardPendientesNotificar(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'vencimientos-pendientes-notificar'],
    queryFn: async () => {
      const response = await dashboardService.getPendientesNotificar()
      return response.data ?? []
    },
    enabled,
  })
}

export function useDashboardNotificacionesConfig(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'notificaciones-config'],
    queryFn: async () => {
      const response = await dashboardService.getNotificacionesConfig()
      return response.data
    },
    enabled,
  })
}

export function useMarcarVencimientoNotificado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      alertaId,
      data,
    }: {
      alertaId: string
      data: IRegistrarVencimientoNotificacionDTO
    }) => {
      const response = await dashboardService.marcarNotificado(alertaId, data)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['dashboard', 'vencimientos-pendientes-notificar'],
      })
    },
  })
}

export function useDashboardAlertasOperativas() {
  return useQuery({
    queryKey: ['dashboard', 'alertas-operativas'],
    queryFn: async () => {
      const response = await dashboardService.getAlertasOperativas()
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
