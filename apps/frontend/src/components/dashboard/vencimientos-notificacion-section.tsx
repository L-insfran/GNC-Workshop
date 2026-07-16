import { Bell } from 'lucide-react'
import {
  useDashboardNotificacionesConfig,
  useDashboardPendientesNotificar,
} from '@/hooks/useDashboard'
import { VencimientoNotificarActions } from '@/components/dashboard/vencimiento-notificar-actions'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'

interface Props {
  enabled: boolean
}

export function VencimientosNotificacionSection({ enabled }: Props) {
  const { data: pendientes, isLoading } = useDashboardPendientesNotificar(enabled)
  const { data: config } = useDashboardNotificacionesConfig(enabled)

  if (!enabled) return null

  const driverLabel =
    config?.driver === 'whatsapp_cloud'
      ? config.envioAutomaticoDisponible
        ? 'WhatsApp API'
        : 'WhatsApp (pendiente config)'
      : 'Asistido ($0)'

  return (
    <Card id="notificaciones-vencimiento">
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
            No hay vencimientos críticos pendientes de notificar. Si ya marcaste uno, podés
            reenviar desde la ficha del equipo.
          </p>
        ) : (
          (pendientes ?? []).slice(0, 10).map((alerta) => (
            <VencimientoNotificarActions key={`notif-${alerta.id}`} alerta={alerta} />
          ))
        )}
        <p className="text-xs text-slate-400">
          Batch: <code>npm run vencimientos:alertar</code> en el backend. Cuando configures Meta
          Cloud API, cambiá <code>NOTIFICACION_DRIVER=whatsapp_cloud</code>. Para el flujo gratis
          usá <code>NOTIFICACION_DRIVER=manual</code>.
        </p>
      </CardBody>
    </Card>
  )
}
