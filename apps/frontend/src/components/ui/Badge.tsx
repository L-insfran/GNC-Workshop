import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-600/20',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function getOrdenEstadoBadgeVariant(estado: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    borrador: 'neutral',
    recepcion: 'info',
    en_taller: 'default',
    en_espera_repuesto: 'warning',
    control_calidad: 'info',
    finalizada: 'success',
    entregada: 'success',
    cancelada: 'danger',
  }
  return map[estado] ?? 'neutral'
}

export function getVencimientoBadgeVariant(nivel: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    info: 'info',
    warning: 'warning',
    danger: 'danger',
  }
  return map[nivel] ?? 'neutral'
}
