import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Pencil } from 'lucide-react'
import { useOrdenTrabajo, useOrdenTrabajoMutations } from '@/hooks/useOrdenesTrabajo'
import { useMecanicos } from '@/hooks/useMecanicos'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { SinMecanicosAlert } from '@/components/ordenes-trabajo/SinMecanicosAlert'
import { OtPresupuestoSection } from '@/components/ordenes-trabajo/OtPresupuestoSection'
import { OtControlCalidadSection } from '@/components/ordenes-trabajo/OtControlCalidadSection'
import { OtFacturacionSection } from '@/components/ordenes-trabajo/OtFacturacionSection'
import { OtSenaSection } from '@/components/ordenes-trabajo/OtSenaSection'
import { OtRegistrarSenaSection } from '@/components/ordenes-trabajo/OtRegistrarSenaSection'
import { OtHistorialEstadosSection } from '@/components/ordenes-trabajo/OtHistorialEstadosSection'
import { useOtControlCalidad } from '@/hooks/useOtControlCalidad'
import { ApiError } from '@/services/api-client'
import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
  ORDEN_COBRO_LABELS,
  ORDEN_ESTADO_LABELS,
  ORDEN_PRIORIDAD_LABELS,
  getOrdenCobroBadgeVariant,
} from '@/utils/format'
import { getOrdenEstadosSiguientes, type OrdenEstado } from '@gnc/shared-types'

