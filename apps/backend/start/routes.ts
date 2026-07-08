import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { ROLES } from '@gnc/shared-types'

const adminOnly = [ROLES.ADMINISTRADOR] as const
const catalogManagers = [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR] as const
const categoriaManagers = [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR, ROLES.DEPOSITO] as const

router
  .group(() => {
    router.post('/auth/login', '#modules/auth/controllers/auth_controller.login')
    router.post('/auth/logout', '#modules/auth/controllers/auth_controller.logout').use(middleware.auth())
    router.get('/auth/me', '#modules/auth/controllers/auth_controller.me').use(middleware.auth())

    router
      .group(() => {
        router
          .resource('users', '#modules/users/controllers/users_controller')
          .apiOnly()
          .use(middleware.role(adminOnly))
        router
          .get('roles', '#modules/users/controllers/roles_controller.index')
          .use(middleware.role(adminOnly))

        router.resource('clientes', '#modules/clientes/controllers/clientes_controller').apiOnly()
        router.get('clientes/:id/vehiculos', '#modules/clientes/controllers/clientes_controller.vehiculos')
        router.resource('vehiculos', '#modules/vehiculos/controllers/vehiculos_controller').apiOnly()
        router.resource('equipos-gnc', '#modules/equipos_gnc/controllers/equipos_gnc_controller').apiOnly()
        router.get('ordenes-trabajo/:id/factura-borrador', '#modules/ordenes_trabajo/controllers/ordenes_trabajo_controller.facturaBorrador')
        router.get('ordenes-trabajo/:id/factura-vinculada', '#modules/ordenes_trabajo/controllers/ordenes_trabajo_controller.facturaVinculada')
        router.get('ordenes-trabajo/:id/items', '#modules/ordenes_trabajo/controllers/ot_items_controller.index')
        router.post('ordenes-trabajo/:id/items', '#modules/ordenes_trabajo/controllers/ot_items_controller.store')
        router.put('ordenes-trabajo/:id/items/:itemId', '#modules/ordenes_trabajo/controllers/ot_items_controller.update')
        router.delete('ordenes-trabajo/:id/items/:itemId', '#modules/ordenes_trabajo/controllers/ot_items_controller.destroy')
        router.resource('ordenes-trabajo', '#modules/ordenes_trabajo/controllers/ordenes_trabajo_controller').apiOnly()
        router.patch('ordenes-trabajo/:id/estado', '#modules/ordenes_trabajo/controllers/ordenes_trabajo_controller.updateEstado')
        router.get('tipos-trabajo', '#modules/ordenes_trabajo/controllers/tipos_trabajo_controller.index')

        router.get(
          'kit-trabajos/:tipoTrabajoId/items',
          '#modules/ordenes_trabajo/controllers/kit_trabajo_controller.index'
        )
        router
          .post(
            'kit-trabajos/:tipoTrabajoId/items',
            '#modules/ordenes_trabajo/controllers/kit_trabajo_controller.store'
          )
          .use(middleware.role(catalogManagers))
        router
          .put(
            'kit-trabajos/items/:itemId',
            '#modules/ordenes_trabajo/controllers/kit_trabajo_controller.update'
          )
          .use(middleware.role(catalogManagers))
        router
          .delete(
            'kit-trabajos/items/:itemId',
            '#modules/ordenes_trabajo/controllers/kit_trabajo_controller.destroy'
          )
          .use(middleware.role(catalogManagers))

        router.get('vehiculo-marcas', '#modules/vehiculos/controllers/vehiculo_marcas_controller.index')
        router
          .post('vehiculo-marcas', '#modules/vehiculos/controllers/vehiculo_marcas_controller.store')
          .use(middleware.role(catalogManagers))
        router
          .put('vehiculo-marcas/:id', '#modules/vehiculos/controllers/vehiculo_marcas_controller.update')
          .use(middleware.role(catalogManagers))
        router
          .delete('vehiculo-marcas/:id', '#modules/vehiculos/controllers/vehiculo_marcas_controller.destroy')
          .use(middleware.role(catalogManagers))

        router.get('vehiculo-modelos', '#modules/vehiculos/controllers/vehiculo_modelos_controller.index')
        router
          .post('vehiculo-modelos', '#modules/vehiculos/controllers/vehiculo_modelos_controller.store')
          .use(middleware.role(catalogManagers))
        router
          .put('vehiculo-modelos/:id', '#modules/vehiculos/controllers/vehiculo_modelos_controller.update')
          .use(middleware.role(catalogManagers))
        router
          .delete('vehiculo-modelos/:id', '#modules/vehiculos/controllers/vehiculo_modelos_controller.destroy')
          .use(middleware.role(catalogManagers))

        router.get('dashboard/kpis', '#modules/dashboard/controllers/dashboard_controller.kpis')
        router.get('dashboard/vencimientos', '#modules/dashboard/controllers/dashboard_controller.vencimientos')
        router.get(
          'dashboard/alertas-operativas',
          '#modules/dashboard/controllers/dashboard_controller.alertasOperativas'
        )
        router.get('dashboard/produccion', '#modules/dashboard/controllers/dashboard_controller.produccion')

        // Inventario
        router.get('inventario/productos', '#modules/inventario/controllers/inventario_controller.index')
        router.get(
          'inventario/productos/:id/disponibilidad',
          '#modules/inventario/controllers/inventario_controller.disponibilidad'
        )
        router.get('inventario/productos/:id', '#modules/inventario/controllers/inventario_controller.show')
        router.post('inventario/productos', '#modules/inventario/controllers/inventario_controller.store')
        router.put('inventario/productos/:id', '#modules/inventario/controllers/inventario_controller.update')
        router.delete('inventario/productos/:id', '#modules/inventario/controllers/inventario_controller.destroy')
        router.post('inventario/movimientos', '#modules/inventario/controllers/inventario_controller.movimiento')
        router.get('inventario/movimientos', '#modules/inventario/controllers/inventario_controller.movimientos')
        router.get('inventario/alertas', '#modules/inventario/controllers/inventario_controller.alertas')
        router.get('inventario/categorias', '#modules/inventario/controllers/inventario_controller.categorias')
        router
          .post('inventario/categorias', '#modules/inventario/controllers/inventario_controller.storeCategoria')
          .use(middleware.role(categoriaManagers))
        router
          .put('inventario/categorias/:id', '#modules/inventario/controllers/inventario_controller.updateCategoria')
          .use(middleware.role(categoriaManagers))
        router
          .delete('inventario/categorias/:id', '#modules/inventario/controllers/inventario_controller.destroyCategoria')
          .use(middleware.role(categoriaManagers))

        // Caja
        router.get('caja', '#modules/caja/controllers/caja_controller.index')
        router.get('caja/saldo', '#modules/caja/controllers/caja_controller.saldo')
        router.get('caja/movimientos', '#modules/caja/controllers/caja_controller.movimientos')
        router.post('caja/movimientos', '#modules/caja/controllers/caja_controller.storeMovimiento')
        router.get('caja/arqueo', '#modules/caja/controllers/caja_controller.arqueo')

        // Facturación
        router.get('facturas', '#modules/facturacion/controllers/facturacion_controller.index')
        router.get('facturas/:id/nota-credito-borrador', '#modules/facturacion/controllers/facturacion_controller.notaCreditoBorrador')
        router.get('facturas/:id', '#modules/facturacion/controllers/facturacion_controller.show')
        router.post('facturas', '#modules/facturacion/controllers/facturacion_controller.store')
        router.patch('facturas/:id/anular', '#modules/facturacion/controllers/facturacion_controller.anular')

        // Agenda
        router.get('agenda/turnos', '#modules/agenda/controllers/agenda_controller.index')
        router.get('agenda/por-fecha', '#modules/agenda/controllers/agenda_controller.porFecha')
        router.get('agenda/turnos/:id', '#modules/agenda/controllers/agenda_controller.show')
        router.post(
          'agenda/turnos/:id/generar-ot',
          '#modules/agenda/controllers/agenda_controller.generarOt'
        )
        router.post('agenda/turnos', '#modules/agenda/controllers/agenda_controller.store')
        router.put('agenda/turnos/:id', '#modules/agenda/controllers/agenda_controller.update')
        router.delete('agenda/turnos/:id', '#modules/agenda/controllers/agenda_controller.destroy')
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')

router.get('/health', async () => ({ status: 'ok', service: 'gnc-workshop-api' }))
