import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ClipboardList, DollarSign, FileText } from 'lucide-react'
import type { IFactura } from '@gnc/shared-types'
import { useFactura } from '@/hooks/useFacturacion'
import { useCajaMutations } from '@/hooks/useCaja'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { MODULE_ROLES } from '@/constants/roles'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { RegistrarCobroModal } from '@/components/facturacion/RegistrarCobroModal'
import { formatCurrency, formatDateTime } from '@/utils/format'

export function FacturaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { checkRole } = useAuth()
  const { data: factura, isLoading, error } = useFactura(id)
  const { createMovimiento } = useCajaMutations()

  const [cobroModalOpen, setCobroModalOpen] = useState(false)

  if (isLoading) return <PageLoader />
  if (error || !factura) return <Alert variant="error">Factura no encontrada</Alert>

  const saldoPendiente = factura.saldoPendiente ?? Number(factura.total)
  const totalCobrado = factura.totalCobrado ?? 0
  const estadoCobro = factura.estadoCobro ?? (factura.cobrada ? 'cobrada' : 'pendiente')
  const puedeRegistrarCobro =
    factura.estado === 'emitida' &&
    checkRole(MODULE_ROLES.caja) &&
    estadoCobro !== 'cobrada'

  const puedeEmitirNotaCredito =
    Boolean(factura.puedeEmitirNotaCredito) && checkRole(MODULE_ROLES.facturacion)

  const handleRegistrarCobro = async (monto: number) => {
    if (!id) return

    await createMovimiento.mutateAsync({
      tipo: 'ingreso',
      monto,
      concepto:
        monto >= saldoPendiente - 0.01
          ? `Cobro factura ${factura.numero}`
          : `Seña factura ${factura.numero}`,
      facturaId: id,
    })
    await queryClient.invalidateQueries({ queryKey: ['facturas', id] })
  }

  const cobroBadgeVariant =
    estadoCobro === 'cobrada' ? 'success' : estadoCobro === 'parcial' ? 'warning' : 'warning'

  const cobroLabel =
    estadoCobro === 'cobrada'
      ? 'Cobrada'
      : estadoCobro === 'parcial'
        ? 'Cobro parcial'
        : 'Pendiente de cobro'

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to={ROUTES.FACTURACION} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      {estadoCobro === 'cobrada' && (
        <Alert variant="success" title="Cobrada">
          {factura.cobroFecha
            ? `Último cobro el ${formatDateTime(factura.cobroFecha)}.`
            : `Total cobrado: ${formatCurrency(totalCobrado)}.`}
        </Alert>
      )}

      {estadoCobro === 'parcial' && (
        <Alert variant="warning" title="Cobro parcial">
          Cobrado {formatCurrency(totalCobrado)} de {formatCurrency(factura.total)}. Saldo pendiente:{' '}
          {formatCurrency(saldoPendiente)}.
        </Alert>
      )}

      <Card>
        <CardHeader
          title={factura.numero}
          description={`${factura.tipo.replace('_', ' ').toUpperCase()} · ${factura.estado}`}
          action={
            <div className="flex flex-wrap gap-2">
              {puedeEmitirNotaCredito && (
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.FACTURA_NEW_FROM_NC(factura.id))}
                >
                  <FileText className="h-4 w-4" />
                  Emitir nota de crédito
                </Button>
              )}
              {puedeRegistrarCobro && (
                <Button onClick={() => setCobroModalOpen(true)}>
                  <DollarSign className="h-4 w-4" />
                  {estadoCobro === 'parcial' ? 'Registrar saldo' : 'Registrar cobro'}
                </Button>
              )}
            </div>
          }
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
              <Badge variant={cobroBadgeVariant}>{cobroLabel}</Badge>
            )}
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-500">Cliente</p>
              <Link
                to={ROUTES.CLIENTE_DETAIL(factura.clienteId)}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                {factura.clienteNombre ??
                  (factura as IFactura & { cliente?: { razonSocial?: string } }).cliente
                    ?.razonSocial ??
                  'Ver cliente'}
              </Link>
            </div>
            <div>
              <p className="text-slate-500">Fecha emisión</p>
              <p className="font-medium">{formatDateTime(factura.fechaEmision)}</p>
            </div>
            {factura.estado === 'emitida' && (
              <>
                <div>
                  <p className="text-slate-500">Total cobrado</p>
                  <p className="font-medium">{formatCurrency(totalCobrado)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Saldo pendiente</p>
                  <p className="font-medium">{formatCurrency(saldoPendiente)}</p>
                </div>
              </>
            )}
            {factura.facturaReferenciaId && (
              <div className="sm:col-span-2">
                <p className="text-slate-500">Factura de referencia</p>
                <Link
                  to={ROUTES.FACTURA_DETAIL(factura.facturaReferenciaId)}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Ver factura original
                </Link>
              </div>
            )}
            {factura.notaCreditoId && (
              <div className="sm:col-span-2">
                <p className="text-slate-500">Nota de crédito</p>
                <Link
                  to={ROUTES.FACTURA_DETAIL(factura.notaCreditoId)}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Ver nota de crédito emitida
                </Link>
              </div>
            )}
            {factura.ordenTrabajoId && (
              <div className="sm:col-span-2">
                <p className="text-slate-500">Orden de trabajo</p>
                <Link
                  to={ROUTES.ORDEN_TRABAJO_DETAIL(factura.ordenTrabajoId)}
                  className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
                >
                  <ClipboardList className="h-4 w-4" />
                  Ver orden de trabajo vinculada
                </Link>
              </div>
            )}
          </div>

          {(factura.cobros?.length ?? 0) > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Cobros registrados</p>
              <ul className="space-y-2 text-sm">
                {factura.cobros!.map((cobro) => (
                  <li key={cobro.id} className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-slate-600">
                        {formatDateTime(cobro.createdAt)} — {cobro.concepto}
                      </span>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                        <Link to={ROUTES.CAJA} className="text-brand-600 hover:text-brand-700">
                          Ver en caja
                        </Link>
                        {cobro.ordenTrabajoId && (
                          <Link
                            to={ROUTES.ORDEN_TRABAJO_DETAIL(cobro.ordenTrabajoId)}
                            className="text-brand-600 hover:text-brand-700"
                          >
                            OT {cobro.ordenTrabajoNumero ?? cobro.ordenTrabajoId.slice(0, 8)}
                          </Link>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(cobro.monto)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">P. unit.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(factura.items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2">{item.descripcion}</td>
                  <td className="py-2 text-right">{item.cantidad}</td>
                  <td className="py-2 text-right">{formatCurrency(item.precioUnitario)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-right text-sm">
            <p>
              Subtotal: <strong>{formatCurrency(factura.subtotal)}</strong>
            </p>
            <p>
              IVA: <strong>{formatCurrency(factura.iva)}</strong>
            </p>
            <p className="text-lg">
              Total: <strong>{formatCurrency(factura.total)}</strong>
            </p>
          </div>
        </CardBody>
      </Card>

      <RegistrarCobroModal
        isOpen={cobroModalOpen}
        onClose={() => setCobroModalOpen(false)}
        facturaNumero={factura.numero}
        saldoPendiente={saldoPendiente}
        onConfirm={handleRegistrarCobro}
        isSubmitting={createMovimiento.isPending}
      />
    </div>
  )
}
