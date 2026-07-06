import type { IRole } from '@gnc/shared-types'
import { ROLE_LABELS } from '@/constants/roles'
import { cn } from '@/utils/cn'

interface RoleCheckboxGroupProps {
  roles: IRole[]
  value: string[]
  onChange: (roleIds: string[]) => void
  disabledRoleIds?: string[]
  error?: string
}

export function RoleCheckboxGroup({
  roles,
  value,
  onChange,
  disabledRoleIds = [],
  error,
}: RoleCheckboxGroupProps) {
  const toggleRole = (roleId: string) => {
    if (disabledRoleIds.includes(roleId)) return

    if (value.includes(roleId)) {
      onChange(value.filter((id) => id !== roleId))
    } else {
      onChange([...value, roleId])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Roles</label>
      <div className="grid gap-2 sm:grid-cols-2">
        {roles.map((role) => {
          const isDisabled = disabledRoleIds.includes(role.id)
          const isChecked = value.includes(role.id)

          return (
            <label
              key={role.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                isChecked ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50',
                isDisabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => toggleRole(role.id)}
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {ROLE_LABELS[role.name] ?? role.displayName}
                </p>
                {role.description && (
                  <p className="text-xs text-slate-500">{role.description}</p>
                )}
              </div>
            </label>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
