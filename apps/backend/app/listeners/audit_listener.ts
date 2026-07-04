import AuditLog from '#models/audit_log'
import { EntityCreated, EntityDeleted, EntityUpdated, DataExported } from '#events/audit_events'

export default class AuditListener {
  async onEntityCreated(event: EntityCreated) {
    await AuditLog.create({
      userId: event.payload.userId,
      action: 'create',
      entityType: event.payload.entityType,
      entityId: event.payload.entityId,
      newValues: event.payload.newValues,
      ipAddress: event.payload.ipAddress,
    })
  }

  async onEntityUpdated(event: EntityUpdated) {
    await AuditLog.create({
      userId: event.payload.userId,
      action: 'update',
      entityType: event.payload.entityType,
      entityId: event.payload.entityId,
      oldValues: event.payload.oldValues,
      newValues: event.payload.newValues,
      ipAddress: event.payload.ipAddress,
    })
  }

  async onEntityDeleted(event: EntityDeleted) {
    await AuditLog.create({
      userId: event.payload.userId,
      action: 'delete',
      entityType: event.payload.entityType,
      entityId: event.payload.entityId,
      oldValues: event.payload.oldValues,
      ipAddress: event.payload.ipAddress,
    })
  }

  async onDataExported(event: DataExported) {
    await AuditLog.create({
      userId: event.payload.userId,
      action: 'export',
      entityType: event.payload.entityType,
      newValues: event.payload.filters ?? {},
      ipAddress: event.payload.ipAddress,
    })
  }
}
