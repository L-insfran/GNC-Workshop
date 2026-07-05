import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeftRight } from 'lucide-react'
import { useProductos, useInventarioMutations, useAlertasStock } from '@/hooks/useInventario'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import type { IProducto } from '@gnc/shared-types'
import type { ITableColumn } from '@/types'

export function ProductosPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useProductos({ page, perPage: 10, search: search || undefined })
  const { data: alertas } = useAlertasStock()
  const { remove } = useInventarioMutations()

  const columns: ITableColumn<IProducto>[] = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'stockActual',
      header: 'Stock',
      render: (item) => (
        <Badge variant={item.stockActual <= item.stockMinimo ? 'danger' : 'success'}>
          {item.stockActual} {item.unidadMedida}
        </Badge>
      ),
    },
    {
      key: 'precioVenta',
      header: 'Precio venta',
      render: (item) => `$${Number(item.precioVenta).toLocaleString('es-AR')}`,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PRODUCTO_EDIT(item.id))}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Inventario</h2>
          <p className="text-sm text-slate-500">Productos y stock del depósito</p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.MOVIMIENTO_STOCK}>
            <Button variant="outline">
              <ArrowLeftRight className="h-4 w-4" />
              Movimiento
            </Button>
          </Link>
          <Link to={ROUTES.PRODUCTO_NEW}>
            <Button>
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </Link>
        </div>
      </div>

      {(alertas?.length ?? 0) > 0 && (
        <Alert variant="warning">{alertas!.length} producto(s) con stock bajo o en mínimo</Alert>
      )}

      {error && <Alert variant="error">Error al cargar productos</Alert>}

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />
        <Table
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          emptyTitle="No hay productos"
        />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Eliminar producto"
        description="¿Confirmás eliminar este producto?"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button
            variant="danger"
            isLoading={remove.isPending}
            onClick={async () => {
              if (!deleteId) return
              await remove.mutateAsync(deleteId)
              setDeleteId(null)
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
