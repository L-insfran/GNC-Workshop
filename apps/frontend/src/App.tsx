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
import { ProductosPage } from '@/pages/inventario/ProductosPage'
import { ProductoFormPage } from '@/pages/inventario/ProductoFormPage'
import { ProductoDetailPage } from '@/pages/inventario/ProductoDetailPage'
import { MovimientoPage } from '@/pages/inventario/MovimientoPage'
import { CajaPage } from '@/pages/caja/CajaPage'
import { MovimientoCajaFormPage } from '@/pages/caja/MovimientoCajaFormPage'
import { FacturasPage } from '@/pages/facturacion/FacturasPage'
import { FacturaFormPage } from '@/pages/facturacion/FacturaFormPage'
import { FacturaDetailPage } from '@/pages/facturacion/FacturaDetailPage'
import { AgendaPage } from '@/pages/agenda/AgendaPage'
import { TurnoFormPage } from '@/pages/agenda/TurnoFormPage'
import { ConfiguracionPage } from '@/pages/configuracion/ConfiguracionPage'
import { UsuariosPage } from '@/pages/configuracion/usuarios/UsuariosPage'
import { UsuarioFormPage } from '@/pages/configuracion/usuarios/UsuarioFormPage'
import { MarcasModelosPage } from '@/pages/configuracion/MarcasModelosPage'
import { CategoriasPage } from '@/pages/configuracion/CategoriasPage'
import { KitsTrabajoPage } from '@/pages/configuracion/KitsTrabajoPage'
import { TiposTrabajoPage } from '@/pages/configuracion/TiposTrabajoPage'

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

          <Route path="inventario" element={<RoleGuard allowedRoles={MODULE_ROLES.inventario} />}>
            <Route index element={<ProductosPage />} />
            <Route path="nuevo" element={<ProductoFormPage />} />
            <Route path="movimiento" element={<MovimientoPage />} />
            <Route path=":id/editar" element={<ProductoFormPage />} />
            <Route path=":id" element={<ProductoDetailPage />} />
          </Route>

          <Route path="caja" element={<RoleGuard allowedRoles={MODULE_ROLES.caja} />}>
            <Route index element={<CajaPage />} />
            <Route path="movimiento" element={<MovimientoCajaFormPage />} />
          </Route>

          <Route path="facturacion" element={<RoleGuard allowedRoles={MODULE_ROLES.facturacion} />}>
            <Route index element={<FacturasPage />} />
            <Route path="nueva" element={<FacturaFormPage />} />
            <Route path=":id" element={<FacturaDetailPage />} />
          </Route>

          <Route path="agenda" element={<RoleGuard allowedRoles={MODULE_ROLES.agenda} />}>
            <Route index element={<AgendaPage />} />
            <Route path="nuevo" element={<TurnoFormPage />} />
            <Route path=":id/editar" element={<TurnoFormPage />} />
          </Route>

          <Route path="configuracion" element={<RoleGuard allowedRoles={MODULE_ROLES.configuracionAll} />}>
            <Route index element={<ConfiguracionPage />} />
            <Route path="usuarios" element={<RoleGuard allowedRoles={MODULE_ROLES.configuracion} />}>
              <Route index element={<UsuariosPage />} />
              <Route path="nuevo" element={<UsuarioFormPage />} />
              <Route path=":id/editar" element={<UsuarioFormPage />} />
            </Route>
            <Route
              path="marcas-modelos"
              element={<RoleGuard allowedRoles={MODULE_ROLES.configuracionMarcas} />}
            >
              <Route index element={<MarcasModelosPage />} />
            </Route>
            <Route
              path="categorias"
              element={<RoleGuard allowedRoles={MODULE_ROLES.configuracionCatalogos} />}
            >
              <Route index element={<CategoriasPage />} />
            </Route>
            <Route
              path="tipos-trabajo"
              element={<RoleGuard allowedRoles={MODULE_ROLES.kitsTrabajo} />}
            >
              <Route index element={<TiposTrabajoPage />} />
            </Route>
            <Route
              path="kits-trabajo"
              element={<RoleGuard allowedRoles={MODULE_ROLES.kitsTrabajo} />}
            >
              <Route index element={<KitsTrabajoPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  )
}
