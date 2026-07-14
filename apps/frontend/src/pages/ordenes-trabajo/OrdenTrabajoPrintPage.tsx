import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { useOrdenTrabajo } from '@/hooks/useOrdenesTrabajo'
import { useOtPresupuesto } from '@/hooks/useOtItems'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { OT_ITEM_TIPO_LABELS } from '@/components/ordenes-trabajo/OtItemFormModal'
import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
  formatPatente,
  ORDEN_ESTADO_LABELS,
  ORDEN_PRIORIDAD_LABELS,
} from '@/utils/format'

export function OrdenTrabajoPrintPage() {
  const { id } = useParams<{ id: string }>()
  const { data: orden, isLoading, error } = useOrdenTrabajo(id)
  const { data: presupuesto, isLoading: presLoading } = useOtPresupuesto(id)

  useEffect(() => {
    if (!orden || presLoading) return
    const timer = window.setTimeout(() => window.print(), 400)
    return () => window.clearTimeout(timer)
  }, [orden, presLoading])

  if (isLoading || presLoading) return <PageLoader />

  if (error || !orden) {
    return <Alert variant="error">No se pudo cargar la orden para imprimir.</Alert>
  }

  const vehiculo = [
    orden.vehiculoPatente ? formatPatente(orden.vehiculoPatente) : null,
    [orden.vehiculoMarcaNombre, orden.vehiculoModeloNombre].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto max-w-3xl space-y-6 bg-white print:max-w-none">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to={ROUTES.ORDEN_TRABAJO_DETAIL(orden.id)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al detalle
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      <header className="border-b border-slate-300 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          GNC Workshop
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Orden de trabajo {orden.numero}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Impreso: {formatDateTime(new Date().toISOString())}
        </p>
      </header>

      <section className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Cliente</p>
          <p className="font-medium text-slate-900">{orden.clienteNombre ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Vehículo</p>
          <p className="font-medium text-slate-900">{vehiculo || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Tipo de trabajo</p>
          <p className="font-medium text-slate-900">{orden.tipoTrabajoNombre ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Estado / Prioridad</p>
          <p className="font-medium text-slate-900">
            {ORDEN_ESTADO_LABELS[orden.estado]} · {ORDEN_PRIORIDAD_LABELS[orden.prioridad]}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Ingreso</p>
          <p className="font-medium text-slate-900">{formatDateTime(orden.fechaIngreso)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Entrega estimada</p>
          <p className="font-medium text-slate-900">
            {orden.fechaEstimadaEntrega ? formatDateOnly(orden.fechaEstimadaEntrega) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Mecánico</p>
          <p className="font-medium text-slate-900">{orden.mecanicoNombre ?? 'Sin asignar'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Equipo GNC</p>
          <p className="font-medium text-slate-900">{orden.equipoGncNumeroSerie ?? '—'}</p>
        </div>
      </section>

      {orden.descripcionProblema && (
        <section>
          <h2 className="text-sm font-semibold text-slate-900">Descripción</h2>
          <p className="mt-1 text-sm text-slate-700">{orden.descripcionProblema}</p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Presupuesto</h2>
        {(presupuesto?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500">Sin ítems cargados.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-2">Tipo</th>
                <th className="py-2 pr-2">Descripción</th>
                <th className="py-2 pr-2 text-right">Cant.</th>
                <th className="py-2 pr-2 text-right">P. unit.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {presupuesto!.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2">{OT_ITEM_TIPO_LABELS[item.tipo]}</td>
                  <td className="py-2 pr-2">{item.descripcion}</td>
                  <td className="py-2 pr-2 text-right">{item.cantidad}</td>
                  <td className="py-2 pr-2 text-right">{formatCurrency(item.precioUnitario)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {presupuesto && (
          <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total estimado</dt>
              <dd>{formatCurrency(presupuesto.totalEstimado)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total final</dt>
              <dd>{formatCurrency(presupuesto.totalFinal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">IVA (21%)</dt>
              <dd>{formatCurrency(presupuesto.ivaEstimado)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-2 font-semibold">
              <dt>Total con IVA</dt>
              <dd>{formatCurrency(presupuesto.totalConIva)}</dd>
            </div>
          </dl>
        )}
      </section>

      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500">
        Documento generado por GNC Workshop. No reemplaza comprobantes fiscales.
      </footer>
    </div>
  )
}
