import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import type { IUser } from '@gnc/shared-types'
import { useUsers, useUserMutations } from '@/hooks/useUsers'
import { ROUTES } from '@/constants/routes'
import { ROLE_LABELS } from '@/constants/roles'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import type { ITableColumn } from '@/types'

export function UsuariosPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useUsers({ page, perPage: 10, search: search || undefined })
  const { remove } = useUserMutations()

  const columns: ITableColumn<IUser>[] = [
    { key: 'fullName', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    {
      key: 'roles',
      header: 'Roles',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map((role) => (
            <Badge key={role.id} variant="neutral">
              {ROLE_LABELS[role.name] ?? role.displayName}
            </Badge>
          ))}
        </div>
      ),
    },
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.CONFIG_USUARIO_EDIT(item.id))}
          >
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
      <Link
        to={ROUTES.CONFIGURACION}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a configuración
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Usuarios</h2>
          <p className="text-sm text-slate-500">Gestión de usuarios y permisos</p>
        </div>
        <Link to={ROUTES.CONFIG_USUARIO_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error">Error al cargar usuarios</Alert>}

      <Card>
        <TableToolbar search={search} onSearchChange={setSearch} placeholder="Buscar por nombre o email..." />
        <Table columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay usuarios" />
        {data?.meta && (
          <TablePagination meta={data.meta} onPageChange={setPage} />
        )}
      </Card>

      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Eliminar usuario"
        size="sm"
      >
        <p className="text-sm text-slate-600">¿Confirmás eliminar este usuario?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={remove.isPending}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
