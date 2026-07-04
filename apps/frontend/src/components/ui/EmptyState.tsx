import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-16 text-center', className)}>
      <div className="rounded-full bg-slate-100 p-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
