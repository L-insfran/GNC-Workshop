import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import type { RoleName } from '@gnc/shared-types'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

interface RoleGuardProps {
  allowedRoles: RoleName[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { checkRole } = useAuth()

  if (!checkRole(allowedRoles)) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Acceso denegado">
          No tenés permisos para acceder a esta sección.
        </Alert>
      </div>
    )
  }

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
