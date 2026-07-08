import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  ClipboardList,
  Gauge,
  Plus,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { useVehiculoFicha } from '@/hooks/useVehiculos'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import {
  ORDEN_ESTADO_LABELS,
  formatCurrency,
  formatDateOnly,
  formatPatente,
  formatVehiculoMarcaModelo,
} from '@/utils/format'

export function VehiculoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ficha, isLoading, error } = useVehiculoFicha(id)

  if (isLoading) return <PageLoader />

  if (error || !ficha) {
    return <Alert variant="error">No se pudo cargar el vehículo.</Alert>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.VEHICULOS}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a vehículos
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(ROUTES.ORDEN_TRABAJO_NEW_FROM_VEHICULO(ficha.clienteId, ficha.id))
            }
          >
            <ClipboardList className="h-4 w-4" />
            Nueva OT
          </Button>
          <Button onClick={() => navigate(ROUTES.VEHICULO_EDIT(ficha.id))}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title={formatPatente(ficha.patente)}
          description={`${formatVehiculoMarcaModelo(ficha)} · ${ficha.anio}`}
          action={
            <Badge variant={ficha.isActive ? 'success' : 'neutral'}>
              {ficha.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          }
        />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Cliente</dt>
              <dd className="mt-1 text-sm">
                <Link
                  to={ROUTES.CLIENTE_DETAIL(ficha.clienteId)}
                  className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
                >
                  <Users className="h-4 w-4" />
                  {ficha.clienteNombre}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Combustible</dt>
              <dd className="mt-1 text-sm text-slate-900">{ficha.tipoCombustible.toUpperCase()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Kilometraje</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {ficha.kilometraje?.toLocaleString('es-AR') ?? '—'} km
              </dd>
            </div>
            {ficha.color && (
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Color</dt>
                <dd className="mt-1 text-sm text-slate-900">{ficha.color}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Equipos GNC"
          description="Equipos instalados en este vehículo"
          action={
            <Link to={ROUTES.EQUIPO_GNC_NEW_FOR_VEHICULO(ficha.id)}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Agregar equipo
              </Button>
            </Link>
          }
        />
        <CardBody>
          {ficha.equipos.length === 0 ? (
            <p className="text-sm text-slate-500">Sin equipos GNC registrados.</p>
          ) : (
            <ul className="space-y-2">
              {ficha.equipos.map((equipo) => (
                <li
                  key={equipo.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Gauge className="h-4 w-4 text-slate-400" />
                    <button
                      type="button"
                      className="text-sm font-medium text-brand-700 hover:underline"
                      onClick={() => navigate(ROUTES.EQUIPO_GNC_DETAIL(equipo.id))}
                    >
                      {equipo.numeroSerieEquipo}
                    </button>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        ROUTES.ORDEN_TRABAJO_NEW_FROM_VEHICULO(ficha.clienteId, ficha.id, equipo.id)
                      )
                    }
                  >
                    Nueva OT
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Órdenes de trabajo" description="Historial reciente del vehículo" />
        <CardBody>
          {ficha.ordenesRecientes.length === 0 ? (
            <p className="text-sm text-slate-500">Sin órdenes de trabajo registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Número</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 pr-4 font-medium">Tipo</th>
                    <th className="pb-2 pr-4 font-medium">Equipo</th>
                    <th className="pb-2 pr-4 font-medium">Ingreso</th>
                    <th className="pb-2 font-medium">Seña</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ficha.ordenesRecientes.map((orden) => (
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
                        {orden.equipoGncNumeroSerie ?? '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {formatDateOnly(orden.fechaIngreso)}
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
