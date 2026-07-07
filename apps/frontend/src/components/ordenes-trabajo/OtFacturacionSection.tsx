import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import type { OrdenEstado } from '@gnc/shared-types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { MODULE_ROLES } from '@/constants/roles'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

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

  if (!checkRole(MODULE_ROLES.facturacion)) {
    return (
      <Alert variant="warning" title="Facturación pendiente">
        La OT {ordenNumero} está lista para facturar. Un usuario con rol de Caja o
        Administrador debe emitir el comprobante.
      </Alert>
    )
  }

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
