import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList, DollarSign } from 'lucide-react'
import type { IFactura } from '@gnc/shared-types'
import { useFactura } from '@/hooks/useFacturacion'
import { useCajaMutations } from '@/hooks/useCaja'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { MODULE_ROLES } from '@/constants/roles'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

export function FacturaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { checkRole } = useAuth()
  const { data: factura, isLoading, error } = useFactura(id)
  const { createMovimiento } = useCajaMutations()

  const [cobroModalOpen, setCobroModalOpen] = useState(false)
  const [cobroSuccess, setCobroSuccess] = useState(false)
  const [cobroError, setCobroError] = useState<string | null>(null)

  if (isLoading) return <PageLoader />
  if (error || !factura) return <Alert variant="error">Factura no encontrada</Alert>

  const puedeRegistrarCobro =
    factura.estado === 'emitida' && checkRole(MODULE_ROLES.caja) && !cobroSuccess

  const handleRegistrarCobro = async () => {
    setCobroError(null)

    try {
      await createMovimiento.mutateAsync({
        tipo: 'ingreso',
        monto: Number(factura.total),
        concepto: `Cobro factura ${factura.numero}`,
      })
      setCobroSuccess(true)
      setCobroModalOpen(false)
    } catch (err) {
      setCobroError(
        err instanceof ApiError ? err.message : 'No se pudo registrar el cobro en caja.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to={ROUTES.FACTURACION} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      {cobroSuccess && (
        <Alert variant="success" title="Cobro registrado">
          Se registró el ingreso en caja por ${Number(factura.total).toLocaleString('es-AR')}.
        </Alert>
      )}

      <Card>
        <CardHeader
          title={factura.numero}
          description={`${factura.tipo.replace('_', ' ').toUpperCase()} · ${factura.estado}`}
          action={
            puedeRegistrarCobro ? (
              <Button onClick={() => setCobroModalOpen(true)}>
                <DollarSign className="h-4 w-4" />
                Registrar cobro
              </Button>
            ) : undefined
          }
        />
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
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
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-500">Cliente</p>
              <p className="font-medium">
                {factura.clienteNombre ??
                  (factura as IFactura & { cliente?: { razonSocial?: string } }).cliente
                    ?.razonSocial ??
                  factura.clienteId}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Fecha emisión</p>
              <p className="font-medium">
                {new Date(factura.fechaEmision).toLocaleString('es-AR')}
              </p>
            </div>
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
                  <td className="py-2 text-right">
                    ${Number(item.precioUnitario).toLocaleString('es-AR')}
                  </td>
                  <td className="py-2 text-right">
                    ${Number(item.subtotal).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-right text-sm">
            <p>
              Subtotal: <strong>${Number(factura.subtotal).toLocaleString('es-AR')}</strong>
            </p>
            <p>
              IVA: <strong>${Number(factura.iva).toLocaleString('es-AR')}</strong>
            </p>
            <p className="text-lg">
              Total: <strong>${Number(factura.total).toLocaleString('es-AR')}</strong>
            </p>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={cobroModalOpen}
        onClose={() => {
          setCobroModalOpen(false)
          setCobroError(null)
        }}
        title="Registrar cobro en caja"
        description={`Se registrará un ingreso por $${Number(factura.total).toLocaleString('es-AR')} correspondiente a la factura ${factura.numero}.`}
      >
        {cobroError && (
          <Alert variant="error" className="mb-4">
            {cobroError}
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCobroModalOpen(false)
              setCobroError(null)
            }}
          >
            Cancelar
          </Button>
          <Button isLoading={createMovimiento.isPending} onClick={handleRegistrarCobro}>
            Confirmar cobro
          </Button>
        </div>
      </Modal>
    </div>
  )
}
