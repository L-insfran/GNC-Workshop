import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import type { ICajaMovimiento } from '@gnc/shared-types'
import { useArqueo } from '@/hooks/useCaja'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { MovimientoVinculo } from '@/components/caja/MovimientoVinculo'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { ITableColumn } from '@/types'

function todayIsoDate() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}

export function ArqueoCajaPage() {
  const [fecha, setFecha] = useState(todayIsoDate())
  const { data: arqueo, isLoading, error } = useArqueo(fecha)

  const columns: ITableColumn<ICajaMovimiento>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Hora',
        render: (item) => formatDateTime(item.createdAt),
      },
      {
        key: 'tipo',
        header: 'Tipo',
        render: (item) => (
          <Badge variant={item.tipo === 'ingreso' ? 'success' : 'danger'}>
            {item.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </Badge>
        ),
      },
      { key: 'concepto', header: 'Concepto' },
      {
        key: 'vinculo',
        header: 'Vinculado a',
        render: (item) => (
          <MovimientoVinculo
            facturaId={item.facturaId}
            facturaNumero={item.facturaNumero}
            ordenTrabajoId={item.ordenTrabajoId}
            ordenTrabajoNumero={item.ordenTrabajoNumero}
          />
        ),
      },
      {
        key: 'monto',
        header: 'Monto',
        render: (item) => formatCurrency(Number(item.monto)),
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={ROUTES.CAJA}
            className="mb-2 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a caja
          </Link>
          <h2 className="text-xl font-semibold text-slate-900">Arqueo de caja</h2>
          <p className="text-sm text-slate-500">Resumen de movimientos y saldos del día</p>
        </div>
        <div className="flex items-end gap-2">
          <Input
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Button variant="outline" onClick={() => setFecha(todayIsoDate())}>
            <CalendarDays className="h-4 w-4" />
            Hoy
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">No se pudo cargar el arqueo.</Alert>}
      {isLoading && <PageLoader />}

      {arqueo && !isLoading && (
        <>
          <Card>
            <CardHeader
              title={`Arqueo ${arqueo.fecha}`}
              description={arqueo.cajaNombre}
            />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Saldo inicial</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(arqueo.saldoInicial)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Ingresos</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-600">
                    {formatCurrency(arqueo.ingresos)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Egresos</p>
                  <p className="mt-1 text-lg font-semibold text-red-600">
                    {formatCurrency(arqueo.egresos)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Saldo final</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(arqueo.saldoFinal)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Movimientos del día"
              description={`${arqueo.movimientos.length} movimiento(s)`}
            />
            <Table
              columns={columns}
              data={arqueo.movimientos}
              keyExtractor={(item) => item.id}
              emptyTitle="Sin movimientos"
              emptyDescription="No hubo movimientos de caja en esta fecha."
            />
          </Card>
        </>
      )}
    </div>
  )
}
