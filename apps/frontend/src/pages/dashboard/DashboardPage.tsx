import { Link } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  AlertTriangle,
  Users,
  DollarSign,
  Wrench,
  Package,
  PauseCircle,
  LayoutGrid,
  Bell,
  Mail,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { IAlertaOperativa, IVencimientoAlerta } from '@gnc/shared-types'
import {
  useDashboardKpis,
  useDashboardProduccion,
  useDashboardVencimientos,
  useDashboardAlertasOperativas,
  useDashboardPendientesNotificar,
} from '@/hooks/useDashboard'
import { useOrdenesTrabajo } from '@/hooks/useOrdenesTrabajo'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge, getOrdenEstadoBadgeVariant, getVencimientoBadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import {
  formatCurrency,
  formatDateOnly,
  formatPatente,
  ORDEN_ESTADO_LABELS,
} from '@/utils/format'

function vencimientoLink(alerta: IVencimientoAlerta): string {
  return ROUTES.EQUIPO_GNC_DETAIL(alerta.equipoGncId)
}

function getAlertaOperativaBadgeVariant(nivel: IAlertaOperativa['nivel']) {
  return getVencimientoBadgeVariant(nivel)
}

function alertaOperativaLink(alerta: IAlertaOperativa): string {
  if (alerta.tipo === 'stock_bajo') {
    return ROUTES.PRODUCTO_DETAIL(alerta.entidadId)
  }
  return ROUTES.ORDEN_TRABAJO_DETAIL(alerta.entidadId)
}

