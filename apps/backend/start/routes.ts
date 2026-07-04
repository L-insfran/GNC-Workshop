import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router
  .group(() => {
    router.post('/auth/login', '#modules/auth/controllers/auth_controller.login')
    router.post('/auth/logout', '#modules/auth/controllers/auth_controller.logout').use(middleware.auth())
    router.get('/auth/me', '#modules/auth/controllers/auth_controller.me').use(middleware.auth())

    router
      .group(() => {
        router.resource('users', '#modules/users/controllers/users_controller').apiOnly()
        router.resource('clientes', '#modules/clientes/controllers/clientes_controller').apiOnly()
        router.get('clientes/:id/vehiculos', '#modules/clientes/controllers/clientes_controller.vehiculos')
        router.resource('vehiculos', '#modules/vehiculos/controllers/vehiculos_controller').apiOnly()
        router.resource('equipos-gnc', '#modules/equipos_gnc/controllers/equipos_gnc_controller').apiOnly()
        router.resource('ordenes-trabajo', '#modules/ordenes_trabajo/controllers/ordenes_trabajo_controller').apiOnly()
        router.patch('ordenes-trabajo/:id/estado', '#modules/ordenes_trabajo/controllers/ordenes_trabajo_controller.updateEstado')
        router.get('tipos-trabajo', '#modules/ordenes_trabajo/controllers/tipos_trabajo_controller.index')
        router.get('vehiculo-marcas', '#modules/vehiculos/controllers/vehiculo_marcas_controller.index')
        router.get('vehiculo-modelos', '#modules/vehiculos/controllers/vehiculo_modelos_controller.index')
        router.get('dashboard/kpis', '#modules/dashboard/controllers/dashboard_controller.kpis')
        router.get('dashboard/vencimientos', '#modules/dashboard/controllers/dashboard_controller.vencimientos')
        router.get('dashboard/produccion', '#modules/dashboard/controllers/dashboard_controller.produccion')
        router.get('inventario', '#modules/inventario/controllers/inventario_controller.index')
        router.get('caja', '#modules/caja/controllers/caja_controller.index')
        router.get('facturacion', '#modules/facturacion/controllers/facturacion_controller.index')
        router.get('agenda', '#modules/agenda/controllers/agenda_controller.index')
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')

router.get('/health', async () => ({ status: 'ok', service: 'gnc-workshop-api' }))
