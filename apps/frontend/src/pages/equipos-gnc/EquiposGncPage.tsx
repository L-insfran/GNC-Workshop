import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useEquiposGnc, useEquipoGncMutations } from '@/hooks/useEquiposGnc'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TablePagination, TableToolbar } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { formatDate } from '@/utils/format'
import type { IEquipoGnc, ITableColumn } from '@/types'

const estadoLabels: Record<string, string> = {
  activo: 'Activo',
  vencido: 'Vencido',
  desinstalado: 'Desinstalado',
  en_revision: 'En revisión',
}

const estadoVariant: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
  activo: 'success',
  vencido: 'danger',
  desinstalado: 'neutral',
  en_revision: 'warning',
}

export function EquiposGncPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useEquiposGnc({ page, perPage: 10, search: search || undefined })
  const { remove } = useEquipoGncMutations()

  const columns: ITableColumn<IEquipoGnc>[] = [
    { key: 'numeroSerieEquipo', header: 'N° serie' },
    {
      key: 'regulador',
      header: 'Regulador',
      render: (item) => `${item.marcaRegulador} ${item.modeloRegulador}`,
    },
    {
      key: 'fechaVencimientoOblea',
      header: 'Venc. oblea',
      render: (item) => formatDate(item.fechaVencimientoOblea),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item) => (
        <Badge variant={estadoVariant[item.estado] ?? 'neutral'}>
          {estadoLabels[item.estado] ?? item.estado}
        </Badge>
      ),
    },
    {
      key: 'cilindros',
      header: 'Cilindros',
      render: (item) => item.cilindros?.length ?? 0,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.EQUIPO_GNC_EDIT(item.id))}>
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
          <h2 className="text-xl font-semibold text-slate-900">Equipos GNC</h2>
          <p className="text-sm text-slate-500">Equipos instalados y certificaciones</p>
        </div>
        <Link to={ROUTES.EQUIPO_GNC_NEW}>
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo equipo
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error">Error al cargar equipos GNC.</Alert>}

      <Card>
        <TableToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Buscar por número de serie..."
        />
        <Table columns={columns} data={data?.data ?? []} isLoading={isLoading} keyExtractor={(item) => item.id} />
        <TablePagination meta={data?.meta} onPageChange={setPage} />
      </Card>

      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Eliminar equipo GNC">
        <p className="mb-4 text-sm text-slate-600">
          El equipo y sus cilindros se archivarán. Podrás reutilizar los números de serie en registros nuevos.
        </p>
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
