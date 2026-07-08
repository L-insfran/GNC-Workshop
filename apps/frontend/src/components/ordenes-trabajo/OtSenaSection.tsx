import type { IOtSenaResumen } from '@gnc/shared-types'
import { Link } from 'react-router-dom'
import { DollarSign } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDateTime } from '@/utils/format'

interface OtSenaSectionProps {
  ordenNumero: string
  resumenSena: IOtSenaResumen
}

export function OtSenaSection({ ordenNumero, resumenSena }: OtSenaSectionProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/40">
      <CardHeader
        title="Seña registrada"
        description={`Adelanto cobrado al ingreso de la OT ${ordenNumero}`}
      />
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <p className="text-lg font-semibold text-emerald-800">
            {formatCurrency(resumenSena.totalSena)}
          </p>
        </div>
        <p className="text-sm text-slate-600">
          Este monto se descontará automáticamente al emitir y cobrar la factura vinculada.{' '}
          <Link to={ROUTES.CAJA} className="font-medium text-brand-600 hover:text-brand-700">
            Ver en caja
          </Link>
        </p>
        {resumenSena.movimientos.length > 0 && (
          <ul className="divide-y divide-emerald-100 rounded-lg border border-emerald-100 bg-white text-sm">
            {resumenSena.movimientos.map((mov) => (
              <li key={mov.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <span className="text-slate-600">{mov.concepto}</span>
                  {mov.facturaId && (
                    <p className="text-xs">
                      <Link
                        to={ROUTES.FACTURA_DETAIL(mov.facturaId)}
                        className="text-brand-600 hover:text-brand-700"
                      >
                        Aplicado a {mov.facturaNumero ?? 'factura'}
                      </Link>
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-medium">
                  {formatCurrency(mov.monto)} · {formatDateTime(mov.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
