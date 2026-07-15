import { Link } from 'react-router-dom'
import { Bell, Check, Mail, MessageCircle } from 'lucide-react'
import type { IVencimientoPendienteNotificar } from '@gnc/shared-types'
import {
  useDashboardNotificacionesConfig,
  useDashboardPendientesNotificar,
  useMarcarVencimientoNotificado,
} from '@/hooks/useDashboard'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge, getVencimientoBadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatPatente } from '@/utils/format'

interface Props {
  enabled: boolean
}

export function VencimientosNotificacionSection({ enabled }: Props) {
  const { data: pendientes, isLoading } = useDashboardPendientesNotificar(enabled)
  const { data: config } = useDashboardNotificacionesConfig(enabled)
  const marcar = useMarcarVencimientoNotificado()

  if (!enabled) return null

  const driverLabel =
    config?.driver === 'whatsapp_cloud'
      ? config.envioAutomaticoDisponible
        ? 'WhatsApp API'
        : 'WhatsApp (pendiente config)'
      : 'Asistido ($0)'

  async function onMarcar(alerta: IVencimientoPendienteNotificar, canal: 'whatsapp' | 'email') {
    await marcar.mutateAsync({
      alertaId: alerta.id,
      data: { canal, modo: 'asistido', estado: 'enviado' },
    })
  }

  return (
    <Card>
      <CardHeader
        title="Notificaciones de vencimiento"
        description="Abrí WhatsApp o el correo con el mensaje listo; después marcá como notificado. El envío automático por API queda cableado para más adelante."
        action={
          <Badge variant="neutral">
            <Bell className="mr-1 h-3 w-3" />
            {driverLabel}
          </Badge>
        }
      />
      <CardBody className="space-y-3">
        {isLoading ? (
          <PageLoader />
        ) : (pendientes ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No hay vencimientos críticos pendientes de notificar
          </p>
        ) : (
          (pendientes ?? []).slice(0, 10).map((alerta) => (
            <div
              key={`notif-${alerta.id}`}
              className="rounded-lg border border-slate-100 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={ROUTES.EQUIPO_GNC_DETAIL(alerta.equipoGncId)}
                    className="truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                  >
                    {alerta.motivo}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {alerta.clienteNombre} · {formatPatente(alerta.vehiculoPatente)}
                  </p>
                  {!alerta.puedeWhatsapp && !alerta.puedeEmail && (
                    <p className="mt-1 text-xs text-amber-600">
                      Falta teléfono o email en la ficha del cliente
                    </p>
                  )}
                </div>
                <Badge variant={getVencimientoBadgeVariant(alerta.nivel)}>
                  {alerta.diasRestantes}d
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {alerta.puedeWhatsapp && alerta.whatsappUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(alerta.whatsappUrl!, '_blank', 'noopener,noreferrer')}
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                )}
                {alerta.puedeEmail && alerta.mailtoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.location.href = alerta.mailtoUrl!
                    }}
                  >
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    Email
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={marcar.isPending || (!alerta.puedeWhatsapp && !alerta.puedeEmail)}
                  onClick={() =>
                    onMarcar(alerta, alerta.puedeWhatsapp ? 'whatsapp' : 'email')
                  }
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Marcar notificado
                </Button>
              </div>
            </div>
          ))
        )}
        <p className="text-xs text-slate-400">
          Batch: <code>npm run vencimientos:alertar</code> en el backend. Cuando configures Meta
          Cloud API, cambiá <code>NOTIFICACION_DRIVER=whatsapp_cloud</code>.
        </p>
      </CardBody>
    </Card>
  )
}
