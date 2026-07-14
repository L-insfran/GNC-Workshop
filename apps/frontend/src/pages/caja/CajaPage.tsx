import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Wallet, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react'
import { useCajaSaldo, useCajaMovimientos, useArqueo } from '@/hooks/useCaja'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { Table, TablePagination } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import type { ICajaMovimiento } from '@gnc/shared-types'
import type { ITableColumn } from '@/types'
import { MovimientoVinculo } from '@/components/caja/MovimientoVinculo'
import { formatCurrency } from '@/utils/format'

export function CajaPage() {
  const [page, setPage] = useState(1)
  const { data: saldo, error: saldoError } = useCajaSaldo()
  const { data: movimientos, isLoading } = useCajaMovimientos({ page, perPage: 10 })
  const { data: arqueo } = useArqueo()

  const columns: ITableColumn<ICajaMovimiento>[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (item) => new Date(item.createdAt).toLocaleString('es-AR'),
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
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Caja</h2>
          <p className="text-sm text-slate-500">{saldo?.cajaNombre ?? 'Caja principal'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.CAJA_ARQUEO}>
            <Button variant="outline">
              <CalendarDays className="h-4 w-4" />
              Arqueo
            </Button>
          </Link>
          <Link to={ROUTES.CAJA_MOVIMIENTO_NEW}>
            <Button>
              <Plus className="h-4 w-4" />
              Nuevo movimiento
            </Button>
          </Link>
        </div>
      </div>

      {saldoError && <Alert variant="error">Error al cargar saldo</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Saldo actual" value={formatCurrency(saldo?.saldo ?? 0)} icon={Wallet} />
        <StatCard title="Ingresos" value={formatCurrency(saldo?.ingresos ?? 0)} icon={TrendingUp} />
        <StatCard title="Egresos" value={formatCurrency(saldo?.egresos ?? 0)} icon={TrendingDown} />
      </div>

      {arqueo && (
        <Card>
          <CardHeader
            title={`Arqueo del día (${arqueo.fecha})`}
            action={
              <Link to={ROUTES.CAJA_ARQUEO}>
                <Button variant="outline" size="sm">
                  Ver detalle
                </Button>
              </Link>
            }
          />
          <CardBody>
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-slate-500">Inicial</p>
                <p className="font-semibold">{formatCurrency(arqueo.saldoInicial)}</p>
              </div>
              <div>
                <p className="text-slate-500">Ingresos hoy</p>
                <p className="font-semibold text-emerald-600">{formatCurrency(arqueo.ingresos)}</p>
              </div>
              <div>
                <p className="text-slate-500">Egresos hoy</p>
                <p className="font-semibold text-red-600">{formatCurrency(arqueo.egresos)}</p>
              </div>
              <div>
                <p className="text-slate-500">Final</p>
                <p className="font-semibold">{formatCurrency(arqueo.saldoFinal)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Movimientos" />
        <Table
          columns={columns}
          data={movimientos?.data ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
        />
        <TablePagination meta={movimientos?.meta} onPageChange={setPage} />
      </Card>
    </div>
  )
}
