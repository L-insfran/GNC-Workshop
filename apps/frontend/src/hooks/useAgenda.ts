import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTurnoDTO, IPaginationParams, UpdateTurnoDTO } from '@gnc/shared-types'
import { agendaService } from '@/services/agendaService'

const QUERY_KEY = 'agenda'

export function useTurnos(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await agendaService.list(params)
      return { data: response.data ?? [], meta: response.meta }
    },
  })
}

export function useTurnosPorFecha(fecha: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'fecha', fecha],
    queryFn: async () => {
      const response = await agendaService.porFecha(fecha)
      return response.data ?? []
    },
    enabled: Boolean(fecha),
  })
}

export function useTurno(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await agendaService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useAgendaMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  return {
    create: useMutation({
      mutationFn: (data: CreateTurnoDTO) => agendaService.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateTurnoDTO }) =>
        agendaService.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => agendaService.remove(id),
      onSuccess: invalidate,
    }),
    generarOt: useMutation({
      mutationFn: (id: string) => agendaService.generarOt(id),
      onSuccess: invalidate,
    }),
  }
}
