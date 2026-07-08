import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Car,
  Wrench,
  ClipboardList,
  AlertTriangle,
  Plus,
  Calendar,
} from 'lucide-react'
import { useCliente, useClienteFicha } from '@/hooks/useClientes'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import {
  CLIENTE_TIPO_LABELS,
  CONDICION_IVA_LABELS,
  DOCUMENTO_TIPO_LABELS,
  ORDEN_ESTADO_LABELS,
  formatCurrency,
  formatDate,
  formatDateOnly,
  formatDateTime,
  formatPatente,
  formatVehiculoMarcaModelo,
} from '@/utils/format'

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cliente, isLoading, error } = useCliente(id)
  const { data: ficha, isLoading: fichaLoading } = useClienteFicha(id)

  if (isLoading) return <PageLoader />

  if (error || !cliente) {
    return <Alert variant="error">No se pudo cargar el cliente.</Alert>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.CLIENTES}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.TURNO_NEW_FROM_CLIENTE(cliente.id))}
          >
            <Calendar className="h-4 w-4" />
            Agendar turno
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ORDEN_TRABAJO_NEW_FROM_CLIENTE(cliente.id))}
          >
            <ClipboardList className="h-4 w-4" />
            Nueva OT
          </Button>
          <Button onClick={() => navigate(ROUTES.CLIENTE_EDIT(cliente.id))}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title={cliente.razonSocial}
          description={`${CLIENTE_TIPO_LABELS[cliente.tipo]} · ${DOCUMENTO_TIPO_LABELS[cliente.documentoTipo]} ${cliente.documentoNumero}`}
          action={
            <Badge variant={cliente.isActive ? 'success' : 'neutral'}>
              {cliente.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          }
        />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{cliente.email ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Teléfono</dt>
              <dd className="mt-1 text-sm text-slate-900">{cliente.telefono ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Condición IVA</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {CONDICION_IVA_LABELS[cliente.condicionIva]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Alta</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(cliente.createdAt)}</dd>
            </div>
            {cliente.notas && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-slate-500">Notas</dt>
                <dd className="mt-1 text-sm text-slate-700">{cliente.notas}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Vehículos y equipos GNC"
          description="Parque activo del cliente con alertas regulatorias"
          action={
            <Link to={`${ROUTES.VEHICULO_NEW}?clienteId=${cliente.id}`}>
              <Button size="sm">
                <Car className="h-4 w-4" />
                Agregar vehículo
              </Button>
            </Link>
          }
        />
        <CardBody>
          {fichaLoading ? (
            <PageLoader />
          ) : (ficha?.vehiculos ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Sin vehículos registrados.</p>
          ) : (
            <div className="space-y-4">
              {(ficha?.vehiculos ?? []).map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatPatente(vehiculo.patente)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatVehiculoMarcaModelo(vehiculo)} · {vehiculo.anio}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            ROUTES.ORDEN_TRABAJO_NEW_FROM_CLIENTE(cliente.id, {
                              vehiculoId: vehiculo.id,
                            })
                          )
                        }
                      >
                        <ClipboardList className="h-4 w-4" />
                        Nueva OT
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.VEHICULO_EDIT(vehiculo.id))}
                      >
                        Ver vehículo
                      </Button>
                    </div>
                  </div>

                  {vehiculo.equipos.length === 0 ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-slate-200 bg-white px-3 py-2">
                      <p className="text-sm text-slate-500">Sin equipo GNC registrado</p>
                      <Link to={ROUTES.EQUIPO_GNC_NEW_FOR_VEHICULO(vehiculo.id)}>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                          Agregar equipo
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {vehiculo.equipos.map((equipo) => (
                        <li
                          key={equipo.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Wrench className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium">{equipo.numeroSerieEquipo}</span>
                            <Badge variant={equipo.estado === 'activo' ? 'success' : 'neutral'}>
                              {equipo.estado}
                            </Badge>
                            {equipo.obleaVencida && (
                              <Badge variant="danger">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Oblea vencida
                              </Badge>
                            )}
                            {equipo.phVencida && (
                              <Badge variant="danger">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                PH vencida
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  ROUTES.ORDEN_TRABAJO_NEW_FROM_CLIENTE(cliente.id, {
                                    vehiculoId: vehiculo.id,
                                    equipoGncId: equipo.id,
                                  })
                                )
                              }
                            >
                              Nueva OT
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(ROUTES.EQUIPO_GNC_EDIT(equipo.id))}
                            >
                              Ver equipo
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Turnos próximos"
          description="Agenda confirmada o pendiente del cliente"
        />
        <CardBody>
          {fichaLoading ? (
            <PageLoader />
          ) : (ficha?.turnosProximos ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Sin turnos programados.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {(ficha?.turnosProximos ?? []).map((turno) => (
                <li
                  key={turno.id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 py-2.5 hover:bg-slate-50"
                  onClick={() => navigate(ROUTES.TURNO_EDIT(turno.id))}
                >
                  <div>
                    <p className="font-medium text-slate-900">{formatDateTime(turno.fechaHora)}</p>
                    <p className="text-xs text-slate-500">
                      {[turno.tipoTrabajoNombre, turno.vehiculoPatente ? formatPatente(turno.vehiculoPatente) : null]
                        .filter(Boolean)
                        .join(' · ') || 'Sin detalle'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={turno.estado === 'confirmado' ? 'success' : 'warning'}>
                      {turno.estado}
                    </Badge>
                    {turno.ordenTrabajoId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(ROUTES.ORDEN_TRABAJO_DETAIL(turno.ordenTrabajoId!))
                        }}
                      >
                        OT {turno.ordenTrabajoNumero}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Facturas recientes" description="Últimos comprobantes del cliente" />
        <CardBody>
          {fichaLoading ? (
            <PageLoader />
          ) : (ficha?.facturasRecientes ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Sin facturas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Número</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 pr-4 font-medium">Cobro</th>
                    <th className="pb-2 pr-4 font-medium">Emisión</th>
                    <th className="pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(ficha?.facturasRecientes ?? []).map((factura) => (
                    <tr
                      key={factura.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(ROUTES.FACTURA_DETAIL(factura.id))}
                    >
                      <td className="py-2.5 pr-4 font-medium text-brand-700">{factura.numero}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={factura.estado === 'emitida' ? 'success' : 'neutral'}>
                          {factura.estado}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {factura.estadoCobro ?? '—'}
                        {factura.saldoPendiente != null && factura.saldoPendiente > 0 && (
                          <span className="ml-1 text-xs text-amber-600">
                            ({formatCurrency(factura.saldoPendiente)} pend.)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {formatDateOnly(factura.fechaEmision)}
                      </td>
                      <td className="py-2.5 text-slate-600">{formatCurrency(factura.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Órdenes de trabajo recientes"
          description="Últimas 15 OT del cliente"
        />
        <CardBody>
          {fichaLoading ? (
            <PageLoader />
          ) : (ficha?.ordenesRecientes ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Sin órdenes de trabajo registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Número</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 pr-4 font-medium">Tipo</th>
                    <th className="pb-2 pr-4 font-medium">Vehículo</th>
                    <th className="pb-2 pr-4 font-medium">Ingreso</th>
                    <th className="pb-2 pr-4 font-medium">Estimado</th>
                    <th className="pb-2 font-medium">Seña</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(ficha?.ordenesRecientes ?? []).map((orden) => (
                    <tr
                      key={orden.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(ROUTES.ORDEN_TRABAJO_DETAIL(orden.id))}
                    >
                      <td className="py-2.5 pr-4 font-medium text-brand-700">{orden.numero}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="neutral">{ORDEN_ESTADO_LABELS[orden.estado]}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {orden.tipoTrabajoNombre ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {orden.vehiculoPatente ? formatPatente(orden.vehiculoPatente) : '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {formatDateOnly(orden.fechaIngreso)}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {orden.totalEstimado != null
                          ? formatCurrency(orden.totalEstimado)
                          : '—'}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {orden.totalSena != null ? formatCurrency(orden.totalSena) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
