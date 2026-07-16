import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import DashboardService from '#modules/dashboard/services/dashboard_service'
import VencimientosNotificacionService from '#modules/dashboard/services/vencimientos_notificacion_service'
import { registrarNotificacionValidator } from '#modules/dashboard/validators/registrar_notificacion_validator'

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

  async vencimientosPendientesNotificar({ request, response }: HttpContext) {
    const equipoGncId = request.input('equipoGncId') as string | undefined
    const incluirRaw = request.input('incluirYaNotificados')
    const incluirYaNotificados =
      incluirRaw === true || incluirRaw === 'true' || incluirRaw === '1' || incluirRaw === 1

    const data = await vencimientosNotificacionService.listPendientes({
      equipoGncId: equipoGncId || undefined,
      incluirYaNotificados,
    })
    return response.ok(ApiResponse.success(data))
  }

  async notificacionesConfig({ response }: HttpContext) {
    const data = vencimientosNotificacionService.getDriverInfo()
    return response.ok(ApiResponse.success(data))
  }

  async marcarVencimientoNotificado({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(registrarNotificacionValidator)
    try {
      const registro = await vencimientosNotificacionService.marcarNotificado(
        params.alertaId,
        auth.user?.id ?? null,
        {
          canal: dto.canal,
          modo: dto.modo,
          estado: dto.estado,
        }
      )
      return response.ok(
        ApiResponse.success({
          id: registro.id,
          alertaId: registro.alertaId,
          canal: registro.canal,
          modo: registro.modo,
          estado: registro.estado,
          notificadoAt: registro.notificadoAt.toISO(),
        })
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'ALERTA_NO_ENCONTRADA') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Alerta de vencimiento no encontrada'))
      }
      throw error
    }
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
