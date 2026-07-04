import {
  BarChart3,
  ClipboardList,
  AlertTriangle,
  Users,
  DollarSign,
  Wrench,
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
import { useDashboardKpis, useDashboardProduccion, useDashboardVencimientos } from '@/hooks/useDashboard'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Badge, getVencimientoBadgeVariant } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/utils/format'

export function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useDashboardKpis()
  const { data: vencimientos, isLoading: vencLoading } = useDashboardVencimientos()
  const { data: produccion, isLoading: prodLoading } = useDashboardProduccion(7)

  if (kpisLoading) return <PageLoader />

  if (kpisError || !kpis) {
    return (
      <Alert variant="error" title="Error al cargar dashboard">
        No se pudieron obtener los indicadores del taller.
      </Alert>
    )
  }

  const chartData = (produccion ?? []).map((item) => ({
    fecha: formatDate(item.fecha),
    Completadas: item.ordenesCompletadas,
    Ingresadas: item.ordenesIngresadas,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Panel de control</h2>
        <p className="text-sm text-slate-500">Resumen operativo del taller GNC</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Órdenes activas" value={kpis.ordenesActivas} icon={ClipboardList} />
        <StatCard title="Órdenes hoy" value={kpis.ordenesHoy} icon={Wrench} />
        <StatCard title="Clientes activos" value={kpis.clientesActivos} icon={Users} />
        <StatCard
          title="Vencimientos próximos"
          value={kpis.vencimientosProximos}
          icon={AlertTriangle}
        />
        <StatCard
          title="Facturación del mes"
          value={formatCurrency(kpis.facturacionMes)}
          icon={DollarSign}
        />
        <StatCard
          title="Producción del mes"
          value={kpis.produccionMes}
          icon={BarChart3}
          trend="Órdenes completadas"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Producción semanal" description="Órdenes ingresadas vs completadas" />
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
            title="Alertas de vencimiento"
            description="Obleas GNC y pruebas hidráulicas"
          />
          <CardBody className="space-y-3">
            {vencLoading ? (
              <PageLoader />
            ) : (vencimientos ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No hay vencimientos próximos</p>
            ) : (
              (vencimientos ?? []).slice(0, 8).map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{alerta.descripcion}</p>
                    <p className="text-xs text-slate-500">
                      {alerta.clienteNombre} · {alerta.vehiculoPatente}
                    </p>
                    <p className="text-xs text-slate-400">
                      Vence: {formatDate(alerta.fechaVencimiento)}
                    </p>
                  </div>
                  <Badge variant={getVencimientoBadgeVariant(alerta.nivel)}>
                    {alerta.diasRestantes}d
                  </Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
