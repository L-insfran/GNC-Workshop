import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { IFactura } from '@gnc/shared-types'
import { useFactura } from '@/hooks/useFacturacion'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

export function FacturaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: factura, isLoading, error } = useFactura(id)

  if (isLoading) return <PageLoader />
  if (error || !factura) return <Alert variant="error">Factura no encontrada</Alert>

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to={ROUTES.FACTURACION} className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <Card>
        <CardHeader
          title={factura.numero}
          description={`${factura.tipo.replace('_', ' ').toUpperCase()} · ${factura.estado}`}
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
    </div>
  )
}
