import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useVehiculos, useVehiculoMutations } from '@/hooks/useVehiculos'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { formatPatente, formatVehiculoMarcaModelo } from '@/utils/format'
import type { IVehiculo, ITableColumn } from '@/types'

export function VehiculosPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useVehiculos({ page, perPage: 10, search: search || undefined })
  const { remove } = useVehiculoMutations()

  const columns: ITableColumn<IVehiculo>[] = [
    {
      key: 'patente',
      header: 'Patente',
      render: (item) => formatPatente(item.patente),
    },
    {
      key: 'marca',
      header: 'Marca / Modelo',
      render: (item) => formatVehiculoMarcaModelo(item),
    },
    { key: 'anio', header: 'Año' },
    { key: 'tipoCombustible', header: 'Combustible' },
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
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.VEHICULO_EDIT(item.id))}>
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
          <h2 className="text-xl font-semibold text-slate-900">Vehículos</h2>
          <p className="text-sm text-slate-500">Flota de vehículos registrados</p>
        </div>
        <Link to={ROUTES.VEHICULO_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo vehículo
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error">Error al cargar vehículos.</Alert>}

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Buscar por patente..."
        />
        <Table
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
        />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Eliminar vehículo">
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
