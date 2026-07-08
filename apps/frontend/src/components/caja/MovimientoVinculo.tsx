import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface MovimientoVinculoProps {
  facturaId?: string
  facturaNumero?: string
  ordenTrabajoId?: string
  ordenTrabajoNumero?: string
}

const linkClass = 'text-brand-600 hover:text-brand-700'

export function MovimientoVinculo({
  facturaId,
  facturaNumero,
  ordenTrabajoId,
  ordenTrabajoNumero,
}: MovimientoVinculoProps) {
  if (!facturaId && !ordenTrabajoId) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="flex flex-col gap-0.5 text-sm">
      {ordenTrabajoId && (
        <Link to={ROUTES.ORDEN_TRABAJO_DETAIL(ordenTrabajoId)} className={linkClass}>
          OT {ordenTrabajoNumero ?? ordenTrabajoId.slice(0, 8)}
        </Link>
      )}
      {facturaId && (
        <Link to={ROUTES.FACTURA_DETAIL(facturaId)} className={linkClass}>
          {facturaNumero ?? 'Factura'}
        </Link>
      )}
    </div>
  )
}
