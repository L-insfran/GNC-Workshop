import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import type { IVehiculoMarca, IVehiculoModelo } from '@gnc/shared-types'
import {
  useVehiculoMarcas,
  useVehiculoModelos,
  useVehiculoCatalogMutations,
} from '@/hooks/useVehiculos'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CatalogModal } from '@/components/configuracion/CatalogModal'
import { cn } from '@/utils/cn'
import { ApiError } from '@/services/api-client'

export function MarcasModelosPage() {
  const [selectedMarcaId, setSelectedMarcaId] = useState<string | null>(null)
  const [marcaModal, setMarcaModal] = useState<IVehiculoMarca | 'new' | null>(null)
  const [modeloModal, setModeloModal] = useState<IVehiculoModelo | 'new' | null>(null)
  const [deleteMarcaId, setDeleteMarcaId] = useState<string | null>(null)
  const [deleteModeloId, setDeleteModeloId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: marcas } = useVehiculoMarcas()
  const { data: modelos } = useVehiculoModelos(selectedMarcaId ?? undefined)
  const { createMarca, updateMarca, removeMarca, createModelo, updateModelo, removeModelo } =
    useVehiculoCatalogMutations()

  const selectedMarca = marcas?.find((m) => m.id === selectedMarcaId)

  const handleDeleteMarca = async () => {
    if (!deleteMarcaId) return
    setDeleteError(null)
    try {
      await removeMarca.mutateAsync(deleteMarcaId)
      if (selectedMarcaId === deleteMarcaId) setSelectedMarcaId(null)
      setDeleteMarcaId(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Error al eliminar')
    }
  }

  const handleDeleteModelo = async () => {
    if (!deleteModeloId) return
    setDeleteError(null)
    try {
      await removeModelo.mutateAsync(deleteModeloId)
      setDeleteModeloId(null)
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

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Marcas y modelos</h2>
        <p className="text-sm text-slate-500">Catálogo de vehículos del taller</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Marcas"
            action={
              <Button size="sm" onClick={() => setMarcaModal('new')}>
                <Plus className="h-4 w-4" />
                Nueva marca
              </Button>
            }
          />
          <CardBody className="space-y-1 p-0">
            {(marcas ?? []).map((marca) => (
              <div
                key={marca.id}
                className={cn(
                  'flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0',
                  selectedMarcaId === marca.id && 'bg-brand-50',
                )}
              >
                <button
                  type="button"
                  className="flex-1 text-left text-sm font-medium text-slate-900"
                  onClick={() => setSelectedMarcaId(marca.id)}
                >
                  {marca.nombre}
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setMarcaModal(marca)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteMarcaId(marca.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {marcas?.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No hay marcas cargadas</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={selectedMarca ? `Modelos de ${selectedMarca.nombre}` : 'Modelos'}
            action={
              selectedMarcaId ? (
                <Button size="sm" onClick={() => setModeloModal('new')}>
                  <Plus className="h-4 w-4" />
                  Nuevo modelo
                </Button>
              ) : undefined
            }
          />
          <CardBody className="space-y-1 p-0">
            {!selectedMarcaId && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Seleccioná una marca para ver sus modelos
              </p>
            )}
            {selectedMarcaId &&
              (modelos ?? []).map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <span className="text-sm text-slate-900">{modelo.nombre}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setModeloModal(modelo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteModeloId(modelo.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            {selectedMarcaId && modelos?.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Esta marca no tiene modelos
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <CatalogModal
        isOpen={marcaModal !== null}
        onClose={() => setMarcaModal(null)}
        title={marcaModal === 'new' ? 'Nueva marca' : 'Editar marca'}
        initialNombre={marcaModal !== null && marcaModal !== 'new' ? marcaModal.nombre : ''}
        onSubmit={async (data) => {
          if (marcaModal === 'new') {
            await createMarca.mutateAsync(data)
          } else if (marcaModal) {
            await updateMarca.mutateAsync({ id: marcaModal.id, data })
          }
        }}
      />

      <CatalogModal
        isOpen={modeloModal !== null}
        onClose={() => setModeloModal(null)}
        title={modeloModal === 'new' ? 'Nuevo modelo' : 'Editar modelo'}
        initialNombre={modeloModal !== null && modeloModal !== 'new' ? modeloModal.nombre : ''}
        onSubmit={async (data) => {
          if (!selectedMarcaId) return
          if (modeloModal === 'new') {
            await createModelo.mutateAsync({ marcaId: selectedMarcaId, nombre: data.nombre })
          } else if (modeloModal) {
            await updateModelo.mutateAsync({ id: modeloModal.id, data: { nombre: data.nombre } })
          }
        }}
      />

      <Modal
        isOpen={Boolean(deleteMarcaId)}
        onClose={() => {
          setDeleteMarcaId(null)
          setDeleteError(null)
        }}
        title="Eliminar marca"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          ¿Confirmás eliminar esta marca? No se puede eliminar si tiene modelos o vehículos asociados.
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteMarcaId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteMarca} isLoading={removeMarca.isPending}>
            Eliminar
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteModeloId)}
        onClose={() => {
          setDeleteModeloId(null)
          setDeleteError(null)
        }}
        title="Eliminar modelo"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          ¿Confirmás eliminar este modelo? No se puede eliminar si tiene vehículos asociados.
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteModeloId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteModelo} isLoading={removeModelo.isPending}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
