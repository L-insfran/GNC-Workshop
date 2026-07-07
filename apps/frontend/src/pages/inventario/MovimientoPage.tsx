import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProductos, useInventarioMutations } from '@/hooks/useInventario'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'
import type { StockMovimientoTipo } from '@gnc/shared-types'

const TIPOS_VALIDOS: StockMovimientoTipo[] = ['ingreso', 'egreso', 'ajuste']

const schema = z.object({
  productoId: z.string().min(1, 'Seleccioná un producto'),
  tipo: z.enum(['ingreso', 'egreso', 'ajuste']),
  cantidad: z.coerce.number().min(1),
  motivo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function parseTipoParam(value: string | null): StockMovimientoTipo | undefined {
  if (!value) return undefined
  return TIPOS_VALIDOS.includes(value as StockMovimientoTipo)
    ? (value as StockMovimientoTipo)
    : undefined
}

export function MovimientoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const productoIdParam = searchParams.get('productoId')
  const tipoParam = parseTipoParam(searchParams.get('tipo'))

  const { data: productosData } = useProductos({ perPage: 100 })
  const { movimiento } = useInventarioMutations()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productoId: productoIdParam ?? '',
      tipo: tipoParam ?? 'ingreso',
      cantidad: 1,
    },
  })

  const productoId = watch('productoId')
  const productoSeleccionado = productosData?.data.find((p) => p.id === productoId)

  useEffect(() => {
    if (productoIdParam) {
      setValue('productoId', productoIdParam)
    }
    if (tipoParam) {
      setValue('tipo', tipoParam)
    }
  }, [productoIdParam, tipoParam, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      await movimiento.mutateAsync({
        ...data,
        motivo: data.motivo || undefined,
      })
      navigate(productoIdParam ? ROUTES.PRODUCTO_DETAIL(productoIdParam) : ROUTES.INVENTARIO)
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al registrar movimiento',
      })
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link
        to={productoIdParam ? ROUTES.PRODUCTO_DETAIL(productoIdParam) : ROUTES.INVENTARIO}
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <Card>
        <CardHeader title="Movimiento de stock" description="Ingreso, egreso o ajuste de inventario" />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
            <Select
              label="Producto"
              options={(productosData?.data ?? []).map((p) => ({
                value: p.id,
                label: `${p.codigo} — ${p.nombre} (stock: ${p.stockActual})`,
              }))}
              placeholder="Seleccionar"
              error={errors.productoId?.message}
              value={productoId}
              onChange={(e) => setValue('productoId', e.target.value)}
            />
            {productoSeleccionado && (
              <p className="text-sm text-slate-500">
                Stock actual:{' '}
                <span className="font-medium text-slate-900">
                  {productoSeleccionado.stockActual} {productoSeleccionado.unidadMedida}
                </span>
              </p>
            )}
            <Select
              label="Tipo"
              options={[
                { value: 'ingreso', label: 'Ingreso' },
                { value: 'egreso', label: 'Egreso' },
                { value: 'ajuste', label: 'Ajuste (definir stock)' },
              ]}
              {...register('tipo')}
            />
            <Input label="Cantidad" type="number" error={errors.cantidad?.message} {...register('cantidad')} />
            <Input label="Motivo" placeholder="Ej: Compra inicial, devolución..." {...register('motivo')} />
            <div className="flex justify-end gap-2">
              <Link to={ROUTES.INVENTARIO}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Registrar
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
