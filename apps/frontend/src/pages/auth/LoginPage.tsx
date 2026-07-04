import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ApiError } from '@/services/api-client'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error al iniciar sesión. Intentá nuevamente.'
      setError(message)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-slate-900">GNC Workshop</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-slate-500">Ingresá tus credenciales para acceder al sistema.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Ingresar
        </Button>
      </form>
    </div>
  )
}
