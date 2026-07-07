import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useOrdenesTrabajo, useOrdenTrabajoMutations } from '@/hooks/useOrdenesTrabajo'
import { useMecanicos } from '@/hooks/useMecanicos'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { SinMecanicosAlert } from '@/components/ordenes-trabajo/SinMecanicosAlert'
import { formatDate, ORDEN_ESTADO_LABELS, ORDEN_PRIORIDAD_LABELS, ORDEN_COBRO_LABELS, getOrdenCobroBadgeVariant, formatCurrency, formatPercent, getMargenBadgeVariant } from '@/utils/format'
import type { IOrdenTrabajo, ITableColumn } from '@/types'

export function OrdenesTrabajoPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useOrdenesTrabajo({ page, perPage: 10, search: search || undefined })
  const { hayMecanicos } = useMecanicos()
  const { remove } = useOrdenTrabajoMutations()
  const { checkRole } = useAuth()
  const puedeVerMargen = checkRole(MODULE_ROLES.margenOt)

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
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ORDEN_TRABAJO_DETAIL(item.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ORDEN_TRABAJO_EDIT(item.id))}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    await remove.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Órdenes de Trabajo</h2>
          <p className="text-sm text-slate-500">Gestión de OT del taller GNC</p>
        </div>
        <Link to={ROUTES.ORDEN_TRABAJO_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Nueva OT
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error">Error al cargar órdenes de trabajo.</Alert>}
      {!hayMecanicos && <SinMecanicosAlert />}

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Buscar por número, cliente, patente..."
        />
        <Table columns={columns} data={data?.data ?? []} isLoading={isLoading} keyExtractor={(item) => item.id} />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Eliminar orden de trabajo">
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
