import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeft, Wrench } from 'lucide-react'
import type { ITipoTrabajo } from '@gnc/shared-types'
import { useTiposTrabajoConfig, useTipoTrabajoMutations } from '@/hooks/useTiposTrabajo'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { TipoTrabajoModal } from '@/components/configuracion/TipoTrabajoModal'
import { ApiError } from '@/services/api-client'
import type { ITableColumn } from '@/types'

export function TiposTrabajoPage() {
  const [modal, setModal] = useState<ITipoTrabajo | 'new' | null>(null)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: tipos, isLoading } = useTiposTrabajoConfig()
  const { create, update, deactivate } = useTipoTrabajoMutations()

  const columns: ITableColumn<ITipoTrabajo>[] = [
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (item) => item.descripcion ?? '—',
    },
    {
      key: 'duracion',
      header: 'Duración (h)',
      render: (item) => item.duracionEstimadaHoras ?? '—',
    },
    {
      key: 'estado',
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
          <Link to={`${ROUTES.CONFIG_KITS}?tipo=${item.id}`}>
            <Button variant="ghost" size="sm" title="Gestionar kit">
              <Wrench className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setModal(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {item.isActive && (
            <Button variant="ghost" size="sm" onClick={() => setDeactivateId(item.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleDeactivate = async () => {
    if (!deactivateId) return
    setActionError(null)
    try {
      await deactivate.mutateAsync(deactivateId)
      setDeactivateId(null)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Error al desactivar')
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
          <h2 className="text-xl font-semibold text-slate-900">Tipos de trabajo</h2>
          <p className="text-sm text-slate-500">
            Catálogo de trabajos GNC. Cada tipo puede tener un kit de ítems asociado.
          </p>
        </div>
        <Button onClick={() => setModal('new')}>
          <Plus className="h-4 w-4" />
          Nuevo tipo
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={tipos ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          emptyTitle="No hay tipos de trabajo"
          emptyDescription="Creá el primer tipo para usarlo en órdenes y kits."
        />
      </Card>

      <TipoTrabajoModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Nuevo tipo de trabajo' : 'Editar tipo de trabajo'}
        tipo={modal !== null && modal !== 'new' ? modal : undefined}
        onSubmit={async (data) => {
          if (modal === 'new') {
            await create.mutateAsync({
              nombre: data.nombre,
              descripcion: data.descripcion,
              duracionEstimadaHoras: data.duracionEstimadaHoras,
            })
          } else if (modal) {
            await update.mutateAsync({
              id: modal.id,
              data: {
                nombre: data.nombre,
                descripcion: data.descripcion ?? null,
                duracionEstimadaHoras: data.duracionEstimadaHoras ?? null,
                isActive: data.isActive,
              },
            })
          }
        }}
      />

      <Modal
        isOpen={Boolean(deactivateId)}
        onClose={() => {
          setDeactivateId(null)
          setActionError(null)
        }}
        title="Desactivar tipo de trabajo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            El tipo quedará inactivo y no podrá usarse en nuevas órdenes. Las OT existentes no se
            modifican.
          </p>
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeactivateId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeactivate} isLoading={deactivate.isPending}>
              Desactivar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
