import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute, PublicRoute, RoleGuard } from '@/components/auth/ProtectedRoute'
import { MODULE_ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ClientesPage } from '@/pages/clientes/ClientesPage'
import { ClienteFormPage } from '@/pages/clientes/ClienteFormPage'
import { ClienteDetailPage } from '@/pages/clientes/ClienteDetailPage'
import { VehiculosPage } from '@/pages/vehiculos/VehiculosPage'
import { VehiculoFormPage } from '@/pages/vehiculos/VehiculoFormPage'
import { EquiposGncPage } from '@/pages/equipos-gnc/EquiposGncPage'
import { EquipoGncFormPage } from '@/pages/equipos-gnc/EquipoGncFormPage'
import { OrdenesTrabajoPage } from '@/pages/ordenes-trabajo/OrdenesTrabajoPage'
import { OrdenTrabajoFormPage } from '@/pages/ordenes-trabajo/OrdenTrabajoFormPage'
import { OrdenTrabajoDetailPage } from '@/pages/ordenes-trabajo/OrdenTrabajoDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route element={<RoleGuard allowedRoles={MODULE_ROLES.dashboard} />}>
            <Route index element={<DashboardPage />} />
          </Route>

          <Route path="clientes" element={<RoleGuard allowedRoles={MODULE_ROLES.clientes} />}>
            <Route index element={<ClientesPage />} />
            <Route path="nuevo" element={<ClienteFormPage />} />
            <Route path=":id" element={<ClienteDetailPage />} />
            <Route path=":id/editar" element={<ClienteFormPage />} />
          </Route>

          <Route path="vehiculos" element={<RoleGuard allowedRoles={MODULE_ROLES.vehiculos} />}>
            <Route index element={<VehiculosPage />} />
            <Route path="nuevo" element={<VehiculoFormPage />} />
            <Route path=":id/editar" element={<VehiculoFormPage />} />
          </Route>

          <Route path="equipos-gnc" element={<RoleGuard allowedRoles={MODULE_ROLES.equiposGnc} />}>
            <Route index element={<EquiposGncPage />} />
            <Route path="nuevo" element={<EquipoGncFormPage />} />
            <Route path=":id/editar" element={<EquipoGncFormPage />} />
          </Route>

          <Route path="ordenes-trabajo" element={<RoleGuard allowedRoles={MODULE_ROLES.ordenesTrabajo} />}>
            <Route index element={<OrdenesTrabajoPage />} />
            <Route path="nuevo" element={<OrdenTrabajoFormPage />} />
            <Route path=":id" element={<OrdenTrabajoDetailPage />} />
            <Route path=":id/editar" element={<OrdenTrabajoFormPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  )
}