export function DashboardPage() {
  const { checkRole, user } = useAuth()
  const esMecanico = checkRole([ROLES.MECANICO])
  const esOperativoAmpliado = checkRole([
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
    ROLES.CAJA,
    ROLES.DEPOSITO,
  ])
  const soloVistaMecanico = esMecanico && !esOperativoAmpliado

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useDashboardKpis()
  const { data: vencimientos, isLoading: vencLoading } = useDashboardVencimientos()
  const { data: alertasOperativas, isLoading: alertasLoading } = useDashboardAlertasOperativas()
  const { data: produccion, isLoading: prodLoading } = useDashboardProduccion(7)
  const { data: pendientesNotificar, isLoading: pendientesLoading } =
    useDashboardPendientesNotificar(!soloVistaMecanico)
  const { data: misOrdenes, isLoading: misOtLoading } = useOrdenesTrabajo(
    { perPage: 8, filtro: 'activas', mis: true },
    { enabled: esMecanico }
  )

  if (kpisLoading) return <PageLoader />

  if (kpisError || !kpis) {
    return (
      <Alert variant="error" title="Error al cargar dashboard">
        No se pudieron obtener los indicadores del taller.
      </Alert>
    )
  }

  const chartData = (produccion ?? []).map((item) => ({
    fecha: formatDateOnly(item.fecha),
    Completadas: item.ordenesCompletadas,
    Ingresadas: item.ordenesIngresadas,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {soloVistaMecanico ? `Hola, ${user?.fullName?.split(' ')[0] ?? 'mecánico'}` : 'Panel de control'}
        </h2>
        <p className="text-sm text-slate-500">
          {soloVistaMecanico
            ? 'Tus órdenes asignadas y el estado del taller'
            : 'Resumen operativo del taller GNC'}
        </p>
      </div>

      {esMecanico && (
        <Card>
          <CardHeader
            title="Mis órdenes activas"
            description="Trabajos asignados a tu usuario"
            action={
              <div className="flex flex-wrap gap-2">
                <Link to={ROUTES.ORDENES_TRABAJO_MIS}>
                  <Button size="sm" variant="outline">
                    <ClipboardList className="h-4 w-4" />
                    Listado
                  </Button>
                </Link>
                <Link to={ROUTES.ORDENES_TRABAJO_TABLERO_MIS}>
                  <Button size="sm" variant="outline">
                    <LayoutGrid className="h-4 w-4" />
                    Tablero
                  </Button>
                </Link>
              </div>
            }
          />
          <CardBody className="space-y-2">
            {misOtLoading ? (
              <PageLoader />
            ) : (misOrdenes?.data ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No tenés órdenes activas asignadas
              </p>
            ) : (
              (misOrdenes?.data ?? []).map((ot) => (
                <Link
                  key={ot.id}
                  to={ROUTES.ORDEN_TRABAJO_DETAIL(ot.id)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-brand-200 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {ot.numero} · {ot.clienteNombre ?? 'Cliente'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ot.vehiculoPatente ? formatPatente(ot.vehiculoPatente) : '—'}
                      {ot.tipoTrabajoNombre ? ` · ${ot.tipoTrabajoNombre}` : ''}
                    </p>
                  </div>
                  <Badge variant={getOrdenEstadoBadgeVariant(ot.estado)}>
                    {ORDEN_ESTADO_LABELS[ot.estado]}
                  </Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {!soloVistaMecanico && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Órdenes activas"
              value={kpis.ordenesActivas}
              icon={ClipboardList}
              to={ROUTES.ORDENES_TRABAJO_FILTRO('activas')}
            />
            <StatCard
              title="Órdenes hoy"
              value={kpis.ordenesHoy}
              icon={Wrench}
              to={ROUTES.ORDENES_TRABAJO_FILTRO('hoy')}
            />
            <StatCard
              title="Clientes activos"
              value={kpis.clientesActivos}
              icon={Users}
              to={ROUTES.CLIENTES}
            />
            <StatCard
              title="Vencimientos próximos"
              value={kpis.vencimientosProximos}
              icon={AlertTriangle}
              to={`${ROUTES.DASHBOARD}#vencimientos`}
            />
            <StatCard
              title="Stock bajo o en mínimo"
              value={kpis.stockBajo}
              icon={Package}
              trend={kpis.stockBajo > 0 ? 'Revisar depósito' : 'Sin alertas'}
              to={ROUTES.INVENTARIO_STOCK_BAJO}
            />
            <StatCard
              title="OT esperando repuesto"
              value={kpis.otEsperaRepuesto}
              icon={PauseCircle}
              trend={kpis.otEsperaRepuesto > 0 ? 'Trabajos detenidos' : 'Sin demoras'}
              to={ROUTES.ORDENES_TRABAJO_FILTRO('espera_repuesto')}
            />
            <StatCard
              title="Facturación del mes"
              value={formatCurrency(kpis.facturacionMes)}
              icon={DollarSign}
              to={ROUTES.FACTURACION}
            />
            <StatCard
              title="Producción del mes"
              value={kpis.produccionMes}
              icon={BarChart3}
              trend="Órdenes entregadas"
              to={ROUTES.ORDENES_TRABAJO_FILTRO('entregadas_mes')}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Producción semanal"
                description="Órdenes ingresadas vs completadas"
              />
              <CardBody>
                {prodLoading ? (
                  <PageLoader />
                ) : chartData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Sin datos de producción</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Ingresadas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Completadas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Alertas operativas"
                description="Inventario y órdenes detenidas por repuestos"
              />
              <CardBody className="space-y-3">
                {alertasLoading ? (
                  <PageLoader />
                ) : (alertasOperativas ?? []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No hay alertas de stock ni OTs esperando repuesto
                  </p>
                ) : (
                  (alertasOperativas ?? []).slice(0, 8).map((alerta) => (
                    <Link
                      key={alerta.id}
                      to={alertaOperativaLink(alerta)}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-brand-200 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {alerta.titulo}
                        </p>
                        <p className="text-xs text-slate-500">{alerta.descripcion}</p>
                      </div>
                      <Badge variant={getAlertaOperativaBadgeVariant(alerta.nivel)}>
                        {alerta.tipo === 'stock_bajo' ? 'Stock' : 'OT'}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Notificaciones de vencimiento"
              description="Alertas listas para avisar a clientes (envío real próximamente)"
              action={
                <Badge variant="neutral">
                  <Bell className="mr-1 h-3 w-3" />
                  Stub
                </Badge>
              }
            />
            <CardBody className="space-y-3">
              {pendientesLoading ? (
                <PageLoader />
              ) : (pendientesNotificar ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No hay vencimientos críticos pendientes de notificar
                </p>
              ) : (
                (pendientesNotificar ?? []).slice(0, 8).map((alerta) => (
                  <Link
                    key={`notif-${alerta.id}`}
                    to={vencimientoLink(alerta)}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-brand-200 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {alerta.motivo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {alerta.clienteNombre} · {alerta.vehiculoPatente}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" />
                        Canal sugerido: {alerta.canalSugerido}
                      </p>
                    </div>
                    <Badge variant={getVencimientoBadgeVariant(alerta.nivel)}>
                      {alerta.diasRestantes}d
                    </Badge>
                  </Link>
                ))
              )}
              <p className="text-xs text-slate-400">
                Para procesar el batch: <code>node ace vencimientos:alertar</code> en el backend.
              </p>
            </CardBody>
          </Card>
        </>
      )}

      <Card id="vencimientos">
        <CardHeader
          title="Alertas de vencimiento"
          description="Obleas GNC y pruebas hidráulicas"
        />
        <CardBody className="space-y-3">
          {vencLoading ? (
            <PageLoader />
          ) : (vencimientos ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No hay vencimientos próximos</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(vencimientos ?? []).slice(0, 8).map((alerta) => (
                <Link
                  key={alerta.id}
                  to={vencimientoLink(alerta)}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:border-brand-200 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {alerta.descripcion}
                    </p>
                    <p className="text-xs text-slate-500">
                      {alerta.clienteNombre} · {alerta.vehiculoPatente}
                    </p>
                    <p className="text-xs text-slate-400">
                      Vence: {formatDateOnly(alerta.fechaVencimiento)}
                    </p>
                  </div>
                  <Badge variant={getVencimientoBadgeVariant(alerta.nivel)}>
                    {alerta.diasRestantes}d
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
