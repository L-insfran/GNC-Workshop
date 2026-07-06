import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

interface CatalogModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialNombre?: string
  initialDescripcion?: string
  showDescripcion?: boolean
  onSubmit: (data: { nombre: string; descripcion?: string }) => Promise<void>
}

export function CatalogModal({
  isOpen,
  onClose,
  title,
  initialNombre = '',
  initialDescripcion = '',
  showDescripcion = false,
  onSubmit,
}: CatalogModalProps) {
  const [nombre, setNombre] = useState(initialNombre)
  const [descripcion, setDescripcion] = useState(initialDescripcion)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setNombre(initialNombre)
      setDescripcion(initialDescripcion)
      setError(null)
    }
  }, [isOpen, initialNombre, initialDescripcion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
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
        {showDescripcion && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
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
