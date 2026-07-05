import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateFacturaDTO, IPaginationParams } from '@gnc/shared-types'
import { facturaService } from '@/services/facturaService'

const QUERY_KEY = 'facturas'

export function useFacturas(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await facturaService.list(params)
      return { data: response.data ?? [], meta: response.meta }
    },
  })
}

export function useFactura(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await facturaService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useFacturaMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  return {
    create: useMutation({
      mutationFn: (data: CreateFacturaDTO) => facturaService.create(data),
      onSuccess: invalidate,
    }),
    anular: useMutation({
      mutationFn: (id: string) => facturaService.anular(id),
      onSuccess: invalidate,
    }),
  }
}
