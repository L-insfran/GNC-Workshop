import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProducto, useCategorias, useInventarioMutations, useCategoriaMutations } from '@/hooks/useInventario'
import { ROUTES } from '@/constants/routes'
import { CatalogModal } from '@/components/configuracion/CatalogModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ApiError } from '@/services/api-client'

const schema = z.object({
  codigo: z.string().min(1, 'Requerido'),
  nombre: z.string().min(2, 'Requerido'),
  categoriaId: z.string().optional(),
  precioCompra: z.coerce.number().min(0),
  precioVenta: z.coerce.number().min(0),
  stockMinimo: z.coerce.number().min(0).optional(),
  unidadMedida: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function ProductoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { data: producto, isLoading } = useProducto(id)
  const { data: categorias } = useCategorias()
  const { create, update } = useInventarioMutations()
  const { create: createCategoria } = useCategoriaMutations()
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unidadMedida: 'unidad', stockMinimo: 0, precioCompra: 0, precioVenta: 0 },
  })

  useEffect(() => {
    if (producto) {
      reset({
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoriaId: producto.categoriaId ?? '',
        precioCompra: Number(producto.precioCompra),
        precioVenta: Number(producto.precioVenta),
        stockMinimo: producto.stockMinimo,
        unidadMedida: producto.unidadMedida,
      })
    }
  }, [producto, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        categoriaId: data.categoriaId || undefined,
        unidadMedida: data.unidadMedida || 'unidad',
      }
      if (isEditing && id) {
        await update.mutateAsync({ id, data: payload })
      } else {
        await create.mutateAsync(payload)
      }
      navigate(ROUTES.INVENTARIO)
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al guardar producto',
      })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to={ROUTES.INVENTARIO} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <Card>
        <CardHeader title={isEditing ? 'Editar producto' : 'Nuevo producto'} />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Código" error={errors.codigo?.message} {...register('codigo')} />
              <Input label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
            </div>
            <div className="space-y-1.5">
              <Select
                label="Categoría"
                options={(categorias ?? []).map((c) => ({ value: c.id, label: c.nombre }))}
                placeholder="Sin categoría"
                value={watch('categoriaId') ?? ''}
                onChange={(e) => setValue('categoriaId', e.target.value)}
              />
              <button
                type="button"
                className="text-xs text-brand-600 hover:underline"
                onClick={() => setShowCategoriaModal(true)}
              >
                + Nueva categoría
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Precio compra" type="number" step="0.01" error={errors.precioCompra?.message} {...register('precioCompra')} />
              <Input label="Precio venta" type="number" step="0.01" error={errors.precioVenta?.message} {...register('precioVenta')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Stock mínimo" type="number" {...register('stockMinimo')} />
              <Input label="Unidad" {...register('unidadMedida')} />
            </div>
            <div className="flex justify-end gap-2">
              <Link to={ROUTES.INVENTARIO}><Button type="button" variant="outline">Cancelar</Button></Link>
              <Button type="submit" isLoading={isSubmitting}>{isEditing ? 'Guardar' : 'Crear'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <CatalogModal
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        title="Nueva categoría"
        showDescripcion
        onSubmit={async (data) => {
          const response = await createCategoria.mutateAsync(data)
          if (response.data?.id) {
            setValue('categoriaId', response.data.id)
          }
        }}
      />
    </div>
  )
}
