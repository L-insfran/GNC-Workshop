import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProductos, useInventarioMutations } from '@/hooks/useInventario'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

const schema = z.object({
  productoId: z.string().min(1, 'Seleccioná un producto'),
  tipo: z.enum(['ingreso', 'egreso', 'ajuste']),
  cantidad: z.coerce.number().min(1),
  motivo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function MovimientoPage() {
  const navigate = useNavigate()
  const { data: productosData } = useProductos({ perPage: 100 })
  const { movimiento } = useInventarioMutations()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'ingreso', cantidad: 1 },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await movimiento.mutateAsync({
        ...data,
        motivo: data.motivo || undefined,
      })
      navigate(ROUTES.INVENTARIO)
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al registrar movimiento',
      })
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link to={ROUTES.INVENTARIO} className="inline-flex items-center gap-2 text-sm text-slate-500">
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
              {...register('productoId')}
            />
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
            <Input label="Motivo" {...register('motivo')} />
            <div className="flex justify-end gap-2">
              <Link to={ROUTES.INVENTARIO}><Button type="button" variant="outline">Cancelar</Button></Link>
              <Button type="submit" isLoading={isSubmitting}>Registrar</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
