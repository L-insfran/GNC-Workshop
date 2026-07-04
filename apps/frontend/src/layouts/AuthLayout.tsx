import { Outlet } from 'react-router-dom'
import { Wrench } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">GNC Workshop</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            ERP especializado para talleres de GNC
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Gestión integral de clientes, vehículos, equipos GNC y órdenes de trabajo con
            cumplimiento regulatorio ENARGAS / CRPC.
          </p>
        </div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} GNC Workshop</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
