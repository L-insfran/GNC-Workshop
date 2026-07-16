import { Check, Mail, MessageCircle } from 'lucide-react'
import type { IVencimientoPendienteNotificar } from '@gnc/shared-types'
import { useMarcarVencimientoNotificado } from '@/hooks/useDashboard'
import { Badge, getVencimientoBadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { formatPatente } from '@/utils/format'
import { Link } from 'react-router-dom'

interface Props {
  alerta: IVencimientoPendienteNotificar
  /** En Dashboard: link a ficha. En ficha: ocultar link redundante */
  showEquipoLink?: boolean
}

export function VencimientoNotificarActions({ alerta, showEquipoLink = true }: Props) {
  const marcar = useMarcarVencimientoNotificado()

  async function onMarcar(canal: 'whatsapp' | 'email') {
    await marcar.mutateAsync({
      alertaId: alerta.id,
      data: { canal, modo: 'asistido', estado: 'enviado' },
    })
  }

  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showEquipoLink ? (
            <Link
              to={ROUTES.EQUIPO_GNC_DETAIL(alerta.equipoGncId)}
              className="truncate text-sm font-medium text-slate-900 hover:text-brand-700"
            >
              {alerta.motivo}
            </Link>
          ) : (
            <p className="truncate text-sm font-medium text-slate-900">{alerta.motivo}</p>
          )}
          <p className="text-xs text-slate-500">
            {alerta.clienteNombre} · {formatPatente(alerta.vehiculoPatente)}
          </p>
          {alerta.yaNotificado && (
            <p className="mt-1 text-xs text-emerald-600">Ya marcado como notificado; podés reenviar.</p>
          )}
          {!alerta.puedeWhatsapp && !alerta.puedeEmail && (
            <p className="mt-1 text-xs text-amber-600">
              Falta teléfono o email en la{' '}
              <Link
                to={ROUTES.CLIENTE_DETAIL(alerta.clienteId)}
                className="font-medium underline hover:text-amber-800"
              >
                ficha del cliente
              </Link>
            </p>
          )}
        </div>
        <Badge variant={getVencimientoBadgeVariant(alerta.nivel)}>{alerta.diasRestantes}d</Badge>
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
          disabled={
            marcar.isPending ||
            (!alerta.puedeWhatsapp && !alerta.puedeEmail) ||
            alerta.yaNotificado
          }
          onClick={() => onMarcar(alerta.puedeWhatsapp ? 'whatsapp' : 'email')}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {alerta.yaNotificado ? 'Notificado' : 'Marcar notificado'}
        </Button>
      </div>
    </div>
  )
}
