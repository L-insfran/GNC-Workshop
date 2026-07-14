import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  ClipboardList,
  AlertTriangle,
  Car,
  Users,
  Calendar,
  ShieldAlert,
  Droplets,
} from 'lucide-react'
import { esRenovacionOblea, esPruebaHidraulica } from '@gnc/shared-types'
import { useEquipoGncFicha } from '@/hooks/useEquiposGnc'
import { useTiposTrabajo } from '@/hooks/useOrdenesTrabajo'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import {
  ORDEN_ESTADO_LABELS,
  formatCurrency,
  formatDate,
  formatDateOnly,
  formatPatente,
} from '@/utils/format'

const estadoEquipoLabels: Record<string, string> = {
  activo: 'Activo',
  vencido: 'Vencido',
  desinstalado: 'Desinstalado',
  en_revision: 'En revisión',
}

export function EquipoGncDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ficha, isLoading, error } = useEquipoGncFicha(id)
  const { data: tiposTrabajo } = useTiposTrabajo()

  if (isLoading) return <PageLoader />

  if (error || !ficha) {
    return <Alert variant="error">No se pudo cargar el equipo GNC.</Alert>
  }

  const tipoOblea = (tiposTrabajo ?? []).find((t) => esRenovacionOblea(t.nombre))
  const tipoPh = (tiposTrabajo ?? []).find((t) => esPruebaHidraulica(t.nombre))

  const nuevaOtConTipo = (tipoTrabajoId?: string) =>
    navigate(
      ROUTES.ORDEN_TRABAJO_NEW_FROM_VEHICULO(ficha.clienteId, ficha.vehiculoId, {
        equipoGncId: ficha.id,
        tipoTrabajoId,
      })
    )

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={ROUTES.EQUIPOS_GNC}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a equipos
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                ROUTES.TURNO_NEW_FROM_CLIENTE(ficha.clienteId, {
                  vehiculoId: ficha.vehiculoId,
                })
              )
            }
          >
            <Calendar className="h-4 w-4" />
            Agendar turno
          </Button>
          <Button variant="outline" onClick={() => nuevaOtConTipo()}>
            <ClipboardList className="h-4 w-4" />
            Nueva OT
          </Button>
          <Button onClick={() => navigate(ROUTES.EQUIPO_GNC_EDIT(ficha.id))}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {(ficha.obleaVencida || ficha.phVencida) && (
        <Alert variant="warning" title="Alertas regulatorias">
          <div className="space-y-3">
            <p>
              {ficha.obleaVencida && 'Oblea GNC vencida. '}
              {ficha.phVencida && 'Hay cilindros con PH vencida.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {ficha.obleaVencida && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!tipoOblea}
                  onClick={() => nuevaOtConTipo(tipoOblea?.id)}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Renovar oblea
                </Button>
              )}
              {ficha.phVencida && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!tipoPh}
                  onClick={() => nuevaOtConTipo(tipoPh?.id)}
                >
                  <Droplets className="h-4 w-4" />
                  Prueba hidráulica
                </Button>
              )}
            </div>
            {((ficha.obleaVencida && !tipoOblea) || (ficha.phVencida && !tipoPh)) && (
              <p className="text-xs text-slate-500">
                Configurá los tipos de trabajo “Renovación de oblea” / “Prueba hidráulica” para
                habilitar la precarga automática.
              </p>
            )}
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader
          title={`Equipo ${ficha.numeroSerieEquipo}`}
          description={`${ficha.marcaRegulador} ${ficha.modeloRegulador}`}
          action={
            <Badge variant={ficha.estado === 'activo' ? 'success' : 'warning'}>
              {estadoEquipoLabels[ficha.estado] ?? ficha.estado}
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
              <dt className="text-xs font-medium uppercase text-slate-500">Vehículo</dt>
              <dd className="mt-1 text-sm">
                <Link
                  to={ROUTES.VEHICULO_DETAIL(ficha.vehiculoId)}
                  className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
                >
                  <Car className="h-4 w-4" />
                  {formatPatente(ficha.vehiculoPatente)}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Instalación</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(ficha.fechaInstalacion)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Vencimiento oblea</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-slate-900">
                {formatDate(ficha.fechaVencimientoOblea)}
                {ficha.obleaVencida && (
                  <Badge variant="danger">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Vencida
                  </Badge>
                )}
              </dd>
            </div>
            {ficha.certificadorCrpc && (
              <div>
                <dt className="text-xs font-medium uppercase text-slate-500">Certificador CRPC</dt>
                <dd className="mt-1 text-sm text-slate-900">{ficha.certificadorCrpc}</dd>
              </div>
            )}
            {ficha.notas && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-slate-500">Notas</dt>
                <dd className="mt-1 text-sm text-slate-700">{ficha.notas}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cilindros" description="Estado regulatorio de cada cilindro" />
        <CardBody>
          {ficha.cilindros.length === 0 ? (
            <p className="text-sm text-slate-500">Sin cilindros registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="pb-2 pr-4 font-medium">N° serie</th>
                    <th className="pb-2 pr-4 font-medium">Marca</th>
                    <th className="pb-2 pr-4 font-medium">Capacidad</th>
                    <th className="pb-2 pr-4 font-medium">Última PH</th>
                    <th className="pb-2 pr-4 font-medium">Vence PH</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ficha.cilindros.map((cilindro) => (
                    <tr key={cilindro.id}>
                      <td className="py-2.5 pr-4 font-medium">{cilindro.numeroSerie}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{cilindro.marca}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{cilindro.capacidadM3} m³</td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {formatDate(cilindro.fechaUltimaPh)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-slate-600">{formatDate(cilindro.fechaVencimientoPh)}</span>
                        {cilindro.phVencida && (
                          <Badge variant="danger" className="ml-2">
                            Vencida
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={cilindro.estado === 'activo' ? 'success' : 'neutral'}>
                          {cilindro.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Órdenes de trabajo" description="Historial del equipo GNC" />
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
                    <th className="pb-2 pr-4 font-medium">Ingreso</th>
                    <th className="pb-2 font-medium">Estimado</th>
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
                        {formatDateOnly(orden.fechaIngreso)}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {orden.totalEstimado != null ? formatCurrency(orden.totalEstimado) : '—'}
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
