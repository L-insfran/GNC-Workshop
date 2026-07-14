import type { IOtEstadoHistorial } from '@gnc/shared-types'
import { useQuery } from '@tanstack/react-query'
import { ordenTrabajoService } from '@/services/ordenTrabajoService'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge, getOrdenEstadoBadgeVariant } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { formatDateTime, ORDEN_ESTADO_LABELS } from '@/utils/format'

interface OtHistorialEstadosSectionProps {
  ordenTrabajoId: string
}

export function OtHistorialEstadosSection({ ordenTrabajoId }: OtHistorialEstadosSectionProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ordenes-trabajo', ordenTrabajoId, 'historial'],
    queryFn: async () => {
      const response = await ordenTrabajoService.getHistorial(ordenTrabajoId)
      return response.data ?? []
    },
  })

  return (
    <Card>
      <CardHeader
        title="Historial de estados"
        description="Cambios registrados sobre esta orden de trabajo"
      />
      <CardBody>
        {isLoading && <PageLoader />}
        {error && <Alert variant="error">No se pudo cargar el historial.</Alert>}
        {!isLoading && !error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-slate-500">Aún no hay cambios de estado registrados.</p>
        )}
        {!isLoading && (data?.length ?? 0) > 0 && (
          <ol className="relative space-y-4 border-l border-slate-200 pl-4">
            {(data as IOtEstadoHistorial[]).map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
                <div className="flex flex-wrap items-center gap-2">
                  {item.estadoAnterior && (
                    <>
                      <Badge variant={getOrdenEstadoBadgeVariant(item.estadoAnterior)}>
                        {ORDEN_ESTADO_LABELS[item.estadoAnterior]}
                      </Badge>
                      <span className="text-xs text-slate-400">→</span>
                    </>
                  )}
                  <Badge variant={getOrdenEstadoBadgeVariant(item.estadoNuevo)}>
                    {ORDEN_ESTADO_LABELS[item.estadoNuevo]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(item.createdAt)}
                  {item.userNombre ? ` · ${item.userNombre}` : ''}
                </p>
                {item.observacion && (
                  <p className="mt-1 text-sm text-slate-600">{item.observacion}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  )
}
