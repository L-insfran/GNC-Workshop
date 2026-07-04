import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCliente, useClienteMutations } from '@/hooks/useClientes'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import {
  CLIENTE_TIPO_LABELS,
  CONDICION_IVA_LABELS,
  DOCUMENTO_TIPO_LABELS,
} from '@/utils/format'
import { ApiError } from '@/services/api-client'

const clienteSchema = z.object({
  tipo: z.enum(['persona_fisica', 'persona_juridica']),
  razonSocial: z.string().min(2, 'Requerido'),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  documentoTipo: z.enum(['dni', 'cuit', 'cuil']),
  documentoNumero: z.string().min(6, 'Documento inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  telefonoAlt: z.string().optional(),
  condicionIva: z.enum(['responsable_inscripto', 'monotributo', 'consumidor_final', 'exento']),
  notas: z.string().optional(),
})

type ClienteForm = z.infer<typeof clienteSchema>

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { data: cliente, isLoading } = useCliente(id)
  const { create, update } = useClienteMutations()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipo: 'persona_fisica',
      documentoTipo: 'dni',
      condicionIva: 'consumidor_final',
    },
  })

  useEffect(() => {
    if (cliente) {
      reset({
        tipo: cliente.tipo,
        razonSocial: cliente.razonSocial,
        nombre: cliente.nombre ?? '',
        apellido: cliente.apellido ?? '',
        documentoTipo: cliente.documentoTipo,
        documentoNumero: cliente.documentoNumero,
        email: cliente.email ?? '',
        telefono: cliente.telefono ?? '',
        telefonoAlt: cliente.telefonoAlt ?? '',
        condicionIva: cliente.condicionIva,
        notas: cliente.notas ?? '',
      })
    }
  }, [cliente, reset])

  const onSubmit = async (data: ClienteForm) => {
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        nombre: data.nombre || undefined,
        apellido: data.apellido || undefined,
        telefono: data.telefono || undefined,
        telefonoAlt: data.telefonoAlt || undefined,
        notas: data.notas || undefined,
      }

      if (isEditing && id) {
        await update.mutateAsync({ id, data: payload })
        navigate(ROUTES.CLIENTE_DETAIL(id))
      } else {
        const response = await create.mutateAsync(payload)
        navigate(ROUTES.CLIENTE_DETAIL(response.data!.id))
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al guardar cliente'
      setError('root', { message })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to={isEditing && id ? ROUTES.CLIENTE_DETAIL(id) : ROUTES.CLIENTES}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader
          title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
          description="Datos del cliente del taller"
        />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo"
                options={Object.entries(CLIENTE_TIPO_LABELS).map(([value, label]) => ({ value, label }))}
                error={errors.tipo?.message}
                {...register('tipo')}
              />
              <Select
                label="Condición IVA"
                options={Object.entries(CONDICION_IVA_LABELS).map(([value, label]) => ({ value, label }))}
                error={errors.condicionIva?.message}
                {...register('condicionIva')}
              />
            </div>

            <Input label="Razón social" error={errors.razonSocial?.message} {...register('razonSocial')} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
              <Input label="Apellido" error={errors.apellido?.message} {...register('apellido')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo documento"
                options={Object.entries(DOCUMENTO_TIPO_LABELS).map(([value, label]) => ({ value, label }))}
                error={errors.documentoTipo?.message}
                {...register('documentoTipo')}
              />
              <Input
                label="Número documento"
                error={errors.documentoNumero?.message}
                {...register('documentoNumero')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Teléfono" error={errors.telefono?.message} {...register('telefono')} />
            </div>

            <Input label="Teléfono alternativo" {...register('telefonoAlt')} />

            <div>
              <label className="block text-sm font-medium text-slate-700">Notas</label>
              <textarea
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                rows={3}
                {...register('notas')}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link to={ROUTES.CLIENTES}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Guardar cambios' : 'Crear cliente'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
