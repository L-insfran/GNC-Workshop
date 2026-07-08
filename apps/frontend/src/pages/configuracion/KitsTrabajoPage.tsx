import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import type { IKitTrabajoItem, OtItemTipo } from '@gnc/shared-types'
import { useTiposTrabajo } from '@/hooks/useOrdenesTrabajo'
import { useKitItems, useKitTrabajoMutations } from '@/hooks/useKitsTrabajo'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import {
  KitItemModal,
  KIT_ITEM_TIPO_LABELS,
  type KitItemFormData,
} from '@/components/configuracion/KitItemModal'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/format'
import { ApiError } from '@/services/api-client'

export function KitsTrabajoPage() {
  const [searchParams] = useSearchParams()
  const [selectedTipoId, setSelectedTipoId] = useState<string | null>(null)
  const [itemModal, setItemModal] = useState<IKitTrabajoItem | 'new' | null>(null)
  const [defaultTipo, setDefaultTipo] = useState<OtItemTipo>('servicio')
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: tiposTrabajo, isLoading: loadingTipos } = useTiposTrabajo()
  const { data: kitItems, isLoading: loadingItems } = useKitItems(selectedTipoId)
  const { create, update, remove } = useKitTrabajoMutations(selectedTipoId)

  useEffect(() => {
    const tipoFromUrl = searchParams.get('tipo')
    if (tipoFromUrl && tiposTrabajo?.some((t) => t.id === tipoFromUrl)) {
      setSelectedTipoId(tipoFromUrl)
    }
  }, [searchParams, tiposTrabajo])

  const selectedTipo = tiposTrabajo?.find((t) => t.id === selectedTipoId)

  const handleSubmitItem = async (data: KitItemFormData) => {
    const payload = {
      tipo: data.tipo,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      precioUnitario: data.precioUnitario,
      productoId: data.productoId || undefined,
      esEstimado: true,
    }

    if (itemModal === 'new') {
      await create.mutateAsync(payload)
    } else if (itemModal) {
      await update.mutateAsync({
        itemId: itemModal.id,
        data: {
          ...payload,
          productoId: data.productoId || null,
        },
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteItemId) return
    setDeleteError(null)
    try {
      await remove.mutateAsync(deleteItemId)
      setDeleteItemId(null)
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
        <h2 className="text-xl font-semibold text-slate-900">Kits de trabajo</h2>
        <p className="text-sm text-slate-500">
          Plantillas de servicios y repuestos que se precargan al crear una OT
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tipos de trabajo" />
          <CardBody className="space-y-1 p-0">
            {loadingTipos && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Cargando…</p>
            )}
            {(tiposTrabajo ?? []).map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0',
                  selectedTipoId === tipo.id && 'bg-brand-50',
                )}
                onClick={() => setSelectedTipoId(tipo.id)}
              >
                <span className="text-sm font-medium text-slate-900">{tipo.nombre}</span>
              </button>
            ))}
            {!loadingTipos && tiposTrabajo?.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No hay tipos de trabajo cargados
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={selectedTipo ? `Kit: ${selectedTipo.nombre}` : 'Ítems del kit'}
            action={
              selectedTipoId ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDefaultTipo('servicio')
                      setItemModal('new')
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Servicio
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDefaultTipo('repuesto')
                      setItemModal('new')
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Repuesto
                  </Button>
                </div>
              ) : undefined
            }
          />
          <CardBody className="space-y-1 p-0">
            {!selectedTipoId && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Seleccioná un tipo de trabajo para ver o editar su kit
              </p>
            )}
            {selectedTipoId && loadingItems && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Cargando ítems…</p>
            )}
            {selectedTipoId &&
              !loadingItems &&
              (kitItems ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.descripcion}</p>
                    <p className="text-xs text-slate-500">
                      {KIT_ITEM_TIPO_LABELS[item.tipo]} · Cant. {item.cantidad}
                      {item.precioUnitario != null
                        ? ` · ${formatCurrency(Number(item.precioUnitario))}`
                        : ''}
                      {item.productoNombre ? ` · ${item.productoNombre}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setItemModal(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteItemId(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            {selectedTipoId && !loadingItems && kitItems?.length === 0 && (
              <Alert variant="info" className="m-4">
                Este tipo aún no tiene ítems. Agregá servicios o repuestos para precargar el
                presupuesto al crear una OT.
              </Alert>
            )}
          </CardBody>
        </Card>
      </div>

      <KitItemModal
        isOpen={itemModal !== null}
        onClose={() => setItemModal(null)}
        item={itemModal !== null && itemModal !== 'new' ? itemModal : undefined}
        defaultTipo={defaultTipo}
        onSubmit={handleSubmitItem}
        isSubmitting={create.isPending || update.isPending}
      />

      <Modal
        isOpen={Boolean(deleteItemId)}
        onClose={() => {
          setDeleteItemId(null)
          setDeleteError(null)
        }}
        title="Eliminar ítem del kit"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          ¿Confirmás eliminar este ítem? Las OT ya creadas no se modifican.
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteItemId(null)}>
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
