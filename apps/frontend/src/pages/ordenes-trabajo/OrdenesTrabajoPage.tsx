import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, LayoutGrid, User } from 'lucide-react'
import type { OrdenEstado, OrdenTrabajoFiltro } from '@gnc/shared-types'
import { useOrdenesTrabajo, useOrdenTrabajoMutations } from '@/hooks/useOrdenesTrabajo'
import { useMecanicos } from '@/hooks/useMecanicos'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_ROLES, ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { SinMecanicosAlert } from '@/components/ordenes-trabajo/SinMecanicosAlert'
import {
  formatDate,
  ORDEN_ESTADO_LABELS,
  ORDEN_PRIORIDAD_LABELS,
  ORDEN_COBRO_LABELS,
  getOrdenCobroBadgeVariant,
  formatCurrency,
  formatPercent,
  getMargenBadgeVariant,
} from '@/utils/format'
import type { IOrdenTrabajo, ITableColumn } from '@/types'

const ESTADO_OPTIONS = (Object.keys(ORDEN_ESTADO_LABELS) as OrdenEstado[]).map((value) => ({
  value,
  label: ORDEN_ESTADO_LABELS[value],
}))

export function OrdenesTrabajoPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const filtro = (searchParams.get('filtro') as OrdenTrabajoFiltro | null) ?? undefined
  const misParam = searchParams.get('mis') === '1'

  const { checkRole, user } = useAuth()
  const esMecanico = checkRole([ROLES.MECANICO])
  const puedeVerTodas = checkRole([ROLES.ADMINISTRADOR, ROLES.SUPERVISOR, ROLES.RECEPCION])
  const soloMisForzado = esMecanico && !puedeVerTodas
  const mis = misParam || soloMisForzado

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState(searchParams.get('estado') ?? '')
  const [mecanicoAsignadoId, setMecanicoAsignadoId] = useState(
    searchParams.get('mecanicoAsignadoId') ?? ''
  )
  const [fechaDesde, setFechaDesde] = useState(searchParams.get('fechaDesde') ?? '')
  const [fechaHasta, setFechaHasta] = useState(searchParams.get('fechaHasta') ?? '')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { mecanicos, hayMecanicos } = useMecanicos()
  const { remove } = useOrdenTrabajoMutations()
  const puedeVerMargen = checkRole(MODULE_ROLES.margenOt)

  useEffect(() => {
    setPage(1)
  }, [filtro, mis, estado, mecanicoAsignadoId, fechaDesde, fechaHasta, search])

  const listParams = useMemo(
    () => ({
      page,
      perPage: 10,
      search: search || undefined,
      filtro,
      estado: (estado || undefined) as OrdenEstado | undefined,
      mecanicoAsignadoId: mis ? undefined : mecanicoAsignadoId || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      mis: mis || undefined,
    }),
    [page, search, filtro, estado, mecanicoAsignadoId, fechaDesde, fechaHasta, mis]
  )

  const { data, isLoading, error } = useOrdenesTrabajo(listParams)

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const filtroLabel =
    filtro === 'activas'
      ? 'Órdenes activas'
      : filtro === 'hoy'
        ? 'Órdenes de hoy'
        : filtro === 'espera_repuesto'
          ? 'Esperando repuesto'
          : filtro === 'entregadas_mes'
            ? 'Entregadas este mes'
            : null

  const columns: ITableColumn<IOrdenTrabajo>[] = [
    { key: 'numero', header: 'N° OT' },
    {
      key: 'clienteNombre',
      header: 'Cliente',
      render: (item) => item.clienteNombre ?? '-',
    },
    {
      key: 'vehiculoPatente',
      header: 'Patente',
      render: (item) => item.vehiculoPatente ?? '-',
    },
    {
      key: 'tipoTrabajoNombre',
      header: 'Tipo trabajo',
      render: (item) => item.tipoTrabajoNombre ?? '-',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item) => (
        <Badge variant={getOrdenEstadoBadgeVariant(item.estado)}>
          {ORDEN_ESTADO_LABELS[item.estado]}
        </Badge>
      ),
    },
    {
      key: 'mecanicoNombre',
      header: 'Mecánico',
      render: (item) => item.mecanicoNombre ?? '—',
    },
    {
      key: 'resumenCobro',
      header: 'Cobro',
      render: (item) => {
        const resumen = item.resumenCobro
        if (!resumen || resumen.estado === 'no_aplica') {
          return <span className="text-sm text-slate-400">—</span>
        }
        return (
          <Badge variant={getOrdenCobroBadgeVariant(resumen.estado)}>
            {ORDEN_COBRO_LABELS[resumen.estado]}
          </Badge>
        )
      },
    },
    ...(puedeVerMargen
      ? [
          {
            key: 'resumenMargen',
            header: 'Margen',
            render: (item: IOrdenTrabajo) => {
              const resumen = item.resumenMargen
              if (!resumen || resumen.ingresoTotal <= 0) {
                return <span className="text-sm text-slate-400">—</span>
              }
              return (
                <div className="space-y-0.5">
                  <Badge variant={getMargenBadgeVariant(resumen.margenPorcentaje)}>
                    {formatPercent(resumen.margenPorcentaje)}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatCurrency(resumen.margenBruto)}</p>
                </div>
              )
            },
          } satisfies ITableColumn<IOrdenTrabajo>,
        ]
      : []),
    {
      key: 'prioridad',
      header: 'Prioridad',
      render: (item) => ORDEN_PRIORIDAD_LABELS[item.prioridad],
    },
    {
      key: 'fechaIngreso',
      header: 'Ingreso',
      render: (item) => formatDate(item.fechaIngreso),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.ORDEN_TRABAJO_DETAIL(item.id))}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {puedeVerTodas && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.ORDEN_TRABAJO_EDIT(item.id))}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    await remove.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const clearFilters = () => {
    setEstado('')
    setMecanicoAsignadoId('')
    setFechaDesde('')
    setFechaHasta('')
    const next = new URLSearchParams()
    if (misParam) next.set('mis', '1')
    setSearchParams(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {mis ? `Mis Órdenes${user?.fullName ? ` · ${user.fullName}` : ''}` : filtroLabel ?? 'Órdenes de Trabajo'}
          </h2>
          <p className="text-sm text-slate-500">
            {mis
              ? 'Órdenes asignadas a tu usuario'
              : filtroLabel
                ? 'Listado filtrado desde el dashboard'
                : 'Gestión de OT del taller GNC'}
          </p>
          {(filtroLabel || misParam) && puedeVerTodas && (
            <Link
              to={ROUTES.ORDENES_TRABAJO}
              className="mt-1 inline-block text-sm text-brand-600 hover:text-brand-700"
            >
              Ver todas las órdenes
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {esMecanico && puedeVerTodas && (
            <Link to={mis ? ROUTES.ORDENES_TRABAJO : ROUTES.ORDENES_TRABAJO_MIS}>
              <Button variant="outline">
                <User className="h-4 w-4" />
                {mis ? 'Ver todas' : 'Mis OT'}
              </Button>
            </Link>
          )}
          <Link to={mis ? ROUTES.ORDENES_TRABAJO_TABLERO_MIS : ROUTES.ORDENES_TRABAJO_TABLERO}>
            <Button variant="outline">
              <LayoutGrid className="h-4 w-4" />
              Tablero
            </Button>
          </Link>
          {puedeVerTodas && (
            <Link to={ROUTES.ORDEN_TRABAJO_NEW}>
              <Button>
                <Plus className="h-4 w-4" />
                Nueva OT
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && <Alert variant="error">Error al cargar órdenes de trabajo.</Alert>}
      {!hayMecanicos && puedeVerTodas && <SinMecanicosAlert />}

      <Card>
        <CardBody className="space-y-3 border-b border-slate-100">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Estado"
              options={ESTADO_OPTIONS}
              placeholder="Todos"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value)
                updateParam('estado', e.target.value)
              }}
            />
            {!mis && (
              <Select
                label="Mecánico"
                options={mecanicos.map((m) => ({ value: m.id, label: m.fullName }))}
                placeholder="Todos"
                value={mecanicoAsignadoId}
                onChange={(e) => {
                  setMecanicoAsignadoId(e.target.value)
                  updateParam('mecanicoAsignadoId', e.target.value)
                }}
              />
            )}
            <Input
              label="Desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value)
                updateParam('fechaDesde', e.target.value)
              }}
            />
            <Input
              label="Hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value)
                updateParam('fechaHasta', e.target.value)
              }}
            />
          </div>
          {(estado || mecanicoAsignadoId || fechaDesde || fechaHasta) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </CardBody>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Buscar por número, cliente, patente..."
        />
        <Table
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
        />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Eliminar orden de trabajo"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" isLoading={remove.isPending} onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
