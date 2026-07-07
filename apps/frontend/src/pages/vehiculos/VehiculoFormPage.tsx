import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  useVehiculo,
  useVehiculoMarcas,
  useVehiculoModelos,
  useVehiculoMutations,
} from '@/hooks/useVehiculos'
import { useClientes } from '@/hooks/useClientes'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ApiError } from '@/services/api-client'

const vehiculoSchema = z.object({
  clienteId: z.string().min(1, 'Seleccioná un cliente'),
  patente: z.string().min(6, 'Patente inválida'),
  marcaId: z.string().min(1, 'Seleccioná una marca'),
  modeloId: z.string().min(1, 'Seleccioná un modelo'),
  anio: z.coerce.number().min(1980).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  tipoCombustible: z.enum(['nafta', 'diesel', 'gnc', 'dual']),
  numeroMotor: z.string().optional(),
  numeroChasis: z.string().optional(),
  kilometraje: z.coerce.number().optional(),
})

type VehiculoForm = z.infer<typeof vehiculoSchema>

const combustibleOptions = [
  { value: 'nafta', label: 'Nafta' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnc', label: 'GNC' },
  { value: 'dual', label: 'Dual' },
]

export function VehiculoFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const { data: vehiculo, isLoading } = useVehiculo(id)
  const { data: clientesData } = useClientes({ perPage: 100 })
  const { data: marcas } = useVehiculoMarcas()
  const { create, update } = useVehiculoMutations()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<VehiculoForm>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      clienteId: searchParams.get('clienteId') ?? '',
      tipoCombustible: 'dual',
      anio: new Date().getFullYear(),
    },
  })

  const marcaId = watch('marcaId')
  const modeloId = watch('modeloId')
  const { data: modelos, isLoading: modelosLoading } = useVehiculoModelos(marcaId)

  const prevMarcaIdRef = useRef<string | undefined>(undefined)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    if (vehiculo) {
      reset({
        clienteId: vehiculo.clienteId,
        patente: vehiculo.patente,
        marcaId: vehiculo.marcaId,
        modeloId: vehiculo.modeloId,
        anio: vehiculo.anio,
        color: vehiculo.color ?? '',
        tipoCombustible: vehiculo.tipoCombustible,
        numeroMotor: vehiculo.numeroMotor ?? '',
        numeroChasis: vehiculo.numeroChasis ?? '',
        kilometraje: vehiculo.kilometraje,
      })
      prevMarcaIdRef.current = vehiculo.marcaId
      isInitialLoadRef.current = false
    }
  }, [vehiculo, reset])

  useEffect(() => {
    if (!marcaId) {
      prevMarcaIdRef.current = undefined
      return
    }

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      prevMarcaIdRef.current = marcaId
      return
    }

    if (prevMarcaIdRef.current !== marcaId) {
      setValue('modeloId', '')
      prevMarcaIdRef.current = marcaId
    }
  }, [marcaId, setValue])

  const onSubmit = async (data: VehiculoForm) => {
    try {
      const payload = {
        ...data,
        patente: data.patente.trim().toUpperCase(),
        color: data.color || undefined,
        numeroMotor: data.numeroMotor || undefined,
        numeroChasis: data.numeroChasis || undefined,
      }

      if (isEditing && id) {
        const { clienteId: _, ...updateData } = payload
        await update.mutateAsync({ id, data: updateData })
      } else {
        await create.mutateAsync(payload)
      }
      navigate(ROUTES.VEHICULOS)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al guardar vehículo'
      setError('root', { message })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  const clienteOptions = (clientesData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.razonSocial,
  }))

  const marcaOptions = (marcas ?? []).map((m) => ({ value: m.id, label: m.nombre }))
  const modeloOptions = (modelos ?? []).map((m) => ({ value: m.id, label: m.nombre }))

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to={ROUTES.VEHICULOS} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader title={isEditing ? 'Editar vehículo' : 'Nuevo vehículo'} />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

            <Select
              label="Cliente"
              options={clienteOptions}
              placeholder="Seleccionar cliente"
              error={errors.clienteId?.message}
              disabled={isEditing}
              {...register('clienteId')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Patente" error={errors.patente?.message} {...register('patente')} />
              <Input label="Año" type="number" error={errors.anio?.message} {...register('anio')} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Marca y modelo</p>
              <Link
                to={ROUTES.CONFIG_MARCAS_MODELOS}
                className="text-xs text-brand-600 hover:underline"
              >
                Gestionar marcas y modelos
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Marca"
                options={marcaOptions}
                placeholder="Seleccionar marca"
                error={errors.marcaId?.message}
                value={marcaId ?? ''}
                onChange={(e) => setValue('marcaId', e.target.value, { shouldValidate: true })}
              />
              <Select
                label="Modelo"
                options={modeloOptions}
                placeholder={modelosLoading ? 'Cargando modelos...' : 'Seleccionar modelo'}
                error={errors.modeloId?.message}
                disabled={!marcaId || modelosLoading}
                value={modeloId ?? ''}
                onChange={(e) => setValue('modeloId', e.target.value, { shouldValidate: true })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Combustible"
                options={combustibleOptions}
                error={errors.tipoCombustible?.message}
                {...register('tipoCombustible')}
              />
              <Input label="Color" {...register('color')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="N° motor" {...register('numeroMotor')} />
              <Input label="N° chasis" {...register('numeroChasis')} />
            </div>

            <Input label="Kilometraje" type="number" {...register('kilometraje')} />

            <div className="flex justify-end gap-2">
              <Link to={ROUTES.VEHICULOS}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Guardar cambios' : 'Crear vehículo'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
