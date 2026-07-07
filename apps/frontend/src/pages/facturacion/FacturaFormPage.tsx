import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useFacturaMutations } from '@/hooks/useFacturacion'
import { useClientes } from '@/hooks/useClientes'
import { ROUTES } from '@/constants/routes'
import { ordenTrabajoService } from '@/services/ordenTrabajoService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ApiError } from '@/services/api-client'

const schema = z.object({
  clienteId: z.string().min(1, 'Seleccioná un cliente'),
  tipo: z.enum(['factura_a', 'factura_b', 'factura_c', 'nota_credito']),
  items: z
    .array(
      z.object({
        descripcion: z.string().min(1, 'Requerido'),
        cantidad: z.coerce.number().min(0.01),
        precioUnitario: z.coerce.number().min(0),
      })
    )
    .min(1),
})

type FormData = z.infer<typeof schema>

export function FacturaFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const otId = searchParams.get('otId')
  const { data: clientesData } = useClientes({ perPage: 100 })
  const { create } = useFacturaMutations()

  const [ordenTrabajoId, setOrdenTrabajoId] = useState<string | undefined>()
  const [ordenNumero, setOrdenNumero] = useState<string | undefined>()
  const [prefillLoading, setPrefillLoading] = useState(Boolean(otId))
  const [prefillError, setPrefillError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'factura_b',
      items: [{ descripcion: '', cantidad: 1, precioUnitario: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const tipo = watch('tipo')
  const clienteId = watch('clienteId')

  const subtotal = (items ?? []).reduce(
    (acc, item) => acc + Number(item.cantidad || 0) * Number(item.precioUnitario || 0),
    0
  )
  const iva = tipo === 'factura_a' || tipo === 'factura_b' ? subtotal * 0.21 : 0
  const total = subtotal + iva

  useEffect(() => {
    if (!otId) return

    setPrefillLoading(true)
    setPrefillError(null)

    ordenTrabajoService
      .getFacturaBorrador(otId)
      .then((response) => {
        const borrador = response.data
        if (!borrador) {
          setPrefillError('No se pudo cargar el borrador de factura desde la OT.')
          return
        }

        setOrdenTrabajoId(borrador.ordenTrabajoId)
        setOrdenNumero(borrador.ordenNumero)

        reset({
          clienteId: borrador.clienteId,
          tipo: borrador.tipo,
          items: borrador.items.map((item) => ({
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          })),
        })
      })
      .catch((err: unknown) => {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo cargar el borrador de factura desde la OT.'
        setPrefillError(message)
      })
      .finally(() => setPrefillLoading(false))
  }, [otId, reset])

  const clienteOptions = (() => {
    const options = (clientesData?.data ?? []).map((c) => ({
      value: c.id,
      label: c.razonSocial,
    }))

    if (clienteId && !options.some((option) => option.value === clienteId) && ordenNumero) {
      options.unshift({
        value: clienteId,
        label: `Cliente de OT ${ordenNumero}`,
      })
    }

    return options
  })()

  const onSubmit = async (data: FormData) => {
    try {
      const response = await create.mutateAsync({
        ...data,
        ordenTrabajoId,
        emitir: true,
      })
      navigate(ROUTES.FACTURA_DETAIL(response.data!.id))
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al emitir factura',
      })
    }
  }

  if (prefillLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to={ROUTES.FACTURACION} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <Card>
        <CardHeader
          title={otId ? 'Facturar orden de trabajo' : 'Nueva factura'}
          description={
            ordenNumero
              ? `Ítems precargados desde OT ${ordenNumero}. Podés ajustar antes de emitir.`
              : undefined
          }
        />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {prefillError && <Alert variant="error">{prefillError}</Alert>}
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Cliente"
                options={clienteOptions}
                placeholder="Seleccionar"
                error={errors.clienteId?.message}
                disabled={Boolean(ordenTrabajoId)}
                {...register('clienteId')}
              />
              <Select
                label="Tipo"
                options={[
                  { value: 'factura_a', label: 'Factura A' },
                  { value: 'factura_b', label: 'Factura B' },
                  { value: 'factura_c', label: 'Factura C' },
                  { value: 'nota_credito', label: 'Nota de crédito' },
                ]}
                {...register('tipo')}
              />
            </div>

            {ordenTrabajoId && (
              <Alert variant="info">
                Esta factura quedará vinculada a la OT {ordenNumero ?? ordenTrabajoId}.
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Ítems</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ descripcion: '', cantidad: 1, precioUnitario: 0 })}
                >
                  <Plus className="h-4 w-4" /> Agregar
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-5">
                    <Input label="Descripción" {...register(`items.${index}.descripcion`)} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="Cant." type="number" step="0.01" {...register(`items.${index}.cantidad`)} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      label="P. unitario"
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.precioUnitario`)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%)</span>
                <span>${iva.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link to={ROUTES.FACTURACION}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Emitir factura
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
