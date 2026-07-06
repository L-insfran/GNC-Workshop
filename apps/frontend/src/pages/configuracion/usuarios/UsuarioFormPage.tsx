import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROLES } from '@gnc/shared-types'
import { useUser, useUserMutations } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { RoleCheckboxGroup } from '@/components/configuracion/RoleCheckboxGroup'
import { ApiError } from '@/services/api-client'

const createSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  fullName: z.string().min(2, 'Requerido'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Seleccioná al menos un rol'),
  isActive: z.boolean(),
})

const updateSchema = createSchema.extend({
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
})

type UsuarioForm = z.infer<typeof createSchema>

export function UsuarioFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const { data: usuario, isLoading } = useUser(id)
  const { data: roles } = useRoles()
  const { create, update } = useUserMutations()

  const isSelf = isEditing && id === currentUser?.id
  const adminRoleId = roles?.find((r) => r.name === ROLES.ADMINISTRADOR)?.id

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<UsuarioForm>({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: { isActive: true, roleIds: [] },
  })

  useEffect(() => {
    if (usuario) {
      reset({
        email: usuario.email,
        password: '',
        fullName: usuario.fullName,
        phone: usuario.phone ?? '',
        roleIds: usuario.roles.map((r) => r.id),
        isActive: usuario.isActive,
      })
    }
  }, [usuario, reset])

  const onSubmit = async (data: UsuarioForm) => {
    try {
      const payload = {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone || undefined,
        roleIds: data.roleIds,
        isActive: data.isActive,
        ...(data.password ? { password: data.password } : {}),
      }

      if (isEditing && id) {
        const roleIds =
          isSelf && adminRoleId && !data.roleIds.includes(adminRoleId)
            ? [...data.roleIds, adminRoleId]
            : data.roleIds

        await update.mutateAsync({
          id,
          data: {
            ...payload,
            roleIds,
            isActive: isSelf ? true : data.isActive,
          },
        })
      } else {
        await create.mutateAsync({
          ...payload,
          password: data.password,
        })
      }
      navigate(ROUTES.CONFIG_USUARIOS)
    } catch (err) {
      setError('root', {
        message: err instanceof ApiError ? err.message : 'Error al guardar usuario',
      })
    }
  }

  if (isEditing && isLoading) return <PageLoader />

  const disabledRoleIds =
    isSelf && adminRoleId ? roles?.filter((r) => r.id !== adminRoleId).map((r) => r.id) ?? [] : []

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to={ROUTES.CONFIG_USUARIOS}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader title={isEditing ? 'Editar usuario' : 'Nuevo usuario'} />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

            <Input label="Nombre completo" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Teléfono" {...register('phone')} />
            <Input
              label={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => (
                <RoleCheckboxGroup
                  roles={roles ?? []}
                  value={field.value}
                  onChange={field.onChange}
                  disabledRoleIds={disabledRoleIds}
                  error={errors.roleIds?.message}
                />
              )}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                disabled={isSelf}
                {...register('isActive')}
              />
              <span className="text-sm text-slate-700">Usuario activo</span>
            </label>
            {isSelf && (
              <p className="text-xs text-slate-500">
                No podés desactivarte ni quitarte el rol de administrador.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Link to={ROUTES.CONFIG_USUARIOS}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
