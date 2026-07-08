import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { IKitTrabajoItem, OtItemTipo } from '@gnc/shared-types'
import { useProductos } from '@/hooks/useInventario'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

const KIT_ITEM_TIPO_LABELS: Record<OtItemTipo, string> = {
  servicio: 'Servicio',
  repuesto: 'Repuesto',
  material: 'Material',
}

const kitItemSchema = z
  .object({
    tipo: z.enum(['servicio', 'repuesto', 'material']),
    productoId: z.string().optional(),
    descripcion: z.string().min(1, 'Ingresá una descripción'),
    cantidad: z.coerce.number().min(0.01, 'Cantidad inválida'),
    precioUnitario: z.coerce.number().min(0).optional(),
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

export type KitItemFormData = z.infer<typeof kitItemSchema>

interface KitItemModalProps {
  isOpen: boolean
  onClose: () => void
  item?: IKitTrabajoItem
  defaultTipo?: OtItemTipo
  onSubmit: (data: KitItemFormData) => Promise<void>
  isSubmitting?: boolean
}

export function KitItemModal({
  isOpen,
  onClose,
  item,
  defaultTipo = 'servicio',
  onSubmit,
  isSubmitting,
}: KitItemModalProps) {
  const { data: productosData } = useProductos({ perPage: 200 })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<KitItemFormData>({
    resolver: zodResolver(kitItemSchema),
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
  const requiereProducto = tipo === 'repuesto' || tipo === 'material'
  const productoSeleccionado = productosData?.data.find((p) => p.id === productoId)
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
            precioUnitario: item.precioUnitario ?? 0,
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
      if (!requiereProducto) setValue('productoId', '')
      return
    }

    if (!productoId || !productoSeleccionado) return
    if (prevProductoId.current === productoId) return

    prevProductoId.current = productoId
    setValue('descripcion', productoSeleccionado.nombre)
    setValue('precioUnitario', Number(productoSeleccionado.precioVenta))
  }, [isOpen, productoId, productoSeleccionado, requiereProducto, setValue])

  const submit = async (data: KitItemFormData) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'No se pudo guardar el ítem del kit.',
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Editar ítem del kit' : 'Nuevo ítem del kit'}
      description="Se precargará en el presupuesto al crear una OT de este tipo"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

        <Select
          label="Tipo"
          options={Object.entries(KIT_ITEM_TIPO_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.tipo?.message}
          {...register('tipo')}
        />

        {requiereProducto && (
          <Select
            label="Producto"
            options={(productosData?.data ?? []).map((p) => ({
              value: p.id,
              label: `${p.codigo} — ${p.nombre}`,
            }))}
            placeholder="Seleccionar producto"
            error={errors.productoId?.message}
            {...register('productoId')}
          />
        )}

        <Input
          label="Descripción"
          error={errors.descripcion?.message}
          {...register('descripcion')}
        />
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {item ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { KIT_ITEM_TIPO_LABELS }
