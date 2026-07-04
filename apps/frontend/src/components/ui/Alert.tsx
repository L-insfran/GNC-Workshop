import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const variantConfig: Record<
  AlertVariant,
  { icon: typeof Info; container: string; title: string }
> = {
  info: {
    icon: Info,
    container: 'border-sky-200 bg-sky-50 text-sky-800',
    title: 'text-sky-900',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    title: 'text-emerald-900',
  },
  warning: {
    icon: AlertCircle,
    container: 'border-amber-200 bg-amber-50 text-amber-800',
    title: 'text-amber-900',
  },
  error: {
    icon: XCircle,
    container: 'border-red-200 bg-red-50 text-red-800',
    title: 'text-red-900',
  },
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', config.container, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className={cn('font-medium', config.title)}>{title}</p>}
        <div className={title ? 'mt-1' : undefined}>{children}</div>
      </div>
    </div>
  )
}
