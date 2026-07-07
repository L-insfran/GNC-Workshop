import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { IOtItem, OrdenEstado, OtItemTipo } from '@gnc/shared-types'
import { OT_ESTADOS_CON_RESERVA_STOCK } from '@gnc/shared-types'
import { useProductos, useStockDisponibilidad } from '@/hooks/useInventario'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

const OT_ITEM_TIPO_LABELS: Record<OtItemTipo, string> = {
  servicio: 'Servicio',
  repuesto: 'Repuesto',
  material: 'Material',
}

const itemSchema = z
  .object({
    tipo: z.enum(['servicio', 'repuesto', 'material']),
    productoId: z.string().optional(),
    descripcion: z.string().min(1, 'Ingresá una descripción'),
    cantidad: z.coerce.number().min(0.01, 'Cantidad inválida'),
    precioUnitario: z.coerce.number().min(0, 'Precio inválido'),
  })
  .superRefine((data, ctx) => {
    if ((data.tipo === 'repuesto' || data.tipo === 'material') && !data.productoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Seleccioná un producto del inventario',
        path: ['productoId'],
      })
    }
  })

export type OtItemFormData = z.infer<typeof itemSchema>

interface OtItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTipo?: OtItemTipo
  item?: IOtItem
  ordenEstado: OrdenEstado
  onSubmit: (data: OtItemFormData) => Promise<void>
  isSubmitting?: boolean
}

export function OtItemFormModal({
  isOpen,
  onClose,
  defaultTipo = 'servicio',
  item,
  ordenEstado,
  onSubmit,
  isSubmitting,
}: OtItemFormModalProps) {
  const { data: productosData } = useProductos({ perPage: 200 })
  const stockReservadoActivo = (OT_ESTADOS_CON_RESERVA_STOCK as readonly OrdenEstado[]).includes(
    ordenEstado,
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<OtItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      tipo: defaultTipo,
      productoId: '',
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
    },
  })

  const tipo = watch('tipo')
  const productoId = watch('productoId')
  const cantidad = watch('cantidad')
  const requiereProducto = tipo === 'repuesto' || tipo === 'material'
  const productoSeleccionado = productosData?.data.find((p) => p.id === productoId)
  const { data: disponibilidad } = useStockDisponibilidad(
    requiereProducto && productoId ? productoId : undefined,
    item?.id,
  )

  const cantidadSolicitada = Math.ceil(Number(cantidad) || 0)
  const stockInsuficiente =
    requiereProducto &&
    Boolean(disponibilidad) &&
    cantidadSolicitada > (disponibilidad?.stockDisponible ?? 0)

  const prevProductoId = useRef<string | undefined>()

  useEffect(() => {
    if (!isOpen) return

    const initialProductoId = item?.productoId ?? ''
    prevProductoId.current = initialProductoId || undefined

    reset(
      item
        ? {
            tipo: item.tipo,
            productoId: item.productoId ?? '',
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          }
        : {
            tipo: defaultTipo,
            productoId: '',
            descripcion: '',
            cantidad: 1,
            precioUnitario: 0,
          },
    )
  }, [isOpen, item, defaultTipo, reset])

  useEffect(() => {
    if (!isOpen || !requiereProducto) {
      if (!requiereProducto) {
        setValue('productoId', '')
      }
      return
    }

    if (!productoId || !productoSeleccionado) return
    if (prevProductoId.current === productoId) return

    prevProductoId.current = productoId
    setValue('descripcion', productoSeleccionado.nombre)
    setValue('precioUnitario', Number(productoSeleccionado.precioVenta))
  }, [isOpen, productoId, productoSeleccionado, requiereProducto, setValue])

  const tipoOptions = Object.entries(OT_ITEM_TIPO_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const productoOptions = (productosData?.data ?? []).map((p) => ({
    value: p.id,
    label: `${p.codigo} — ${p.nombre} (stock: ${p.stockActual})`,
  }))

  const submit = async (data: OtItemFormData) => {
    if (requiereProducto && stockInsuficiente) {
      setError('root', {
        message: `Stock insuficiente. Disponible: ${disponibilidad?.stockDisponible ?? 0} unidades (considerando OTs activas).`,
      })
      return
    }

    try {
      await onSubmit({
        ...data,
        productoId: requiereProducto ? data.productoId : undefined,
      })
      onClose()
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'No se pudo guardar el ítem',
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Editar ítem' : 'Agregar ítem'}
      description="Servicio, repuesto o material incluido en la orden"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

        <Select
          label="Tipo"
          options={tipoOptions}
          error={errors.tipo?.message}
          {...register('tipo')}
        />

        {requiereProducto && (
          <>
            <Select
              label="Producto del inventario"
              options={productoOptions}
              placeholder="Seleccionar producto"
              error={errors.productoId?.message}
              value={productoId ?? ''}
              onChange={(e) => setValue('productoId', e.target.value)}
            />
            {disponibilidad && (
              <div className="space-y-1 text-xs text-slate-500">
                <p>
                  Stock disponible:{' '}
                  <span className={stockInsuficiente ? 'font-medium text-red-600' : 'font-medium text-slate-700'}>
                    {disponibilidad.stockDisponible} {productoSeleccionado?.unidadMedida ?? 'unidades'}
                  </span>
                  {(disponibilidad.stockReservado ?? disponibilidad.stockComprometido) > 0 && (
                    <span>
                      {' '}
                      ({disponibilidad.stockReservado ?? disponibilidad.stockComprometido} reservado en OTs)
                    </span>
                  )}
                </p>
                <p>
                  {stockReservadoActivo
                    ? 'El stock queda reservado para esta OT mientras esté en taller.'
                    : 'El stock se reservará al pasar la OT a taller.'}
                </p>
              </div>
            )}
            {stockInsuficiente && (
              <Alert variant="warning">
                La cantidad supera el stock disponible. Ajustá la cantidad o registrá un ingreso en inventario.
              </Alert>
            )}
          </>
        )}

        <Input
          label="Descripción"
          placeholder={requiereProducto ? 'Se completa desde el producto' : 'Ej: Conversión de regulador'}
          error={errors.descripcion?.message}
          {...register('descripcion')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Cantidad"
            type="number"
            step="0.01"
            error={errors.cantidad?.message}
            {...register('cantidad')}
          />
          <Input
            label="Precio unitario"
            type="number"
            step="0.01"
            error={errors.precioUnitario?.message}
            {...register('precioUnitario')}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {item ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { OT_ITEM_TIPO_LABELS }
