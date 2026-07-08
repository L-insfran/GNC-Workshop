import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTurno, useAgendaMutations } from '@/hooks/useAgenda'
import { useClientes, useClienteVehiculos } from '@/hooks/useClientes'
import { useTiposTrabajo } from '@/hooks/useOrdenesTrabajo'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ApiError } from '@/services/api-client'
import { formatPatente } from '@/utils/format'

const schema = z.object({
  clienteId: z.string().min(1, 'Seleccioná un cliente'),
  vehiculoId: z.string().optional(),
  tipoTrabajoId: z.string().optional(),
  fechaHora: z.string().min(1, 'Requerido'),
  estado: z.enum(['pendiente', 'confirmado', 'cancelado', 'completado']).optional(),
  notas: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function toLocalInputValue(iso: string) {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function TurnoFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const clienteIdParam = searchParams.get('clienteId') ?? ''
  const vehiculoIdParam = searchParams.get('vehiculoId') ?? ''
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { data: turno, isLoading } = useTurno(id)
  const { data: clientesData } = useClientes({ perPage: 100 })
  const { data: tiposTrabajo } = useTiposTrabajo()
  const { create, update } = useAgendaMutations()

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
    defaultValues: {
      clienteId: clienteIdParam,
      vehiculoId: vehiculoIdParam,
      estado: 'pendiente',
      fechaHora: toLocalInputValue(new Date().toISOString()),
      tipoTrabajoId: '',
    },
  })

  const clienteId = watch('clienteId')
  const { data: vehiculosCliente } = useClienteVehiculos(clienteId || undefined)

  useEffect(() => {
    if (!clienteId) {
      setValue('vehiculoId', '')
    }
  }, [clienteId, setValue])

  useEffect(() => {
    if (!isEditing && clienteIdParam) {
      setValue('clienteId', clienteIdParam)
    }
    if (!isEditing && vehiculoIdParam) {
      setValue('vehiculoId', vehiculoIdParam)
    }
  }, [isEditing, clienteIdParam, vehiculoIdParam, setValue])

  useEffect(() => {
    if (turno) {
      reset({
        clienteId: turno.clienteId,
        vehiculoId: turno.vehiculoId ?? '',
        tipoTrabajoId: turno.tipoTrabajoId ?? '',
        fechaHora: toLocalInputValue(turno.fechaHora),
        estado: turno.estado,
        notas: turno.notas ?? '',
      })
    }
  }, [turno, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId || undefined,
        tipoTrabajoId: data.tipoTrabajoId || undefined,
        fechaHora: new Date(data.fechaHora).toISOString(),
        estado: data.estado,
        notas: data.notas || undefined,
      }

      if (isEditing && id) {
        await update.mutateAsync({ id, data: payload })
      } else {
        await create.mutateAsync(payload)
      }
      navigate(ROUTES.AGENDA)
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al guardar turno',
      })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link to={ROUTES.AGENDA} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <Card>
        <CardHeader title={isEditing ? 'Editar turno' : 'Nuevo turno'} />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
            <Select
              label="Cliente"
              options={(clientesData?.data ?? []).map((c) => ({ value: c.id, label: c.razonSocial }))}
              placeholder="Seleccionar"
              error={errors.clienteId?.message}
              {...register('clienteId')}
            />
            <Select
              label="Vehículo"
              options={(vehiculosCliente ?? []).map((v) => ({
                value: v.id,
                label: formatPatente(v.patente),
              }))}
              placeholder={
                clienteId ? 'Opcional (requerido para generar OT)' : 'Seleccioná un cliente primero'
              }
              disabled={!clienteId}
              {...register('vehiculoId')}
            />
            <Select
              label="Tipo de trabajo"
              options={(tiposTrabajo ?? []).map((t) => ({
                value: t.id,
                label: t.nombre,
              }))}
              placeholder="Opcional (requerido para generar OT)"
              {...register('tipoTrabajoId')}
            />
            <Input
              label="Fecha y hora"
              type="datetime-local"
              error={errors.fechaHora?.message}
              {...register('fechaHora')}
            />
            {isEditing && (
              <Select
                label="Estado"
                options={[
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'confirmado', label: 'Confirmado' },
                  { value: 'cancelado', label: 'Cancelado' },
                  { value: 'completado', label: 'Completado' },
                ]}
                {...register('estado')}
              />
            )}
            <Input label="Notas" {...register('notas')} />
            {turno?.ordenTrabajoId && (
              <Alert variant="info">
                Turno vinculado a la OT{' '}
                <Link
                  to={ROUTES.ORDEN_TRABAJO_DETAIL(turno.ordenTrabajoId)}
                  className="font-medium underline"
                >
                  {turno.ordenTrabajoNumero ?? turno.ordenTrabajoId.slice(0, 8)}
                </Link>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Link to={ROUTES.AGENDA}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
