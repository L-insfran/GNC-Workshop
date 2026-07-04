import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateClienteDTO, IPaginationParams, UpdateClienteDTO } from '@gnc/shared-types'
import { clienteService } from '@/services/clienteService'

const QUERY_KEY = 'clientes'

export function useClientes(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await clienteService.list(params)
      return {
        data: response.data ?? [],
        meta: response.meta,
      }
    },
  })
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await clienteService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useClienteMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  const create = useMutation({
    mutationFn: (data: CreateClienteDTO) => clienteService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClienteDTO }) =>
      clienteService.update(id, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => clienteService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useClienteVehiculos(clienteId: string | undefined) {
  return useQuery({
    queryKey: ['clientes', clienteId, 'vehiculos'],
    queryFn: async () => {
      if (!clienteId) throw new Error('ID requerido')
      const response = await clienteService.getVehiculos(clienteId)
      return response.data ?? []
    },
    enabled: Boolean(clienteId),
  })
}
