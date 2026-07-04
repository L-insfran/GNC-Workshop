import type { IPaginationMeta } from '@gnc/shared-types'

export class ApiResponse {
  static success<T>(data: T, meta?: IPaginationMeta) {
    return { success: true as const, data, ...(meta ? { meta } : {}) }
  }

  static created<T>(data: T) {
    return { success: true as const, data }
  }

  static error(code: string, message: string, details?: Record<string, string[]>) {
    return { success: false as const, error: { code, message, details } }
  }

  static paginated<T>(data: T[], meta: IPaginationMeta) {
    return { success: true as const, data, meta }
  }
}
