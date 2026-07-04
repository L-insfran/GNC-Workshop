import type { ApplicationService } from '@adonisjs/core/types'
import emitter from '@adonisjs/core/services/emitter'
import AuditListener from '#listeners/audit_listener'
import {
  DataExported,
  EntityCreated,
  EntityDeleted,
  EntityUpdated,
} from '#events/audit_events'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  async boot() {
    const auditListener = new AuditListener()

    emitter.on(EntityCreated, (event) => auditListener.onEntityCreated(event))
    emitter.on(EntityUpdated, (event) => auditListener.onEntityUpdated(event))
    emitter.on(EntityDeleted, (event) => auditListener.onEntityDeleted(event))
    emitter.on(DataExported, (event) => auditListener.onDataExported(event))
  }
}
