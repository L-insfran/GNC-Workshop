import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import {
  getOrdenEstadosSiguientes,
  type IOrdenTrabajo,
  type OrdenEstado,
} from '@gnc/shared-types'
import { useOrdenTrabajoMutations } from '@/hooks/useOrdenesTrabajo'
import { useMecanicos } from '@/hooks/useMecanicos'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'
import { ORDEN_ESTADO_LABELS, ORDEN_PRIORIDAD_LABELS, formatPatente } from '@/utils/format'

interface BoardOtCardProps {
  orden: IOrdenTrabajo
}

export function BoardOtCard({ orden }: BoardOtCardProps) {
  const navigate = useNavigate()
  const { updateEstado } = useOrdenTrabajoMutations()
  const { mecanicos, hayMecanicos } = useMecanicos()
  const [nuevoEstado, setNuevoEstado] = useState<OrdenEstado | ''>('')
  const [mecanicoId, setMecanicoId] = useState(orden.mecanicoAsignadoId ?? '')
  const [error, setError] = useState<string | null>(null)

  const siguientes = getOrdenEstadosSiguientes(orden.estado).filter(
    (estado) => estado !== 'en_taller' || hayMecanicos
  )
  const requiereMecanico = nuevoEstado === 'en_taller'
  const mecanicoResuelto = mecanicoId || orden.mecanicoAsignadoId || ''

  const handleAvanzar = async (e: MouseEvent) => {
    e.stopPropagation()
    if (!nuevoEstado) return
    setError(null)

    if (requiereMecanico && !mecanicoResuelto) {
      setError('Seleccioná un mecánico.')
      return
    }

    try {
      await updateEstado.mutateAsync({
        id: orden.id,
        data: {
          estado: nuevoEstado,
          mecanicoAsignadoId: requiereMecanico ? mecanicoResuelto : undefined,
        },
      })
      setNuevoEstado('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar.')
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:border-brand-200 hover:shadow-md">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => navigate(ROUTES.ORDEN_TRABAJO_DETAIL(orden.id))}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{orden.numero}</p>
          <Eye className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </div>
        <p className="mt-1 truncate text-xs text-slate-600">{orden.clienteNombre ?? 'Sin cliente'}</p>
        <p className="mt-0.5 text-xs font-medium text-slate-800">
          {orden.vehiculoPatente ? formatPatente(orden.vehiculoPatente) : '—'}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
            {ORDEN_PRIORIDAD_LABELS[orden.prioridad]}
          </span>
          {orden.mecanicoNombre && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
              {orden.mecanicoNombre}
            </span>
          )}
        </div>
        {orden.tipoTrabajoNombre && (
          <p className="mt-1 truncate text-[11px] text-slate-500">{orden.tipoTrabajoNombre}</p>
        )}
      </button>

      {siguientes.length > 0 && (
        <div
          className="mt-3 space-y-2 border-t border-slate-100 pt-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {error && (
            <Alert variant="error" className="py-1.5 text-xs">
              {error}
            </Alert>
          )}
          <Select
            options={siguientes.map((estado) => ({
              value: estado,
              label: ORDEN_ESTADO_LABELS[estado],
            }))}
            placeholder="Avanzar a..."
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value as OrdenEstado)}
          />
          {requiereMecanico && (
            <Select
              options={mecanicos.map((m) => ({ value: m.id, label: m.fullName }))}
              placeholder="Mecánico"
              value={mecanicoResuelto}
              onChange={(e) => setMecanicoId(e.target.value)}
            />
          )}
          <Button
            size="sm"
            className="w-full"
            disabled={!nuevoEstado || (requiereMecanico && !mecanicoResuelto)}
            isLoading={updateEstado.isPending}
            onClick={handleAvanzar}
          >
            Actualizar
          </Button>
        </div>
      )}
    </div>
  )
}
