import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  Gauge,
  ClipboardList,
  Wrench,
  Package,
  DollarSign,
  FileText,
  Calendar,
  Settings,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { MODULE_ROLES, ROLE_LABELS } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'
import type { RoleName } from '@gnc/shared-types'

interface NavItemConfig {
  label: string
  path: string
  icon: typeof LayoutDashboard
  roles: RoleName[]
}

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: MODULE_ROLES.dashboard },
  {
    label: 'Configuración',
    path: ROUTES.CONFIGURACION,
    icon: Settings,
    roles: MODULE_ROLES.configuracionAll,
  },
  { label: 'Clientes', path: ROUTES.CLIENTES, icon: Users, roles: MODULE_ROLES.clientes },
  { label: 'Vehículos', path: ROUTES.VEHICULOS, icon: Car, roles: MODULE_ROLES.vehiculos },
  { label: 'Equipos GNC', path: ROUTES.EQUIPOS_GNC, icon: Gauge, roles: MODULE_ROLES.equiposGnc },
  {
    label: 'Órdenes de Trabajo',
    path: ROUTES.ORDENES_TRABAJO,
    icon: ClipboardList,
    roles: MODULE_ROLES.ordenesTrabajo,
  },
  { label: 'Inventario', path: ROUTES.INVENTARIO, icon: Package, roles: MODULE_ROLES.inventario },
  { label: 'Caja', path: ROUTES.CAJA, icon: DollarSign, roles: MODULE_ROLES.caja },
  { label: 'Facturación', path: ROUTES.FACTURACION, icon: FileText, roles: MODULE_ROLES.facturacion },
  { label: 'Agenda', path: ROUTES.AGENDA, icon: Calendar, roles: MODULE_ROLES.agenda },
]

export function Sidebar() {
  const { user, checkRole } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => checkRole(item.roles))

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">GNC Workshop</p>
          <p className="text-xs text-slate-400">Gestión de taller</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <p className="mt-1 truncate text-xs text-brand-400">
            {ROLE_LABELS[user.role] ?? user.role}
          </p>
        </div>
      )}
    </aside>
  )
}
