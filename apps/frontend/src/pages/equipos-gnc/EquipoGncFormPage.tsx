import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useEquipoGnc, useEquipoGncMutations } from '@/hooks/useEquiposGnc'
import { useVehiculos } from '@/hooks/useVehiculos'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatPatente } from '@/utils/format'
import { ApiError } from '@/services/api-client'

const cilindroSchema = z.object({
  id: z.string().uuid().optional(),
  numeroSerie: z.string().min(1, 'Requerido'),
  capacidadM3: z.coerce.number().positive('Debe ser positivo'),
  marca: z.string().min(1, 'Requerido'),
  fechaFabricacion: z.string().optional(),
  fechaUltimaPh: z.string().min(1, 'Requerido'),
  posicion: z.coerce.number().min(1),
})

const equipoSchema = z.object({
  vehiculoId: z.string().min(1, 'Seleccioná un vehículo'),
  numeroSerieEquipo: z.string().min(1, 'Requerido'),
  marcaRegulador: z.string().min(1, 'Requerido'),
  modeloRegulador: z.string().min(1, 'Requerido'),
  fechaInstalacion: z.string().min(1, 'Requerido'),
  certificadorCrpc: z.string().optional(),
  notas: z.string().optional(),
  cilindros: z.array(cilindroSchema).min(1, 'Agregá al menos un cilindro'),
})

type EquipoForm = z.infer<typeof equipoSchema>

export function EquipoGncFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const prefillVehiculoId = searchParams.get('vehiculoId') ?? ''
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const { data: equipo, isLoading } = useEquipoGnc(id)
  const { data: vehiculosData } = useVehiculos({ perPage: 100 })
  const { create, update } = useEquipoGncMutations()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EquipoForm>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      fechaInstalacion: new Date().toISOString().split('T')[0],
      cilindros: [
        {
          numeroSerie: '',
          capacidadM3: 0,
          marca: '',
          fechaUltimaPh: new Date().toISOString().split('T')[0]!,
          posicion: 1,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'cilindros' })

  useEffect(() => {
    if (!isEditing && prefillVehiculoId) {
      reset((current) => ({ ...current, vehiculoId: prefillVehiculoId }))
    }
  }, [isEditing, prefillVehiculoId, reset])

  useEffect(() => {
    if (equipo) {
      reset({
        vehiculoId: equipo.vehiculoId,
        numeroSerieEquipo: equipo.numeroSerieEquipo,
        marcaRegulador: equipo.marcaRegulador,
        modeloRegulador: equipo.modeloRegulador,
        fechaInstalacion: equipo.fechaInstalacion.split('T')[0],
        certificadorCrpc: equipo.certificadorCrpc ?? '',
        notas: equipo.notas ?? '',
        cilindros: (equipo.cilindros ?? []).map((c) => ({
          id: c.id,
          numeroSerie: c.numeroSerie,
          capacidadM3: c.capacidadM3,
          marca: c.marca,
          fechaFabricacion: c.fechaFabricacion?.split('T')[0] ?? '',
          fechaUltimaPh: c.fechaUltimaPh.split('T')[0]!,
          posicion: c.posicion,
        })),
      })
    }
  }, [equipo, reset])

  const onSubmit = async (data: EquipoForm) => {
    try {
      const payload = {
        ...data,
        certificadorCrpc: data.certificadorCrpc || undefined,
        notas: data.notas || undefined,
        cilindros: data.cilindros.map((c) => ({
          ...c,
          fechaFabricacion: c.fechaFabricacion || undefined,
        })),
      }

      if (isEditing && id) {
        await update.mutateAsync({ id, data: payload })
      } else {
        await create.mutateAsync(payload)
      }
      navigate(isEditing && id ? ROUTES.EQUIPO_GNC_DETAIL(id) : ROUTES.EQUIPOS_GNC)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al guardar equipo'
      setError('root', { message })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  const vehiculoOptions = (vehiculosData?.data ?? []).map((v) => ({
    value: v.id,
    label: `${formatPatente(v.patente)} - ${v.marcaNombre ?? ''} ${v.modeloNombre ?? ''}`,
  }))

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        to={isEditing && id ? ROUTES.EQUIPO_GNC_DETAIL(id) : ROUTES.EQUIPOS_GNC}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader title={isEditing ? 'Editar equipo GNC' : 'Nuevo equipo GNC'} />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

            <Select
              label="Vehículo"
              options={vehiculoOptions}
              placeholder="Seleccionar vehículo"
              error={errors.vehiculoId?.message}
              disabled={isEditing}
              {...register('vehiculoId')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="N° serie equipo" error={errors.numeroSerieEquipo?.message} {...register('numeroSerieEquipo')} />
              <Input label="Fecha instalación" type="date" error={errors.fechaInstalacion?.message} {...register('fechaInstalacion')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Marca regulador" error={errors.marcaRegulador?.message} {...register('marcaRegulador')} />
              <Input label="Modelo regulador" error={errors.modeloRegulador?.message} {...register('modeloRegulador')} />
            </div>

            <Input label="Certificador CRPC" {...register('certificadorCrpc')} />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Cilindros</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      numeroSerie: '',
                      capacidadM3: 0,
                      marca: '',
                      fechaUltimaPh: new Date().toISOString().split('T')[0]!,
                      posicion: fields.length + 1,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Agregar cilindro
                </Button>
              </div>

              {isEditing && (
                <p className="mb-3 text-xs text-slate-500">
                  Si quitás un cilindro, guardá los cambios para que se archive en el sistema.
                </p>
              )}

              {errors.cilindros?.message && (
                <p className="mb-2 text-xs text-red-600">{errors.cilindros.message}</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Cilindro {index + 1}</span>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="N° serie" error={errors.cilindros?.[index]?.numeroSerie?.message} {...register(`cilindros.${index}.numeroSerie`)} />
                      <Input label="Marca" error={errors.cilindros?.[index]?.marca?.message} {...register(`cilindros.${index}.marca`)} />
                      <Input label="Capacidad (m³)" type="number" step="0.1" error={errors.cilindros?.[index]?.capacidadM3?.message} {...register(`cilindros.${index}.capacidadM3`)} />
                      <Input label="Posición" type="number" error={errors.cilindros?.[index]?.posicion?.message} {...register(`cilindros.${index}.posicion`)} />
                      <Input label="Fecha última PH" type="date" error={errors.cilindros?.[index]?.fechaUltimaPh?.message} {...register(`cilindros.${index}.fechaUltimaPh`)} />
                      <Input label="Fecha fabricación" type="date" {...register(`cilindros.${index}.fechaFabricacion`)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Notas</label>
              <textarea
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                rows={3}
                {...register('notas')}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link to={ROUTES.EQUIPOS_GNC}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Guardar cambios' : 'Crear equipo'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
