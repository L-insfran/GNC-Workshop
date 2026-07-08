import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
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
      render: (item) => `$${Number(item.monto).toLocaleString('es-AR')}`,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Caja</h2>
          <p className="text-sm text-slate-500">{saldo?.cajaNombre ?? 'Caja principal'}</p>
        </div>
        <Link to={ROUTES.CAJA_MOVIMIENTO_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo movimiento
          </Button>
        </Link>
      </div>

      {saldoError && <Alert variant="error">Error al cargar saldo</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Saldo actual" value={`$${(saldo?.saldo ?? 0).toLocaleString('es-AR')}`} icon={Wallet} />
        <StatCard title="Ingresos" value={`$${(saldo?.ingresos ?? 0).toLocaleString('es-AR')}`} icon={TrendingUp} />
        <StatCard title="Egresos" value={`$${(saldo?.egresos ?? 0).toLocaleString('es-AR')}`} icon={TrendingDown} />
      </div>

      {arqueo && (
        <Card>
          <CardHeader title={`Arqueo del día (${arqueo.fecha})`} />
          <CardBody>
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-slate-500">Inicial</p>
                <p className="font-semibold">${arqueo.saldoInicial.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Ingresos hoy</p>
                <p className="font-semibold text-emerald-600">${arqueo.ingresos.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Egresos hoy</p>
                <p className="font-semibold text-red-600">${arqueo.egresos.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Final</p>
                <p className="font-semibold">${arqueo.saldoFinal.toLocaleString('es-AR')}</p>
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
