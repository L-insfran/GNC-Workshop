import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import {
  OT_CONTROL_CALIDAD_CHECKS,
  type OrdenEstado,
  type OtControlCalidadCheckKey,
} from '@gnc/shared-types'
import { useOtControlCalidad, useOtControlCalidadMutations } from '@/hooks/useOtControlCalidad'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { ApiError } from '@/services/api-client'
import { formatDateTime } from '@/utils/format'

const checklistSchema = z.object({
  sinFugas: z.boolean(),
  presionReguladorOk: z.boolean(),
  valvulasSeguridadOk: z.boolean(),
  estanqueidadOk: z.boolean(),
  documentacionCompleta: z.boolean(),
  observaciones: z.string().max(1000).optional(),
})

type ChecklistFormData = z.infer<typeof checklistSchema>

interface OtControlCalidadSectionProps {
  ordenTrabajoId: string
  ordenEstado: OrdenEstado
}

export function OtControlCalidadSection({
  ordenTrabajoId,
  ordenEstado,
}: OtControlCalidadSectionProps) {
  const enabled = ordenEstado === 'control_calidad'
  const { data: registro, isLoading } = useOtControlCalidad(ordenTrabajoId, enabled)
  const { upsert } = useOtControlCalidadMutations(ordenTrabajoId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      sinFugas: false,
      presionReguladorOk: false,
      valvulasSeguridadOk: false,
      estanqueidadOk: false,
      documentacionCompleta: false,
      observaciones: '',
    },
  })

  useEffect(() => {
    if (!registro) return
    reset({
      sinFugas: registro.sinFugas,
      presionReguladorOk: registro.presionReguladorOk,
      valvulasSeguridadOk: registro.valvulasSeguridadOk,
      estanqueidadOk: registro.estanqueidadOk,
      documentacionCompleta: registro.documentacionCompleta,
      observaciones: registro.observaciones ?? '',
    })
  }, [registro, reset])

  if (!enabled) return null
  if (isLoading) return <PageLoader />

  const values = watch()
  const checksCompletos = OT_CONTROL_CALIDAD_CHECKS.every(
    (check) => values[check.key as OtControlCalidadCheckKey],
  )

  const onSubmit = async (data: ChecklistFormData) => {
    await upsert.mutateAsync(data)
  }

  return (
    <Card className="border-sky-200 bg-sky-50/30">
      <CardHeader
        title="Control de calidad"
        description="Completá el checklist antes de finalizar la orden"
        action={
          registro?.completo ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Aprobado
            </span>
          ) : undefined
        }
      />
      <CardBody className="space-y-4">
        {!checksCompletos && (
          <Alert variant="warning">
            Marcá todos los ítems del checklist para poder pasar la OT a finalizada.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            {OT_CONTROL_CALIDAD_CHECKS.map((check) => (
              <label
                key={check.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  {...register(check.key as OtControlCalidadCheckKey)}
                />
                <span className="text-sm text-slate-800">{check.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Observaciones</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Notas del control de calidad (opcional)"
              {...register('observaciones')}
            />
            {errors.observaciones && (
              <p className="mt-1 text-xs text-red-600">{errors.observaciones.message}</p>
            )}
          </div>

          {registro?.completo && registro.aprobadoPorNombre && registro.aprobadoAt && (
            <p className="text-xs text-slate-500">
              Aprobado por {registro.aprobadoPorNombre} el {formatDateTime(registro.aprobadoAt)}
            </p>
          )}

          {upsert.isError && upsert.error instanceof ApiError && (
            <Alert variant="error">{upsert.error.message}</Alert>
          )}

          <div className="flex justify-end">
            <Button type="submit" isLoading={upsert.isPending}>
              Guardar checklist
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
