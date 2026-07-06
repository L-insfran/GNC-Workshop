import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import type { ICategoriaProducto } from '@gnc/shared-types'
import { useCategorias, useCategoriaMutations } from '@/hooks/useInventario'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { CatalogModal } from '@/components/configuracion/CatalogModal'
import { ApiError } from '@/services/api-client'
import type { ITableColumn } from '@/types'

export function CategoriasPage() {
  const [modal, setModal] = useState<ICategoriaProducto | 'new' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: categorias, isLoading } = useCategorias()
  const { create, update, remove } = useCategoriaMutations()

  const columns: ITableColumn<ICategoriaProducto>[] = [
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (item) => item.descripcion ?? '—',
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setModal(item)}>
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
    setDeleteError(null)
    try {
      await remove.mutateAsync(deleteId)
      setDeleteId(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Error al eliminar')
    }
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
          <h2 className="text-xl font-semibold text-slate-900">Categorías de productos</h2>
          <p className="text-sm text-slate-500">Clasificación del inventario</p>
        </div>
        <Button onClick={() => setModal('new')}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={categorias ?? []}
          isLoading={isLoading}
          emptyMessage="No hay categorías cargadas"
        />
      </Card>

      <CatalogModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Nueva categoría' : 'Editar categoría'}
        initialNombre={modal !== null && modal !== 'new' ? modal.nombre : ''}
        initialDescripcion={modal !== null && modal !== 'new' ? modal.descripcion ?? '' : ''}
        showDescripcion
        onSubmit={async (data) => {
          if (modal === 'new') {
            await create.mutateAsync(data)
          } else if (modal) {
            await update.mutateAsync({
              id: modal.id,
              data: { nombre: data.nombre, descripcion: data.descripcion ?? null },
            })
          }
        }}
      />

      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => {
          setDeleteId(null)
          setDeleteError(null)
        }}
        title="Eliminar categoría"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          ¿Confirmás eliminar esta categoría? Los productos quedarán sin categoría.
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
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
