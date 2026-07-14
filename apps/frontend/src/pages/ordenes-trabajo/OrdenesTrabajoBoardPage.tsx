import { Link, useSearchParams } from 'react-router-dom'
import { List, User } from 'lucide-react'
import type { OrdenEstado } from '@gnc/shared-types'
import { useOrdenesTrabajo } from '@/hooks/useOrdenesTrabajo'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { BoardOtCard } from '@/components/ordenes-trabajo/BoardOtCard'
import { ORDEN_ESTADO_LABELS } from '@/utils/format'
import type { IOrdenTrabajo } from '@gnc/shared-types'

const COLUMNAS: OrdenEstado[] = [
  'recepcion',
  'en_taller',
  'en_espera_repuesto',
  'control_calidad',
  'finalizada',
]

export function OrdenesTrabajoBoardPage() {
  const [searchParams] = useSearchParams()
  const mis = searchParams.get('mis') === '1'
  const { checkRole, user } = useAuth()
  const esMecanico = checkRole([ROLES.MECANICO])
  const puedeVerTodas = checkRole([ROLES.ADMINISTRADOR, ROLES.SUPERVISOR, ROLES.RECEPCION])
  const soloMis = mis || (esMecanico && !puedeVerTodas)

  const { data, isLoading, error } = useOrdenesTrabajo({
    perPage: 100,
    filtro: 'activas',
    mis: soloMis || undefined,
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
          <h2 className="text-xl font-semibold text-slate-900">
            {soloMis ? 'Mis órdenes — Tablero' : 'Tablero de taller'}
          </h2>
          <p className="text-sm text-slate-500">
            {soloMis
              ? `Órdenes asignadas a ${user?.fullName ?? 'vos'}`
              : 'Vista operativa de órdenes activas por estado'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {esMecanico && puedeVerTodas && (
            <Link to={soloMis ? ROUTES.ORDENES_TRABAJO_TABLERO : ROUTES.ORDENES_TRABAJO_TABLERO_MIS}>
              <Button variant="outline">
                <User className="h-4 w-4" />
                {soloMis ? 'Ver todas' : 'Mis OT'}
              </Button>
            </Link>
          )}
          <Link to={soloMis ? ROUTES.ORDENES_TRABAJO_MIS : ROUTES.ORDENES_TRABAJO}>
            <Button variant="outline">
              <List className="h-4 w-4" />
              Vista listado
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNAS.map((estado) => (
          <div
            key={estado}
            className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
              <Badge variant={getOrdenEstadoBadgeVariant(estado)}>
                {ORDEN_ESTADO_LABELS[estado]}
              </Badge>
              <span className="text-xs font-medium text-slate-500">
                {porEstado[estado].length}
              </span>
            </div>
            <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-2 overflow-y-auto p-2">
              {porEstado[estado].length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-slate-400">Sin órdenes</p>
              ) : (
                porEstado[estado].map((ot) => <BoardOtCard key={ot.id} orden={ot} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
