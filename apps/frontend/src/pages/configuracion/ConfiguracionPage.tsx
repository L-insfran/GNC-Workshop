import { Link } from 'react-router-dom'
import { Users, Car, Package, Settings } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Card, CardBody } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

const SECTIONS = [
  {
    title: 'Usuarios',
    description: 'Gestionar usuarios del sistema y asignar roles de acceso',
    path: ROUTES.CONFIG_USUARIOS,
    icon: Users,
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    title: 'Marcas y modelos',
    description: 'Catálogo de marcas y modelos de vehículos',
    path: ROUTES.CONFIG_MARCAS_MODELOS,
    icon: Car,
    roles: [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR],
  },
  {
    title: 'Categorías de productos',
    description: 'Clasificación de productos del inventario',
    path: ROUTES.CONFIG_CATEGORIAS,
    icon: Package,
    roles: [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR, ROLES.DEPOSITO],
  },
]

export function ConfiguracionPage() {
  const { checkRole } = useAuth()

  const visibleSections = SECTIONS.filter((section) => checkRole(section.roles))

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Configuración</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Administración de usuarios y catálogos del sistema
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSections.map((section) => (
          <Link key={section.path} to={section.path}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardBody className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <section.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{section.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
