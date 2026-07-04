import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/constants/roles'
import { getInitials } from '@/utils/format'

interface TopbarProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {getInitials(user.fullName)}
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()} aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  )
}
