import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  useOrdenTrabajo,
  useOrdenTrabajoMutations,
  useTiposTrabajo,
} from '@/hooks/useOrdenesTrabajo'
import { useClientes, useClienteVehiculos } from '@/hooks/useClientes'
import { useEquiposGnc } from '@/hooks/useEquiposGnc'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ORDEN_PRIORIDAD_LABELS } from '@/utils/format'
import { ApiError } from '@/services/api-client'

const ordenSchema = z.object({
  clienteId: z.string().min(1, 'Seleccioná un cliente'),
  vehiculoId: z.string().min(1, 'Seleccioná un vehículo'),
  equipoGncId: z.string().optional(),
  tipoTrabajoId: z.string().min(1, 'Seleccioná un tipo de trabajo'),
  prioridad: z.enum(['baja', 'normal', 'alta', 'urgente']).optional(),
  fechaEstimadaEntrega: z.string().optional(),
  kilometrajeIngreso: z.coerce.number().optional(),
  descripcionProblema: z.string().optional(),
  observacionesInternas: z.string().optional(),
})

type OrdenForm = z.infer<typeof ordenSchema>

export function OrdenTrabajoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const { data: orden, isLoading } = useOrdenTrabajo(id)
  const { data: clientesData } = useClientes({ perPage: 100 })
  const { data: tiposTrabajo } = useTiposTrabajo()
  const { create, update } = useOrdenTrabajoMutations()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<OrdenForm>({
    resolver: zodResolver(ordenSchema),
    defaultValues: { prioridad: 'normal' },
  })

  const clienteId = watch('clienteId')
  const vehiculoId = watch('vehiculoId')

  const { data: vehiculos } = useClienteVehiculos(clienteId || undefined)
  const { data: equiposData } = useEquiposGnc(
    vehiculoId ? { perPage: 100 } : undefined,
  )

  useEffect(() => {
    if (orden) {
      reset({
        clienteId: orden.clienteId,
        vehiculoId: orden.vehiculoId,
        equipoGncId: orden.equipoGncId ?? '',
        tipoTrabajoId: orden.tipoTrabajoId,
        prioridad: orden.prioridad,
        fechaEstimadaEntrega: orden.fechaEstimadaEntrega?.split('T')[0] ?? '',
        kilometrajeIngreso: orden.kilometrajeIngreso,
        descripcionProblema: orden.descripcionProblema ?? '',
        observacionesInternas: orden.observacionesInternas ?? '',
      })
    }
  }, [orden, reset])

  const onSubmit = async (data: OrdenForm) => {
    try {
      const payload = {
        ...data,
        equipoGncId: data.equipoGncId || undefined,
        fechaEstimadaEntrega: data.fechaEstimadaEntrega || undefined,
        descripcionProblema: data.descripcionProblema || undefined,
        observacionesInternas: data.observacionesInternas || undefined,
      }

      if (isEditing && id) {
        await update.mutateAsync({ id, data: payload })
        navigate(ROUTES.ORDEN_TRABAJO_DETAIL(id))
      } else {
        const response = await create.mutateAsync(payload)
        navigate(ROUTES.ORDEN_TRABAJO_DETAIL(response.data!.id))
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al guardar OT'
      setError('root', { message })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  const clienteOptions = (clientesData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.razonSocial,
  }))

  const vehiculoOptions = (vehiculos ?? []).map((v) => ({ value: v.id, label: v.patente }))

  const equipoOptions = (equiposData?.data ?? [])
    .filter((e) => !vehiculoId || e.vehiculoId === vehiculoId)
    .map((e) => ({ value: e.id, label: e.numeroSerieEquipo }))

  const tipoTrabajoOptions = (tiposTrabajo ?? []).map((t) => ({
    value: t.id,
    label: t.nombre,
  }))

  const prioridadOptions = Object.entries(ORDEN_PRIORIDAD_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to={isEditing && id ? ROUTES.ORDEN_TRABAJO_DETAIL(id) : ROUTES.ORDENES_TRABAJO}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader title={isEditing ? 'Editar orden de trabajo' : 'Nueva orden de trabajo'} />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

            <Select
              label="Cliente"
              options={clienteOptions}
              placeholder="Seleccionar cliente"
              error={errors.clienteId?.message}
              {...register('clienteId')}
            />

            <Select
              label="Vehículo"
              options={vehiculoOptions}
              placeholder="Seleccionar vehículo"
              error={errors.vehiculoId?.message}
              disabled={!clienteId}
              {...register('vehiculoId')}
            />

            <Select
              label="Equipo GNC (opcional)"
              options={equipoOptions}
              placeholder="Seleccionar equipo"
              {...register('equipoGncId')}
            />

            <Select
              label="Tipo de trabajo"
              options={tipoTrabajoOptions}
              placeholder="Seleccionar tipo"
              error={errors.tipoTrabajoId?.message}
              {...register('tipoTrabajoId')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Prioridad"
                options={prioridadOptions}
                error={errors.prioridad?.message}
                {...register('prioridad')}
              />
              <Input label="Fecha estimada entrega" type="date" {...register('fechaEstimadaEntrega')} />
            </div>

            <Input label="Kilometraje ingreso" type="number" {...register('kilometrajeIngreso')} />

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción del problema</label>
              <textarea
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                rows={3}
                {...register('descripcionProblema')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Observaciones internas</label>
              <textarea
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                rows={2}
                {...register('observacionesInternas')}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link to={ROUTES.ORDENES_TRABAJO}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Guardar cambios' : 'Crear OT'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
