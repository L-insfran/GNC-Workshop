import { Bell, MessageCircle } from 'lucide-react'
import { useDashboardPendientesNotificar } from '@/hooks/useDashboard'
import { VencimientoNotificarActions } from '@/components/dashboard/vencimiento-notificar-actions'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'

interface Props {
  equipoGncId: string
}

/**
 * Notificación asistida ($0) desde la ficha del equipo.
 * Incluye críticos aunque ya estén marcados, para poder reabrir WhatsApp.
 */
export function EquipoVencimientosNotificacionCard({ equipoGncId }: Props) {
  const { data: alertas, isLoading } = useDashboardPendientesNotificar(true, {
    equipoGncId,
    incluirYaNotificados: true,
  })

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <PageLoader />
        </CardBody>
      </Card>
    )
  }

  if (!alertas?.length) return null

  return (
    <Card>
      <CardHeader
        title="Avisar vencimiento al cliente"
        description="Abrí WhatsApp o el correo con el mensaje listo (sin costo de API). Después marcá como notificado."
        action={
          <Badge variant="neutral">
            <Bell className="mr-1 h-3 w-3" />
            Asistido
            <MessageCircle className="ml-1.5 h-3 w-3" />
          </Badge>
        }
      />
      <CardBody className="space-y-3">
        {alertas.map((alerta) => (
          <VencimientoNotificarActions
            key={`equipo-notif-${alerta.id}`}
            alerta={alerta}
            showEquipoLink={false}
          />
        ))}
      </CardBody>
    </Card>
  )
}
