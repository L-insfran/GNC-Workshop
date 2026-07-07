import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, Receipt, DollarSign } from 'lucide-react'
import type { OrdenEstado } from '@gnc/shared-types'
import { useAuth } from '@/hooks/useAuth'
import { useFacturaVinculadaOT } from '@/hooks/useFacturaVinculadaOT'
import { ROUTES } from '@/constants/routes'
import { MODULE_ROLES } from '@/constants/roles'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/utils/format'

interface OtFacturacionSectionProps {
  ordenId: string
  ordenNumero: string
  ordenEstado: OrdenEstado
}

const ESTADOS_FACTURABLES: OrdenEstado[] = ['finalizada', 'entregada']

export function OtFacturacionSection({
  ordenId,
  ordenNumero,
  ordenEstado,
}: OtFacturacionSectionProps) {
  const navigate = useNavigate()
  const { checkRole } = useAuth()
  const { data: vinculada, isLoading } = useFacturaVinculadaOT(
    ESTADOS_FACTURABLES.includes(ordenEstado) ? ordenId : undefined
  )

  if (!ESTADOS_FACTURABLES.includes(ordenEstado)) {
    if (ordenEstado === 'control_calidad') {
      return (
        <Alert variant="info" title="Próximo paso: finalizar la OT">
          Una vez que pases la orden a <strong>Finalizada</strong>, vas a poder generar la
          factura desde acá con los ítems del presupuesto.
        </Alert>
      )
    }
    return null
  }

  if (isLoading) return <PageLoader />

  if (!checkRole(MODULE_ROLES.facturacion)) {
    return (
      <Alert variant="warning" title="Facturación pendiente">
        La OT {ordenNumero} está lista para facturar. Un usuario con rol de Caja o
        Administrador debe emitir el comprobante.
      </Alert>
    )
  }

  if (!vinculada) {
    return (
      <Card className="border-brand-200 bg-brand-50/40">
        <CardHeader
          title="Facturación"
          description={`La OT ${ordenNumero} está lista para emitir comprobante`}
        />
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Se precargarán automáticamente el cliente y los ítems del presupuesto en la factura.
          </p>
          <Button onClick={() => navigate(ROUTES.FACTURA_NEW_FROM_OT(ordenId))}>
            <FileText className="h-4 w-4" />
            Generar factura
          </Button>
        </CardBody>
      </Card>
    )
  }

  const { factura, estadoCobro, totalCobrado, saldoPendiente, puedeGenerarFactura, notaCreditoId } =
    vinculada

  const cobroLabel =
    estadoCobro === 'cobrada'
      ? 'Cobrada'
      : estadoCobro === 'parcial'
        ? 'Cobro parcial'
        : 'Pendiente de cobro'

  return (
    <Card className="border-slate-200">
      <CardHeader
        title="Facturación"
        description={`Comprobante vinculado a la OT ${ordenNumero}`}
      />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              factura.estado === 'emitida'
                ? 'success'
                : factura.estado === 'anulada'
                  ? 'danger'
                  : 'neutral'
            }
          >
            {factura.estado}
          </Badge>
          {factura.estado === 'emitida' && (
            <Badge
              variant={
                estadoCobro === 'cobrada' ? 'success' : estadoCobro === 'parcial' ? 'warning' : 'warning'
              }
            >
              {cobroLabel}
            </Badge>
          )}
          {factura.tipo === 'nota_credito' && <Badge variant="neutral">Nota de crédito</Badge>}
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Comprobante</p>
            <p className="font-medium">{factura.numero}</p>
          </div>
          <div>
            <p className="text-slate-500">Total</p>
            <p className="font-medium">{formatCurrency(factura.total)}</p>
          </div>
          {factura.estado === 'emitida' && (
            <>
              <div>
                <p className="text-slate-500">Cobrado</p>
                <p className="font-medium">{formatCurrency(totalCobrado)}</p>
              </div>
              <div>
                <p className="text-slate-500">Saldo</p>
                <p className="font-medium">{formatCurrency(saldoPendiente)}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.FACTURA_DETAIL(factura.id)}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Ver comprobante
            </Button>
          </Link>

          {factura.estado === 'emitida' && estadoCobro !== 'cobrada' && checkRole(MODULE_ROLES.caja) && (
            <Link to={ROUTES.FACTURA_DETAIL(factura.id)}>
              <Button size="sm">
                <DollarSign className="h-4 w-4" />
                {estadoCobro === 'parcial' ? 'Registrar saldo' : 'Registrar cobro'}
              </Button>
            </Link>
          )}

          {puedeGenerarFactura && factura.estado === 'anulada' && (
            <Button size="sm" onClick={() => navigate(ROUTES.FACTURA_NEW_FROM_OT(ordenId))}>
              <FileText className="h-4 w-4" />
              Re-facturar
            </Button>
          )}

          {factura.estado === 'borrador' && (
            <Link to={ROUTES.FACTURA_DETAIL(factura.id)}>
              <Button size="sm">
                <Receipt className="h-4 w-4" />
                Continuar borrador
              </Button>
            </Link>
          )}

          {notaCreditoId && (
            <Link to={ROUTES.FACTURA_DETAIL(notaCreditoId)}>
              <Button variant="outline" size="sm">
                Ver nota de crédito
              </Button>
            </Link>
          )}
        </div>

        {factura.estado === 'emitida' && !puedeGenerarFactura && (
          <p className="text-xs text-slate-500">
            Esta OT ya tiene una factura activa. Para corregir el monto, emití una nota de crédito
            desde el detalle del comprobante.
          </p>
        )}
      </CardBody>
    </Card>
  )
}
