import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { IOtItem, OtItemTipo } from '@gnc/shared-types'
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

const itemSchema = z.object({
  tipo: z.enum(['servicio', 'repuesto', 'material']),
  descripcion: z.string().min(1, 'Ingresá una descripción'),
  cantidad: z.coerce.number().min(0.01, 'Cantidad inválida'),
  precioUnitario: z.coerce.number().min(0, 'Precio inválido'),
})

type ItemForm = z.infer<typeof itemSchema>

interface OtItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTipo?: OtItemTipo
  item?: IOtItem
  onSubmit: (data: ItemForm) => Promise<void>
  isSubmitting?: boolean
}

export function OtItemFormModal({
  isOpen,
  onClose,
  defaultTipo = 'servicio',
  item,
  onSubmit,
  isSubmitting,
}: OtItemFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      tipo: defaultTipo,
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
    },
  })

  useEffect(() => {
    if (!isOpen) return

    reset(
      item
        ? {
            tipo: item.tipo,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          }
        : {
            tipo: defaultTipo,
            descripcion: '',
            cantidad: 1,
            precioUnitario: 0,
          },
    )
  }, [isOpen, item, defaultTipo, reset])

  const tipoOptions = Object.entries(OT_ITEM_TIPO_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const submit = async (data: ItemForm) => {
    try {
      await onSubmit(data)
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

        <Input
          label="Descripción"
          placeholder="Ej: Conversión de regulador"
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
