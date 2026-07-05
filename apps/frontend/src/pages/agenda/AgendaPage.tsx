import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useTurnosPorFecha, useAgendaMutations } from '@/hooks/useAgenda'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import type { ITurno, TurnoEstado } from '@gnc/shared-types'
import type { ITableColumn } from '@/types'

const ESTADO_VARIANT: Record<TurnoEstado, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pendiente: 'warning',
  confirmado: 'success',
  cancelado: 'danger',
  completado: 'neutral',
}

export function AgendaPage() {
  const navigate = useNavigate()
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]!)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: turnos, isLoading, error } = useTurnosPorFecha(fecha)
  const { remove } = useAgendaMutations()

  const columns: ITableColumn<ITurno>[] = [
    {
      key: 'fechaHora',
      header: 'Hora',
      render: (item) =>
        new Date(item.fechaHora).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (item) => {
        const row = item as ITurno & { cliente?: { razonSocial?: string } }
        return row.clienteNombre ?? row.cliente?.razonSocial ?? item.clienteId.slice(0, 8)
      },
    },
    {
      key: 'vehiculo',
      header: 'Vehículo',
      render: (item) => {
        const row = item as ITurno & { vehiculo?: { patente?: string } }
        return row.vehiculoPatente ?? row.vehiculo?.patente ?? '—'
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item) => <Badge variant={ESTADO_VARIANT[item.estado]}>{item.estado}</Badge>,
    },
    { key: 'notas', header: 'Notas' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.TURNO_EDIT(item.id))}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Agenda</h2>
          <p className="text-sm text-slate-500">Turnos del taller</p>
        </div>
        <Link to={ROUTES.TURNO_NEW}>
          <Button>
            <Plus className="h-4 w-4" /> Nuevo turno
          </Button>
        </Link>
      </div>

      <div className="max-w-xs">
        <Input
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {error && <Alert variant="error">Error al cargar turnos</Alert>}

      <Card>
        <Table
          columns={columns}
          data={turnos ?? []}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          emptyTitle="No hay turnos para esta fecha"
        />
      </Card>

      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Eliminar turno"
        description="¿Confirmás eliminar este turno?"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button
            variant="danger"
            isLoading={remove.isPending}
            onClick={async () => {
              if (!deleteId) return
              await remove.mutateAsync(deleteId)
              setDeleteId(null)
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
