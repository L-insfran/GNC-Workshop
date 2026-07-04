import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Car } from 'lucide-react'
import { useCliente, useClienteVehiculos } from '@/hooks/useClientes'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import {
  CLIENTE_TIPO_LABELS,
  CONDICION_IVA_LABELS,
  DOCUMENTO_TIPO_LABELS,
  formatDate,
  formatPatente,
} from '@/utils/format'

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cliente, isLoading, error } = useCliente(id)
  const { data: vehiculos, isLoading: vehiculosLoading } = useClienteVehiculos(id)

  if (isLoading) return <PageLoader />

  if (error || !cliente) {
    return <Alert variant="error">No se pudo cargar el cliente.</Alert>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.CLIENTES}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>
        <Button onClick={() => navigate(ROUTES.CLIENTE_EDIT(cliente.id))}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader
          title={cliente.razonSocial}
          description={`${CLIENTE_TIPO_LABELS[cliente.tipo]} · ${DOCUMENTO_TIPO_LABELS[cliente.documentoTipo]} ${cliente.documentoNumero}`}
          action={
            <Badge variant={cliente.isActive ? 'success' : 'neutral'}>
              {cliente.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          }
        />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{cliente.email ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Teléfono</dt>
              <dd className="mt-1 text-sm text-slate-900">{cliente.telefono ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Condición IVA</dt>
              <dd className="mt-1 text-sm text-slate-900">{CONDICION_IVA_LABELS[cliente.condicionIva]}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Alta</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(cliente.createdAt)}</dd>
            </div>
            {cliente.notas && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-slate-500">Notas</dt>
                <dd className="mt-1 text-sm text-slate-700">{cliente.notas}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Vehículos"
          description="Vehículos asociados al cliente"
          action={
            <Link to={`${ROUTES.VEHICULO_NEW}?clienteId=${cliente.id}`}>
              <Button size="sm">
                <Car className="h-4 w-4" />
                Agregar vehículo
              </Button>
            </Link>
          }
        />
        <CardBody>
          {vehiculosLoading ? (
            <PageLoader />
          ) : (vehiculos ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Sin vehículos registrados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {(vehiculos ?? []).map((vehiculo) => (
                <li key={vehiculo.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{formatPatente(vehiculo.patente)}</p>
                    <p className="text-sm text-slate-500">
                      {vehiculo.marcaNombre} {vehiculo.modeloNombre} · {vehiculo.anio}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(ROUTES.VEHICULO_EDIT(vehiculo.id))}
                  >
                    Ver
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
