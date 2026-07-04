import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { useClientes, useClienteMutations } from '@/hooks/useClientes'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { CLIENTE_TIPO_LABELS, DOCUMENTO_TIPO_LABELS } from '@/utils/format'
import type { ICliente, ITableColumn } from '@/types'

export function ClientesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useClientes({ page, perPage: 10, search: search || undefined })
  const { remove } = useClienteMutations()

  const columns: ITableColumn<ICliente>[] = [
    { key: 'razonSocial', header: 'Razón social' },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item) => CLIENTE_TIPO_LABELS[item.tipo],
    },
    {
      key: 'documento',
      header: 'Documento',
      render: (item) => `${DOCUMENTO_TIPO_LABELS[item.documentoTipo]} ${item.documentoNumero}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono' },
    {
      key: 'isActive',
      header: 'Estado',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'neutral'}>
          {item.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.CLIENTE_DETAIL(item.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.CLIENTE_EDIT(item.id))}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    await remove.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clientes</h2>
          <p className="text-sm text-slate-500">Gestión de clientes del taller</p>
        </div>
        <Link to={ROUTES.CLIENTE_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error">Error al cargar clientes. Intentá nuevamente.</Alert>
      )}

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Buscar por nombre, documento..."
        />
        <Table
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          emptyTitle="No hay clientes"
          emptyDescription="Creá el primer cliente del taller."
        />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Eliminar cliente"
        description="Esta acción no se puede deshacer."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" isLoading={remove.isPending} onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
