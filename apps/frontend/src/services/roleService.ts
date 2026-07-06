import type { IRole } from '@gnc/shared-types'
import { apiGet } from '@/services/api-client'

export const roleService = {
  list() {
    return apiGet<IRole[]>('/roles')
  },
}
