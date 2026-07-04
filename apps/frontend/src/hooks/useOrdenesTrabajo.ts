import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateOrdenTrabajoDTO,
  IPaginationParams,
  UpdateOrdenEstadoDTO,
} from '@gnc/shared-types'
import { ordenTrabajoService } from '@/services/ordenTrabajoService'

const QUERY_KEY = 'ordenes-trabajo'

export function useOrdenesTrabajo(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await ordenTrabajoService.list(params)
      return {
        data: response.data ?? [],
        meta: response.meta,
      }
    },
  })
}

export function useOrdenTrabajo(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await ordenTrabajoService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useTiposTrabajo() {
  return useQuery({
    queryKey: ['tipos-trabajo'],
    queryFn: async () => {
      const response = await ordenTrabajoService.getTiposTrabajo()
      return response.data ?? []
    },
  })
}

export function useOrdenTrabajoMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  const create = useMutation({
    mutationFn: (data: CreateOrdenTrabajoDTO) => ordenTrabajoService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOrdenTrabajoDTO> }) =>
      ordenTrabajoService.update(id, data),
    onSuccess: invalidate,
  })

  const updateEstado = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrdenEstadoDTO }) =>
      ordenTrabajoService.updateEstado(id, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => ordenTrabajoService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, updateEstado, remove }
}
