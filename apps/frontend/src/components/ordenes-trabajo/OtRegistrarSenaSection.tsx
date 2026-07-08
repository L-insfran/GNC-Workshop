import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { OrdenEstado } from '@gnc/shared-types'
import { useOrdenTrabajoMutations } from '@/hooks/useOrdenesTrabajo'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_ROLES } from '@/constants/roles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

interface OtRegistrarSenaSectionProps {
  ordenId: string
  ordenNumero: string
  ordenEstado: OrdenEstado
}

const ESTADOS_SIN_SENA = new Set<OrdenEstado>(['cancelada', 'entregada'])

export function OtRegistrarSenaSection({
  ordenId,
  ordenNumero,
  ordenEstado,
}: OtRegistrarSenaSectionProps) {
  const { checkRole } = useAuth()
  const { registrarSena } = useOrdenTrabajoMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [monto, setMonto] = useState('')
  const [error, setError] = useState<string | null>(null)

  const puedeRegistrar = checkRole(MODULE_ROLES.caja) && !ESTADOS_SIN_SENA.has(ordenEstado)

  if (!puedeRegistrar) return null

  const handleConfirm = async () => {
    setError(null)
    const valor = Number(monto)
    if (!valor || valor <= 0) {
      setError('Ingresá un monto válido mayor a cero.')
      return
    }

    try {
      await registrarSena.mutateAsync({ id: ordenId, data: { monto: valor } })
      setModalOpen(false)
      setMonto('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la seña.')
    }
  }

  return (
    <>
      <Alert variant="info" title="Registrar seña">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Podés cobrar un adelanto para la OT {ordenNumero}. El monto se registrará en caja y se
            descontará al facturar.
          </p>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Registrar seña
          </Button>
        </div>
      </Alert>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setError(null)
        }}
        title={`Seña OT ${ordenNumero}`}
        description="El ingreso quedará vinculado a esta orden de trabajo."
      >
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Monto"
            type="number"
            step="0.01"
            min="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} isLoading={registrarSena.isPending}>
              Registrar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