export function OrdenTrabajoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: orden, isLoading, error } = useOrdenTrabajo(id)
  const { mecanicos, hayMecanicos } = useMecanicos()
  const { updateEstado } = useOrdenTrabajoMutations()
  const { data: controlCalidad } = useOtControlCalidad(
    id,
    orden?.estado === 'control_calidad',
  )
  const [nuevoEstado, setNuevoEstado] = useState<OrdenEstado | ''>('')
  const [mecanicoAsignadoId, setMecanicoAsignadoId] = useState('')
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

  const estadosSiguientes = getOrdenEstadosSiguientes(orden.estado)
  const requiereMecanico = nuevoEstado === 'en_taller'
  const mecanicoResuelto = mecanicoAsignadoId || orden.mecanicoAsignadoId || ''
  const estadoOptions = estadosSiguientes
    .filter((value) => value !== 'en_taller' || hayMecanicos)
    .map((value) => ({
      value,
      label: ORDEN_ESTADO_LABELS[value],
    }))
  const mecanicoOptions = mecanicos.map((user) => ({
    value: user.id,
    label: user.fullName,
  }))
  const puedePasarATaller =
    !requiereMecanico || (hayMecanicos && Boolean(mecanicoResuelto))
  const requiereChecklistAprobado =
    nuevoEstado === 'finalizada' && orden.estado === 'control_calidad'
  const puedeFinalizar = !requiereChecklistAprobado || Boolean(controlCalidad?.completo)
  const cobro = orden.resumenCobro
  const entregaBloqueadaPorCobro =
    nuevoEstado === 'entregada' &&
    (cobro?.estado === 'pendiente' || cobro?.estado === 'parcial' || cobro?.estado === 'borrador')
  const entregaSinFactura =
    nuevoEstado === 'entregada' &&
    (cobro?.estado === 'sin_factura' || cobro?.estado === 'con_sena' || cobro?.estado === 'anulada')

  const handleEstadoChange = async () => {
    if (!nuevoEstado || !id) return
    setEstadoError(null)

    if (nuevoEstado === 'en_taller' && !mecanicoResuelto) {
      setEstadoError('Debe seleccionar un mecánico para pasar la OT a taller.')
      return
    }

    if (nuevoEstado === 'finalizada' && orden.estado === 'control_calidad' && !controlCalidad?.completo) {
      setEstadoError('Completá y guardá el checklist de control de calidad antes de finalizar.')
      return
    }

    if (entregaBloqueadaPorCobro) {
      setEstadoError(
        cobro?.estado === 'borrador'
          ? 'Emití la factura y registrá el cobro antes de entregar el vehículo.'
          : 'Hay saldo pendiente de cobro. Registrá el cobro antes de entregar el vehículo.',
      )
      return
    }

    try {
      await updateEstado.mutateAsync({
        id,
        data: {
          estado: nuevoEstado,
          mecanicoAsignadoId: nuevoEstado === 'en_taller' ? mecanicoResuelto : undefined,
        },
      })
      setNuevoEstado('')
      setMecanicoAsignadoId('')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.'
      setEstadoError(message)
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

      {!hayMecanicos && <SinMecanicosAlert />}

      {orden.estado !== 'borrador' &&
        orden.estado !== 'recepcion' &&
        orden.estado !== 'cancelada' &&
        orden.estado !== 'entregada' &&
        !orden.mecanicoAsignadoId && (
          <Alert variant="warning">
            Esta orden está en taller sin mecánico asignado. Asignelo antes de continuar el trabajo.
          </Alert>
        )}

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
              <dt className="text-xs font-medium uppercase text-slate-500">Cliente</dt>
              <dd className="mt-1 text-sm">
                <Link
                  to={ROUTES.CLIENTE_DETAIL(orden.clienteId)}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  {orden.clienteNombre ?? 'Ver cliente'}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Vehículo</dt>
              <dd className="mt-1 text-sm">
                <Link
                  to={ROUTES.VEHICULO_DETAIL(orden.vehiculoId)}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  {vehiculoDescripcion || 'Ver vehículo'}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Tipo de trabajo</dt>
              <dd className="mt-1 text-sm text-slate-900">{orden.tipoTrabajoNombre ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Equipo GNC</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {orden.equipoGncId ? (
                  <Link
                    to={ROUTES.EQUIPO_GNC_DETAIL(orden.equipoGncId)}
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    {orden.equipoGncNumeroSerie}
                  </Link>
                ) : (
                  'Sin equipo'
                )}
              </dd>
            </div>
            {orden.turnoOrigen && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-slate-500">Turno de origen</dt>
                <dd className="mt-1 text-sm">
                  <Link
                    to={ROUTES.TURNO_EDIT(orden.turnoOrigen.id)}
                    className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(orden.turnoOrigen.fechaHora)}
                  </Link>
                </dd>
              </div>
            )}
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
                {orden.fechaEstimadaEntrega ? formatDateOnly(orden.fechaEstimadaEntrega) : '-'}
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

      <OtPresupuestoSection ordenTrabajoId={orden.id} ordenEstado={orden.estado} />

      <OtControlCalidadSection ordenTrabajoId={orden.id} ordenEstado={orden.estado} />

      <OtRegistrarSenaSection
        ordenId={orden.id}
        ordenNumero={orden.numero}
        ordenEstado={orden.estado}
      />

      {orden.resumenSena && (
        <OtSenaSection ordenNumero={orden.numero} resumenSena={orden.resumenSena} />
      )}

      <OtFacturacionSection
        ordenId={orden.id}
        ordenNumero={orden.numero}
        ordenEstado={orden.estado}
        resumenSena={orden.resumenSena}
      />

      {(orden.estado === 'finalizada' || orden.estado === 'entregada') && cobro && (
        <Card>
          <CardHeader title="Estado de cobro" description="Requisito para la entrega del vehículo" />
          <CardBody>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={getOrdenCobroBadgeVariant(cobro.estado)}>
                {ORDEN_COBRO_LABELS[cobro.estado]}
              </Badge>
              {cobro.facturaNumero && (
                <Link
                  to={ROUTES.FACTURA_DETAIL(cobro.facturaId!)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Factura {cobro.facturaNumero}
                </Link>
              )}
              {typeof cobro.saldoPendiente === 'number' && cobro.saldoPendiente > 0 && (
                <span className="text-sm text-slate-600">
                  Saldo: {formatCurrency(cobro.saldoPendiente)}
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Cambiar estado" description="Actualizar el flujo de la orden de trabajo" />
        <CardBody>
          {estadoOptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              Esta orden está en estado final y no admite más cambios.
            </p>
          ) : (
            <>
              {estadoError && (
                <Alert variant="error" className="mb-4">
                  {estadoError}
                </Alert>
              )}
              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Select
                      label="Nuevo estado"
                      options={estadoOptions}
                      placeholder="Seleccionar estado"
                      value={nuevoEstado}
                      onChange={(e) => {
                        const estado = e.target.value as OrdenEstado
                        setNuevoEstado(estado)
                        if (estado === 'en_taller') {
                          setMecanicoAsignadoId(orden.mecanicoAsignadoId ?? '')
                        } else {
                          setMecanicoAsignadoId('')
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleEstadoChange}
                    disabled={
                      !nuevoEstado ||
                      nuevoEstado === orden.estado ||
                      !puedePasarATaller ||
                      !puedeFinalizar ||
                      entregaBloqueadaPorCobro
                    }
                    isLoading={updateEstado.isPending}
                  >
                    Actualizar estado
                  </Button>
                </div>

                {requiereChecklistAprobado && !controlCalidad?.completo && (
                  <Alert variant="warning">
                    Guardá el checklist de control de calidad con todos los ítems marcados para
                    habilitar la finalización.
                  </Alert>
                )}

                {entregaBloqueadaPorCobro && (
                  <Alert variant="warning">
                    No se puede entregar el vehículo mientras haya factura en borrador o saldo
                    pendiente de cobro.
                    {cobro?.facturaId && (
                      <>
                        {' '}
                        <Link
                          to={ROUTES.FACTURA_DETAIL(cobro.facturaId)}
                          className="font-medium underline"
                        >
                          Ir a la factura
                        </Link>
                      </>
                    )}
                  </Alert>
                )}

                {entregaSinFactura && (
                  <Alert variant="info">
                    Esta OT no tiene factura emitida cobrada. Se permitirá la entrega, pero
                    recomendamos facturar el trabajo.
                  </Alert>
                )}

                {requiereMecanico && hayMecanicos && (
                  <div className="space-y-1.5">
                    <Select
                      label="Mecánico asignado"
                      options={mecanicoOptions}
                      placeholder="Seleccionar mecánico"
                      value={mecanicoResuelto}
                      onChange={(e) => setMecanicoAsignadoId(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Es obligatorio asignar un mecánico al pasar la OT a taller. Los repuestos del
                      presupuesto se reservarán automáticamente en inventario.
                    </p>
                  </div>
                )}
                {nuevoEstado === 'en_taller' && (
                  <Alert variant="info">
                    Al pasar a taller se reservará el stock de repuestos y materiales vinculados al
                    inventario. Si no hay stock suficiente, la transición será rechazada.
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <OtHistorialEstadosSection ordenTrabajoId={orden.id} />
    </div>
  )
}
