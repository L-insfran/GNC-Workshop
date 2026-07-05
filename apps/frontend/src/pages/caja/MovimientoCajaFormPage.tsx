import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCajaMutations } from '@/hooks/useCaja'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

const schema = z.object({
  tipo: z.enum(['ingreso', 'egreso']),
  monto: z.coerce.number().min(0.01, 'Monto inválido'),
  concepto: z.string().min(2, 'Requerido'),
})

type FormData = z.infer<typeof schema>

export function MovimientoCajaFormPage() {
  const navigate = useNavigate()
  const { createMovimiento } = useCajaMutations()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'ingreso', monto: 0 },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createMovimiento.mutateAsync(data)
      navigate(ROUTES.CAJA)
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al registrar movimiento',
      })
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link to={ROUTES.CAJA} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <Card>
        <CardHeader title="Movimiento de caja" />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
            <Select
              label="Tipo"
              options={[
                { value: 'ingreso', label: 'Ingreso' },
                { value: 'egreso', label: 'Egreso' },
              ]}
              {...register('tipo')}
            />
            <Input label="Monto" type="number" step="0.01" error={errors.monto?.message} {...register('monto')} />
            <Input label="Concepto" error={errors.concepto?.message} {...register('concepto')} />
            <div className="flex justify-end gap-2">
              <Link to={ROUTES.CAJA}><Button type="button" variant="outline">Cancelar</Button></Link>
              <Button type="submit" isLoading={isSubmitting}>Registrar</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
