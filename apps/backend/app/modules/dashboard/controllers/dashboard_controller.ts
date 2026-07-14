import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import DashboardService from '#modules/dashboard/services/dashboard_service'
import VencimientosNotificacionService from '#modules/dashboard/services/vencimientos_notificacion_service'

const dashboardService = new DashboardService()
const vencimientosNotificacionService = new VencimientosNotificacionService()

export default class DashboardController {
  async kpis({ response }: HttpContext) {
    const data = await dashboardService.getKpis()
    return response.ok(ApiResponse.success(data))
  }

  async vencimientos({ response }: HttpContext) {
    const data = await dashboardService.getVencimientos()
    return response.ok(ApiResponse.success(data))
  }

  async vencimientosPendientesNotificar({ response }: HttpContext) {
    const data = await vencimientosNotificacionService.listPendientes()
    return response.ok(ApiResponse.success(data))
  }

  async alertasOperativas({ response }: HttpContext) {
    const data = await dashboardService.getAlertasOperativas()
    return response.ok(ApiResponse.success(data))
  }

  async produccion({ request, response }: HttpContext) {
    const dias = Number(request.input('dias', 30))
    const data = await dashboardService.getProduccion(dias)
    return response.ok(ApiResponse.success(data))
  }
}
