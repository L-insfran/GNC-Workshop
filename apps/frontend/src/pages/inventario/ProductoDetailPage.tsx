import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowLeftRight, Pencil } from 'lucide-react'
import type { IStockMovimiento, StockMovimientoTipo } from '@gnc/shared-types'
import { useProducto, useMovimientosStock, useStockDisponibilidad } from '@/hooks/useInventario'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination } from '@/components/ui/Table'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { ITableColumn } from '@/types'

const TIPO_LABELS: Record<StockMovimientoTipo, string> = {
  ingreso: 'Ingreso',
  egreso: 'Egreso',
  ajuste: 'Ajuste',
}

const TIPO_VARIANT: Record<StockMovimientoTipo, 'success' | 'danger' | 'warning'> = {
  ingreso: 'success',
  egreso: 'danger',
  ajuste: 'warning',
}

export function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movPage, setMovPage] = useState(1)

  const { data: producto, isLoading, error } = useProducto(id)
  const { data: disponibilidad } = useStockDisponibilidad(id)
  const { data: movimientos, isLoading: movimientosLoading } = useMovimientosStock({
    productoId: id,
    page: movPage,
    perPage: 10,
  })

  if (isLoading) return <PageLoader />

  if (error || !producto) {
    return <Alert variant="error">No se pudo cargar el producto.</Alert>
  }

  const movimientoColumns: ITableColumn<IStockMovimiento>[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (item) => formatDateTime(item.createdAt),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item) => <Badge variant={TIPO_VARIANT[item.tipo]}>{TIPO_LABELS[item.tipo]}</Badge>,
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      render: (item) => `${item.cantidad} ${producto.unidadMedida}`,
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (item) => item.motivo ?? '-',
    },
    {
      key: 'userNombre',
      header: 'Usuario',
      render: (item) => item.userNombre ?? '-',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.INVENTARIO}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a inventario
        </Link>
        <div className="flex gap-2">
          <Link to={ROUTES.MOVIMIENTO_STOCK_PRODUCTO(producto.id, { tipo: 'ingreso' })}>
            <Button variant="outline" size="sm">
              <ArrowLeftRight className="h-4 w-4" />
              Movimiento
            </Button>
          </Link>
          <Button size="sm" onClick={() => navigate(ROUTES.PRODUCTO_EDIT(producto.id))}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`${producto.codigo} — ${producto.nombre}`}
          description={producto.categoriaNombre ?? 'Sin categoría'}
          action={
            <Badge variant={producto.isActive ? 'success' : 'neutral'}>
              {producto.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          }
        />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Stock actual</dt>
              <dd className="mt-1">
                <Badge variant={producto.stockActual <= producto.stockMinimo ? 'danger' : 'success'}>
                  {producto.stockActual} {producto.unidadMedida}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Stock disponible</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {disponibilidad?.stockDisponible ?? producto.stockActual} {producto.unidadMedida}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Stock reservado</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {disponibilidad?.stockReservado ?? disponibilidad?.stockComprometido ?? 0}{' '}
                {producto.unidadMedida}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Stock mínimo</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {producto.stockMinimo} {producto.unidadMedida}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Precio compra</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatCurrency(Number(producto.precioCompra))}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Precio venta</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {formatCurrency(Number(producto.precioVenta))}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Kardex de movimientos" description="Historial de ingresos, egresos y ajustes" />
        <CardBody>
          <Table
            columns={movimientoColumns}
            data={movimientos?.data ?? []}
            isLoading={movimientosLoading}
            keyExtractor={(item) => item.id}
            emptyTitle="Sin movimientos"
            emptyDescription="Registrá un ingreso para comenzar el historial de stock."
          />
          <TablePagination meta={movimientos?.meta} onPageChange={setMovPage} />
        </CardBody>
      </Card>
    </div>
  )
}
