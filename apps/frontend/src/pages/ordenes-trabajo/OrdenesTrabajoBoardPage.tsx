import { Link, useNavigate } from 'react-router-dom'
import { List, Eye } from 'lucide-react'
import type { IOrdenTrabajo, OrdenEstado } from '@gnc/shared-types'
import { useOrdenesTrabajo } from '@/hooks/useOrdenesTrabajo'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ORDEN_ESTADO_LABELS, ORDEN_PRIORIDAD_LABELS, formatPatente } from '@/utils/format'

const COLUMNAS: OrdenEstado[] = [
  'recepcion',
  'en_taller',
  'en_espera_repuesto',
  'control_calidad',
  'finalizada',
]

export function OrdenesTrabajoBoardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useOrdenesTrabajo({
    perPage: 100,
    filtro: 'activas',
  })

  if (isLoading) return <PageLoader />

  if (error) {
    return <Alert variant="error">Error al cargar el tablero de taller.</Alert>
  }

  const ordenes = data?.data ?? []
  const porEstado = COLUMNAS.reduce(
    (acc, estado) => {
      acc[estado] = ordenes.filter((ot) => ot.estado === estado)
      return acc
    },
    {} as Record<OrdenEstado, IOrdenTrabajo[]>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tablero de taller</h2>
          <p className="text-sm text-slate-500">Vista operativa de órdenes activas por estado</p>
        </div>
        <Link to={ROUTES.ORDENES_TRABAJO}>
          <Button variant="outline">
            <List className="h-4 w-4" />
            Vista listado
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNAS.map((estado) => (
          <div
            key={estado}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Badge variant={getOrdenEstadoBadgeVariant(estado)}>
                  {ORDEN_ESTADO_LABELS[estado]}
                </Badge>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {porEstado[estado].length}
              </span>
            </div>
            <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-2 overflow-y-auto p-2">
              {porEstado[estado].length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-slate-400">Sin órdenes</p>
              ) : (
                porEstado[estado].map((ot) => (
                  <button
                    key={ot.id}
                    type="button"
                    onClick={() => navigate(ROUTES.ORDEN_TRABAJO_DETAIL(ot.id))}
                    className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{ot.numero}</p>
                      <Eye className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {ot.clienteNombre ?? 'Sin cliente'}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-800">
                      {ot.vehiculoPatente ? formatPatente(ot.vehiculoPatente) : '—'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {ORDEN_PRIORIDAD_LABELS[ot.prioridad]}
                      </span>
                      {ot.mecanicoNombre && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {ot.mecanicoNombre}
                        </span>
                      )}
                    </div>
                    {ot.tipoTrabajoNombre && (
                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {ot.tipoTrabajoNombre}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
