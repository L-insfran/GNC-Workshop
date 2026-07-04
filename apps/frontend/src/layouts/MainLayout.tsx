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
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />
        <main className={cn('flex-1 overflow-y-auto p-4 sm:p-6')}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
