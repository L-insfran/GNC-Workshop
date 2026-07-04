import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-elevated',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}
        </div>
        <div className="rounded-lg bg-brand-50 p-2.5">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
    </div>
  )
}
