import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'
import type { ITipoTrabajo } from '@gnc/shared-types'

export interface TipoTrabajoFormData {
  nombre: string
  descripcion?: string
  duracionEstimadaHoras?: number
  isActive?: boolean
}

interface TipoTrabajoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  tipo?: ITipoTrabajo
  onSubmit: (data: TipoTrabajoFormData) => Promise<void>
}

export function TipoTrabajoModal({
  isOpen,
  onClose,
  title,
  tipo,
  onSubmit,
}: TipoTrabajoModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [duracionHoras, setDuracionHoras] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setNombre(tipo?.nombre ?? '')
    setDescripcion(tipo?.descripcion ?? '')
    setDuracionHoras(
      tipo?.duracionEstimadaHoras !== undefined ? String(tipo.duracionEstimadaHoras) : '',
    )
    setIsActive(tipo?.isActive ?? true)
    setError(null)
  }, [isOpen, tipo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    const duracion = duracionHoras.trim() ? Number(duracionHoras) : undefined
    if (duracionHoras.trim() && (!duracion || duracion < 1)) {
      setError('La duración debe ser un número mayor a 0')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        duracionEstimadaHoras: duracion,
        isActive: tipo ? isActive : undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <Input
          label="Duración estimada (horas)"
          type="number"
          min={1}
          max={168}
          value={duracionHoras}
          onChange={(e) => setDuracionHoras(e.target.value)}
          placeholder="Ej: 8"
        />
        {tipo && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Activo para nuevas órdenes
          </label>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
