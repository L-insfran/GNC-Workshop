import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Printer } from 'lucide-react'
import type { IOtItem, OrdenEstado, OtItemTipo } from '@gnc/shared-types'
import { OT_ESTADOS_CON_RESERVA_STOCK, OT_ITEM_DELETABLE_ESTADOS, OT_ITEM_EDITABLE_ESTADOS } from '@gnc/shared-types'
import { useOtItemMutations, useOtPresupuesto } from '@/hooks/useOtItems'
import { useAuth } from '@/hooks/useAuth'
import { MODULE_ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { OtItemFormModal, OT_ITEM_TIPO_LABELS, type OtItemFormData } from '@/components/ordenes-trabajo/OtItemFormModal'
import { formatCurrency, formatPercent } from '@/utils/format'
import { ApiError } from '@/services/api-client'
import type { ITableColumn } from '@/types'

interface OtPresupuestoSectionProps {
  ordenTrabajoId: string
  ordenEstado: OrdenEstado
}

function puedeEditarPorEstado(estado: OrdenEstado): boolean {
  return (OT_ITEM_EDITABLE_ESTADOS as readonly OrdenEstado[]).includes(estado)
}

function puedeEliminarPorEstado(estado: OrdenEstado): boolean {
  return (OT_ITEM_DELETABLE_ESTADOS as readonly OrdenEstado[]).includes(estado)
}

export function OtPresupuestoSection({ ordenTrabajoId, ordenEstado }: OtPresupuestoSectionProps) {
  const { data: presupuesto, isLoading, error, refetch } = useOtPresupuesto(ordenTrabajoId)
  const { create, update, remove } = useOtItemMutations(ordenTrabajoId)
  const { checkRole } = useAuth()
  const puedeVerMargen = checkRole(MODULE_ROLES.margenOt)

  const puedeEditar = presupuesto?.puedeEditar ?? puedeEditarPorEstado(ordenEstado)
  const puedeEliminar = presupuesto?.puedeEliminar ?? puedeEliminarPorEstado(ordenEstado)
  const stockReservadoActivo = (OT_ESTADOS_CON_RESERVA_STOCK as readonly OrdenEstado[]).includes(
    ordenEstado,
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [defaultTipo] = useState<OtItemTipo>('servicio')
  const [editingItem, setEditingItem] = useState<IOtItem | undefined>()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error
        ? 'No se pudo cargar el presupuesto.'
        : null

  const openCreate = () => {
    setEditingItem(undefined)
    setModalOpen(true)
  }

  const openEdit = (item: IOtItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleSubmit = async (data: OtItemFormData) => {
    const payload = {
      tipo: data.tipo,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      precioUnitario: data.precioUnitario,
      productoId: data.productoId || undefined,
    }

    if (editingItem) {
      await update.mutateAsync({
        itemId: editingItem.id,
        data: {
          ...payload,
          productoId: data.productoId || null,
        },
      })
    } else {
      await create.mutateAsync(payload)
    }
    await refetch()
  }

  const columns: ITableColumn<IOtItem>[] = [
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item) => OT_ITEM_TIPO_LABELS[item.tipo],
    },
    { key: 'descripcion', header: 'Descripción', render: (item) => (
        <div>
          <span>{item.descripcion}</span>
          {item.productoId && item.productoNombre && (
            <p className="text-xs text-slate-500">
              Inventario:{' '}
              <Link
                to={ROUTES.PRODUCTO_DETAIL(item.productoId)}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                {item.productoNombre}
              </Link>
            </p>
          )}
          {!item.productoId && item.productoNombre && (
            <p className="text-xs text-slate-500">Inventario: {item.productoNombre}</p>
          )}
        </div>
      ) },
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
    ...(puedeVerMargen
      ? [
          {
            key: 'margenSubtotal',
            header: 'Margen',
            render: (item: IOtItem) =>
              item.margenSubtotal === null || item.margenSubtotal === undefined ? (
                <span className="text-sm text-slate-400">—</span>
              ) : (
                formatCurrency(item.margenSubtotal)
              ),
          } satisfies ITableColumn<IOtItem>,
        ]
      : []),
    {
      key: 'actions',
      header: '',
      render: (item) =>
        puedeEditar ? (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {puedeEliminar && (
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
            <div className="flex flex-wrap gap-2">
              <Link to={ROUTES.ORDEN_TRABAJO_PRINT(ordenTrabajoId)}>
                <Button size="sm" variant="outline">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </Link>
              {puedeEditar ? (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Agregar ítem
                </Button>
              ) : null}
            </div>
          }
        />
        <CardBody className="space-y-4">
          {stockReservadoActivo && (
            <Alert variant="info">
              Los repuestos y materiales de esta OT tienen stock reservado en depósito.
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="error">
              {errorMessage}
              {error instanceof ApiError && error.code === 'OT_ITEMS_SIN_MIGRAR' && (
                <span className="mt-1 block text-xs">
                  Ejecutá en el backend: <code className="rounded bg-red-100 px-1">node ace migration:run</code>
                  {' '}o el SQL en{' '}
                  <code className="rounded bg-red-100 px-1">database/scripts/006_create_ot_items_manual.sql</code>
                </span>
              )}
            </Alert>
          )}

          <Table
            columns={columns}
            data={presupuesto?.items ?? []}
            isLoading={isLoading}
            keyExtractor={(item) => item.id}
            emptyTitle="Sin ítems cargados"
            emptyDescription={
              puedeEditar
                ? 'Usá el botón Agregar ítem para incluir servicios, repuestos o materiales.'
                : 'El presupuesto no admite cambios en el estado actual de la orden.'
            }
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

              {puedeVerMargen && presupuesto.margen && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="mb-2 text-sm font-medium text-slate-700">Margen estimado</p>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div className="flex justify-between sm:block">
                      <dt className="text-sm text-slate-500">Ingreso servicios</dt>
                      <dd className="text-sm text-slate-900">
                        {formatCurrency(presupuesto.margen.ingresoServicios)}
                      </dd>
                    </div>
                    <div className="flex justify-between sm:block">
                      <dt className="text-sm text-slate-500">Ingreso repuestos</dt>
                      <dd className="text-sm text-slate-900">
                        {formatCurrency(presupuesto.margen.ingresoRepuestos)}
                      </dd>
                    </div>
                    <div className="flex justify-between sm:block">
                      <dt className="text-sm text-slate-500">Costo repuestos</dt>
                      <dd className="text-sm text-slate-900">
                        {formatCurrency(presupuesto.margen.costoRepuestos)}
                      </dd>
                    </div>
                    <div className="flex justify-between sm:block">
                      <dt className="text-sm font-medium text-slate-700">Margen bruto</dt>
                      <dd className="text-sm font-semibold text-emerald-700">
                        {formatCurrency(presupuesto.margen.margenBruto)}{' '}
                        <span className="font-normal text-slate-500">
                          ({formatPercent(presupuesto.margen.margenPorcentaje)})
                        </span>
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-slate-500">
                    El costo se calcula con el precio de compra del inventario. Repuestos sin
                    producto vinculado no aportan costo conocido.
                  </p>
                </div>
              )}
            </div>
          )}

          {!puedeEditar && (
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
        ordenEstado={ordenEstado}
        onSubmit={handleSubmit}
        isSubmitting={create.isPending || update.isPending}
      />
    </>
  )
}
