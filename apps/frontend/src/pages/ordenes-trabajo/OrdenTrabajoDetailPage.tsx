import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useOrdenTrabajo, useOrdenTrabajoMutations } from '@/hooks/useOrdenesTrabajo'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  ORDEN_ESTADO_LABELS,
  ORDEN_PRIORIDAD_LABELS,
} from '@/utils/format'
import type { OrdenEstado } from '@gnc/shared-types'

const estadoOptions = Object.entries(ORDEN_ESTADO_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function OrdenTrabajoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: orden, isLoading, error } = useOrdenTrabajo(id)
  const { updateEstado } = useOrdenTrabajoMutations()
  const [nuevoEstado, setNuevoEstado] = useState<OrdenEstado | ''>('')
  const [estadoError, setEstadoError] = useState<string | null>(null)

  if (isLoading) return <PageLoader />

  if (error || !orden) {
    return <Alert variant="error">No se pudo cargar la orden de trabajo.</Alert>
  }

  const vehiculoDescripcion = [
    orden.vehiculoPatente,
    [orden.vehiculoMarcaNombre, orden.vehiculoModeloNombre].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' · ')

  const handleEstadoChange = async () => {
    if (!nuevoEstado || !id) return
    setEstadoError(null)
    try {
      await updateEstado.mutateAsync({ id, data: { estado: nuevoEstado } })
      setNuevoEstado('')
    } catch {
      setEstadoError('No se pudo actualizar el estado.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.ORDENES_TRABAJO}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a órdenes
        </Link>
        <Button onClick={() => navigate(ROUTES.ORDEN_TRABAJO_EDIT(orden.id))}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader
          title={`OT ${orden.numero}`}
          description={`${orden.clienteNombre ?? '-'} · ${vehiculoDescripcion || '-'}`}
          action={
            <Badge variant={getOrdenEstadoBadgeVariant(orden.estado)}>
              {ORDEN_ESTADO_LABELS[orden.estado]}
            </Badge>
          }
        />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Tipo de trabajo</dt>
              <dd className="mt-1 text-sm text-slate-900">{orden.tipoTrabajoNombre ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Equipo GNC</dt>
              <dd className="mt-1 text-sm text-slate-900">{orden.equipoGncNumeroSerie ?? 'Sin equipo'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Prioridad</dt>
              <dd className="mt-1 text-sm text-slate-900">{ORDEN_PRIORIDAD_LABELS[orden.prioridad]}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Fecha ingreso</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDateTime(orden.fechaIngreso)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Entrega estimada</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {orden.fechaEstimadaEntrega ? formatDate(orden.fechaEstimadaEntrega) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Mecánico</dt>
              <dd className="mt-1 text-sm text-slate-900">{orden.mecanicoNombre ?? 'Sin asignar'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Kilometraje</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {orden.kilometrajeIngreso?.toLocaleString('es-AR') ?? '-'} km
              </dd>
            </div>
            {orden.totalEstimado !== undefined && (
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Total estimado</dt>
                <dd className="mt-1 text-sm text-slate-900">{formatCurrency(orden.totalEstimado)}</dd>
              </div>
            )}
            {orden.totalFinal !== undefined && (
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Total final</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(orden.totalFinal)}</dd>
              </div>
            )}
            {orden.descripcionProblema && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-slate-500">Descripción</dt>
                <dd className="mt-1 text-sm text-slate-700">{orden.descripcionProblema}</dd>
              </div>
            )}
            {orden.observacionesInternas && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-slate-500">Observaciones internas</dt>
                <dd className="mt-1 text-sm text-slate-700">{orden.observacionesInternas}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cambiar estado" description="Actualizar el flujo de la orden de trabajo" />
        <CardBody>
          {estadoError && (
            <Alert variant="error" className="mb-4">
              {estadoError}
            </Alert>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                label="Nuevo estado"
                options={estadoOptions}
                placeholder="Seleccionar estado"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as OrdenEstado)}
              />
            </div>
            <Button
              onClick={handleEstadoChange}
              disabled={!nuevoEstado || nuevoEstado === orden.estado}
              isLoading={updateEstado.isPending}
            >
              Actualizar estado
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
