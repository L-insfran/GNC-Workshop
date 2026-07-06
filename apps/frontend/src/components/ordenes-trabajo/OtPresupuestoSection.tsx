import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { IOtItem, OtItemTipo } from '@gnc/shared-types'
import { useOtItemMutations, useOtPresupuesto } from '@/hooks/useOtItems'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { OtItemFormModal, OT_ITEM_TIPO_LABELS } from '@/components/ordenes-trabajo/OtItemFormModal'
import { formatCurrency } from '@/utils/format'
import type { ITableColumn } from '@/types'

interface OtPresupuestoSectionProps {
  ordenTrabajoId: string
}

export function OtPresupuestoSection({ ordenTrabajoId }: OtPresupuestoSectionProps) {
  const { data: presupuesto, isLoading, error } = useOtPresupuesto(ordenTrabajoId)
  const { create, update, remove } = useOtItemMutations(ordenTrabajoId)

  const [modalOpen, setModalOpen] = useState(false)
  const [defaultTipo, setDefaultTipo] = useState<OtItemTipo>('servicio')
  const [editingItem, setEditingItem] = useState<IOtItem | undefined>()

  const openCreate = (tipo: OtItemTipo) => {
    setEditingItem(undefined)
    setDefaultTipo(tipo)
    setModalOpen(true)
  }

  const openEdit = (item: IOtItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleSubmit = async (data: {
    tipo: OtItemTipo
    descripcion: string
    cantidad: number
    precioUnitario: number
  }) => {
    if (editingItem) {
      await update.mutateAsync({ itemId: editingItem.id, data })
    } else {
      await create.mutateAsync(data)
    }
  }

  const columns: ITableColumn<IOtItem>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item) => OT_ITEM_TIPO_LABELS[item.tipo],
    },
    { key: 'descripcion', header: 'Descripción' },
    {
      key: 'cantidad',
      header: 'Cant.',
      render: (item) => item.cantidad.toLocaleString('es-AR'),
    },
    {
      key: 'precioUnitario',
      header: 'P. unit.',
      render: (item) => formatCurrency(item.precioUnitario),
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      render: (item) => formatCurrency(item.subtotal),
    },
    {
      key: 'actions',
      header: '',
      render: (item) =>
        presupuesto?.puedeEditar ? (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {presupuesto.puedeEliminar && (
              <Button variant="ghost" size="sm" onClick={() => remove.mutate(item.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ) : null,
    },
  ]

  return (
    <>
      <Card>
        <CardHeader
          title="Presupuesto"
          description="Servicios y repuestos incluidos en la orden"
          action={
            presupuesto?.puedeEditar ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openCreate('servicio')}>
                  <Plus className="h-4 w-4" />
                  Servicio
                </Button>
                <Button size="sm" onClick={() => openCreate('repuesto')}>
                  <Plus className="h-4 w-4" />
                  Repuesto
                </Button>
              </div>
            ) : undefined
          }
        />
        <CardBody className="space-y-4">
          {error && <Alert variant="error">No se pudo cargar el presupuesto.</Alert>}

          <Table
            columns={columns}
            data={presupuesto?.items ?? []}
            isLoading={isLoading}
            keyExtractor={(item) => item.id}
            emptyTitle="Sin ítems cargados"
            emptyDescription="Agregá servicios o repuestos para armar el presupuesto."
          />

          {presupuesto && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <dl className="grid gap-2 sm:grid-cols-2">
                <div className="flex justify-between sm:block">
                  <dt className="text-sm text-slate-500">Total estimado</dt>
                  <dd className="text-sm font-medium text-slate-900">
                    {formatCurrency(presupuesto.totalEstimado)}
                  </dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-sm text-slate-500">Total final</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    {formatCurrency(presupuesto.totalFinal)}
                  </dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-sm text-slate-500">IVA estimado (21%)</dt>
                  <dd className="text-sm text-slate-700">{formatCurrency(presupuesto.ivaEstimado)}</dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-sm font-medium text-slate-700">Total con IVA</dt>
                  <dd className="text-base font-semibold text-brand-700">
                    {formatCurrency(presupuesto.totalConIva)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {presupuesto && !presupuesto.puedeEditar && (
            <p className="text-xs text-slate-500">
              El presupuesto está cerrado en el estado actual de la orden.
            </p>
          )}
        </CardBody>
      </Card>

      <OtItemFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTipo={defaultTipo}
        item={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={create.isPending || update.isPending}
      />
    </>
  )
}
