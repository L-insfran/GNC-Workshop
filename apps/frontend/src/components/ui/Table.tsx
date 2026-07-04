import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { IPaginationMeta, ITableColumn } from '@/types'

interface TableProps<T> {
  columns: ITableColumn<T>[]
  data: T[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
}

export function Table<T>({
  columns,
  data,
  isLoading,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No hay registros para mostrar.',
  keyExtractor,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'transition-colors hover:bg-slate-50',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('whitespace-nowrap px-4 py-3 text-sm text-slate-700', column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface TablePaginationProps {
  meta?: IPaginationMeta
  onPageChange: (page: number) => void
}

export function TablePagination({ meta, onPageChange }: TablePaginationProps) {
  if (!meta || meta.lastPage <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">
        Página {meta.page} de {meta.lastPage} · {meta.total} registros
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.lastPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface TableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  actions?: ReactNode
}

export function TableToolbar({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  actions,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full max-w-sm rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-72"
      />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
