import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateEquipoGncDTO, IPaginationParams } from '@gnc/shared-types'
import { equipoGncService } from '@/services/equipoGncService'

const QUERY_KEY = 'equipos-gnc'

export function useEquiposGnc(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await equipoGncService.list(params)
      return {
        data: response.data ?? [],
        meta: response.meta,
      }
    },
  })
}

export function useEquipoGnc(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await equipoGncService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useEquipoGncMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  const create = useMutation({
    mutationFn: (data: CreateEquipoGncDTO) => equipoGncService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEquipoGncDTO> }) =>
      equipoGncService.update(id, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => equipoGncService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
