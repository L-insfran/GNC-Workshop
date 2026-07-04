import { BaseEvent } from '@adonisjs/core/events'

export class EntityCreated extends BaseEvent {
  constructor(
    public payload: {
      userId: string
      entityType: string
      entityId: string
      newValues: Record<string, unknown>
      ipAddress?: string
    }
  ) {
    super()
  }
}

export class EntityUpdated extends BaseEvent {
  constructor(
    public payload: {
      userId: string
      entityType: string
      entityId: string
      oldValues: Record<string, unknown>
      newValues: Record<string, unknown>
      ipAddress?: string
    }
  ) {
    super()
  }
}

export class EntityDeleted extends BaseEvent {
  constructor(
    public payload: {
      userId: string
      entityType: string
      entityId: string
      oldValues: Record<string, unknown>
      ipAddress?: string
    }
  ) {
    super()
  }
}

export class DataExported extends BaseEvent {
  constructor(
    public payload: {
      userId: string
      entityType: string
      filters?: Record<string, unknown>
      ipAddress?: string
    }
  ) {
    super()
  }
}
