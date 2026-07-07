import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCajaMovimientoDTO, IPaginationParams } from '@gnc/shared-types'
import { cajaService } from '@/services/cajaService'

const QUERY_KEY = 'caja'

export function useCajaSaldo() {
  return useQuery({
    queryKey: [QUERY_KEY, 'saldo'],
    queryFn: async () => {
      const response = await cajaService.saldo()
      return response.data
    },
  })
}

export function useCajaMovimientos(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, 'movimientos', params],
    queryFn: async () => {
      const response = await cajaService.movimientos(params)
      return { data: response.data ?? [], meta: response.meta }
    },
  })
}

export function useArqueo(fecha?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'arqueo', fecha],
    queryFn: async () => {
      const response = await cajaService.arqueo(fecha)
      return response.data
    },
  })
}

export function useCajaMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['facturas'] })
    queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] })
    queryClient.invalidateQueries({ queryKey: ['ot-items'] })
  }

  return {
    createMovimiento: useMutation({
      mutationFn: (data: CreateCajaMovimientoDTO) => cajaService.createMovimiento(data),
      onSuccess: invalidate,
    }),
  }
}
