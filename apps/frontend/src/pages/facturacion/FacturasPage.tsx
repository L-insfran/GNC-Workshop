import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Ban } from 'lucide-react'
import { useFacturas, useFacturaMutations } from '@/hooks/useFacturacion'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import type { IFactura, FacturaEstado } from '@gnc/shared-types'
import type { ITableColumn } from '@/types'

const ESTADO_VARIANT: Record<FacturaEstado, 'neutral' | 'success' | 'danger'> = {
  borrador: 'neutral',
  emitida: 'success',
  anulada: 'danger',
}

export function FacturasPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [anularId, setAnularId] = useState<string | null>(null)

  const { data, isLoading, error } = useFacturas({ page, perPage: 10, search: search || undefined })
  const { anular } = useFacturaMutations()

  const columns: ITableColumn<IFactura>[] = [
    { key: 'numero', header: 'Número' },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (item) => {
        const row = item as IFactura & { cliente?: { razonSocial?: string } }
        return row.clienteNombre ?? row.cliente?.razonSocial ?? item.clienteId.slice(0, 8)
      },
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item) => item.tipo.replace('_', ' ').toUpperCase(),
    },
    {
      key: 'total',
      header: 'Total',
      render: (item) => `$${Number(item.total).toLocaleString('es-AR')}`,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item) => <Badge variant={ESTADO_VARIANT[item.estado]}>{item.estado}</Badge>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.FACTURA_DETAIL(item.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          {item.estado !== 'anulada' && (
            <Button variant="ghost" size="sm" onClick={() => setAnularId(item.id)}>
              <Ban className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Facturación</h2>
          <p className="text-sm text-slate-500">Comprobantes emitidos</p>
        </div>
        <Link to={ROUTES.FACTURA_NEW}>
          <Button>
            <Plus className="h-4 w-4" /> Nueva factura
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error">Error al cargar facturas</Alert>}

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
        />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={Boolean(anularId)}
        onClose={() => setAnularId(null)}
        title="Anular factura"
        description="¿Confirmás anular esta factura?"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAnularId(null)}>Cancelar</Button>
          <Button
            variant="danger"
            isLoading={anular.isPending}
            onClick={async () => {
              if (!anularId) return
              await anular.mutateAsync(anularId)
              setAnularId(null)
            }}
          >
            Anular
          </Button>
        </div>
      </Modal>
    </div>
  )
}
