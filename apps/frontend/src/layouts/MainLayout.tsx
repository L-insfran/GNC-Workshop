import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { cn } from '@/utils/cn'

interface MainLayoutProps {
  title?: string
  subtitle?: string
}

export function MainLayout({ title = 'GNC Workshop', subtitle }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden print:hidden lg:flex">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 print:hidden lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 print:hidden lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Topbar
            title={title}
            subtitle={subtitle}
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
          />
        </div>
        <main className={cn('flex-1 overflow-y-auto p-4 sm:p-6 print:overflow-visible print:p-0')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
