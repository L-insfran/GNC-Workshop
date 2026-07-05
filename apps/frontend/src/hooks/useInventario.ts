import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateProductoDTO,
  IPaginationParams,
  MovimientoStockDTO,
  UpdateProductoDTO,
} from '@gnc/shared-types'
import { inventarioService } from '@/services/inventarioService'

const QUERY_KEY = 'inventario'

export function useProductos(params?: IPaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, 'productos', params],
    queryFn: async () => {
      const response = await inventarioService.list(params)
      return { data: response.data ?? [], meta: response.meta }
    },
  })
}

export function useProducto(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await inventarioService.getById(id)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useCategorias() {
  return useQuery({
    queryKey: [QUERY_KEY, 'categorias'],
    queryFn: async () => {
      const response = await inventarioService.categorias()
      return response.data ?? []
    },
  })
}

export function useAlertasStock() {
  return useQuery({
    queryKey: [QUERY_KEY, 'alertas'],
    queryFn: async () => {
      const response = await inventarioService.alertas()
      return response.data ?? []
    },
  })
}

export function useInventarioMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })

  return {
    create: useMutation({
      mutationFn: (data: CreateProductoDTO) => inventarioService.create(data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateProductoDTO }) =>
        inventarioService.update(id, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => inventarioService.remove(id),
      onSuccess: invalidate,
    }),
    movimiento: useMutation({
      mutationFn: (data: MovimientoStockDTO) => inventarioService.movimiento(data),
      onSuccess: invalidate,
    }),
  }
}
