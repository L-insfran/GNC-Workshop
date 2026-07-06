import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateVehicleDTO,
  IPaginationParams,
  UpdateVehicleDTO,
  CreateVehiculoMarcaDTO,
  UpdateVehiculoMarcaDTO,
  CreateVehiculoModeloDTO,
  UpdateVehiculoModeloDTO,
} from '@gnc/shared-types'
import { vehiculoService } from '@/services/vehiculoService'

const QUERY_KEY = 'vehiculos'

export function useVehiculos(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await vehiculoService.list(params)
      return {
        data: response.data ?? [],
        meta: response.meta,
      }
    },
  })
}

export function useVehiculo(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await vehiculoService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useVehiculoMarcas() {
  return useQuery({
    queryKey: ['vehiculo-marcas'],
    queryFn: async () => {
      const response = await vehiculoService.getMarcas()
      return response.data ?? []
    },
  })
}

export function useVehiculoModelos(marcaId?: string) {
  return useQuery({
    queryKey: ['vehiculo-modelos', marcaId],
    queryFn: async () => {
      const response = await vehiculoService.getModelos(marcaId)
      return response.data ?? []
    },
    enabled: Boolean(marcaId),
  })
}

export function useVehiculoMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  const create = useMutation({
    mutationFn: (data: CreateVehicleDTO) => vehiculoService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleDTO }) =>
      vehiculoService.update(id, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => vehiculoService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useVehiculoCatalogMutations() {
  const queryClient = useQueryClient()

  const invalidateMarcas = () => queryClient.invalidateQueries({ queryKey: ['vehiculo-marcas'] })
  const invalidateModelos = () =>
    queryClient.invalidateQueries({ queryKey: ['vehiculo-modelos'] })

  return {
    createMarca: useMutation({
      mutationFn: (data: CreateVehiculoMarcaDTO) => vehiculoService.createMarca(data),
      onSuccess: invalidateMarcas,
    }),
    updateMarca: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateVehiculoMarcaDTO }) =>
        vehiculoService.updateMarca(id, data),
      onSuccess: invalidateMarcas,
    }),
    removeMarca: useMutation({
      mutationFn: (id: string) => vehiculoService.removeMarca(id),
      onSuccess: () => {
        invalidateMarcas()
        invalidateModelos()
      },
    }),
    createModelo: useMutation({
      mutationFn: (data: CreateVehiculoModeloDTO) => vehiculoService.createModelo(data),
      onSuccess: invalidateModelos,
    }),
    updateModelo: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateVehiculoModeloDTO }) =>
        vehiculoService.updateModelo(id, data),
      onSuccess: invalidateModelos,
    }),
    removeModelo: useMutation({
      mutationFn: (id: string) => vehiculoService.removeModelo(id),
      onSuccess: invalidateModelos,
    }),
  }
}
