import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency } from '@/utils/format'
import { ApiError } from '@/services/api-client'

const schema = z.object({
  monto: z.coerce.number().min(0.01, 'Ingresá un monto válido'),
})

type CobroForm = z.infer<typeof schema>

interface RegistrarCobroModalProps {
  isOpen: boolean
  onClose: () => void
  facturaNumero: string
  saldoPendiente: number
  onConfirm: (monto: number) => Promise<void>
  isSubmitting?: boolean
}

export function RegistrarCobroModal({
  isOpen,
  onClose,
  facturaNumero,
  saldoPendiente,
  onConfirm,
  isSubmitting,
}: RegistrarCobroModalProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CobroForm>({
    resolver: zodResolver(schema),
    defaultValues: { monto: saldoPendiente },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ monto: saldoPendiente })
      setError(null)
    }
  }, [isOpen, saldoPendiente, reset])

  const submit = async (data: CobroForm) => {
    setError(null)
    try {
      await onConfirm(data.monto)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el cobro.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar cobro en caja"
      description={`Factura ${facturaNumero}. Saldo pendiente: ${formatCurrency(saldoPendiente)}`}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <Input
          label="Monto a cobrar"
          type="number"
          step="0.01"
          error={errors.monto?.message}
          {...register('monto')}
        />
        <p className="text-xs text-slate-500">
          Podés registrar una seña o el total. El saldo restante quedará pendiente hasta el próximo
          cobro.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Confirmar cobro
          </Button>
        </div>
      </form>
    </Modal>
  )
}
