'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn, formatDate, getStatusColor, getTypeColor, getTypeLabel } from '@/lib/utils'
import type { Procedure, ProcedureFilters } from '@/types'
import { Search, Plus, MoreVertical, Star, Edit3, Play, Trash2, Copy, FileDown, Filter, Grid3x3, List, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

async function fetchProcedures(filters: ProcedureFilters) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.department) params.set('department', filters.department)
  if (filters.isFavorite) params.set('isFavorite', 'true')
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

  const res = await fetch(`/api/procedures?${params}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function ProcedureList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ProcedureFilters>({
    type: (searchParams.get('type') as ProcedureFilters['type']) ?? 'all',
    status: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    isFavorite: searchParams.get('isFavorite') === 'true',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data, isLoading, error } = useQuery({
    queryKey: ['procedures', { ...filters, search }],
    queryFn: () => fetchProcedures({ ...filters, search }),
  })

  const procedures: Procedure[] = data?.data ?? []
  const total = data?.total ?? 0

  const favMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/procedures/${id}/favorite`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procedures'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/procedures/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      toast.success('Procedure deleted')
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    },
  })

  const handleDelete = useCallback((p: Procedure) => {
    if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(p.id)
    }
  }, [deleteMutation])

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search procedures, policies, run sheets..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.type ?? 'all'} onValueChange={v => setFilters(f => ({ ...f, type: v as ProcedureFilters['type'] }))}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="runsheet">Run Sheet</SelectItem>
              <SelectItem value="sop">SOP</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status ?? 'all'} onValueChange={v => setFilters(f => ({ ...f, status: v as ProcedureFilters['status'] }))}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy ?? 'updatedAt'} onValueChange={v => setFilters(f => ({ ...f, sortBy: v as ProcedureFilters['sortBy'] }))}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-md border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded-l-md transition-colors', viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50')}
            >
              <Grid3x3 className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-r-md border-l border-gray-200 transition-colors', viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50')}
            >
              <List className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <Button size="sm" asChild>
            <Link href="/procedures/new">
              <Plus className="mr-1 h-4 w-4" />
              New
            </Link>
          </Button>
        </div>
      </div>

      {filters.isFavorite && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="warning" className="gap-1">
            <Star className="h-3 w-3 fill-current" />
            Favorites only
          </Badge>
          <button
            onClick={() => setFilters(f => ({ ...f, isFavorite: false }))}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
      )}

      {isLoading && (
        <div className={cn('gap-4', viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!isLoading && procedures.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <FileDown className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-gray-900">No procedures found</h3>
          <p className="mb-6 text-sm text-gray-500">
            {search ? `No results for "${search}"` : 'Get started by creating your first procedure.'}
          </p>
          <Button asChild>
            <Link href="/procedures/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Procedure
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && procedures.length > 0 && (
        <>
          <p className="mb-4 text-xs text-gray-500">{total} result{total !== 1 ? 's' : ''}</p>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {procedures.map(p => (
                <ProcedureCard key={p.id} procedure={p} onFavorite={() => favMutation.mutate(p.id)} onDelete={() => handleDelete(p)} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Updated</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Owner</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {procedures.map(p => (
                    <ProcedureRow key={p.id} procedure={p} onFavorite={() => favMutation.mutate(p.id)} onDelete={() => handleDelete(p)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProcedureCard({ procedure: p, onFavorite, onDelete }: { procedure: Procedure; onFavorite: () => void; onDelete: () => void }) {
  const router = useRouter()
  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge className={cn('text-[10px]', getTypeColor(p.type))} variant="outline">{getTypeLabel(p.type)}</Badge>
          <Badge className={cn('text-[10px]', getStatusColor(p.status))} variant="outline">{p.status}</Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onFavorite} className="rounded p-1 hover:bg-gray-100">
            <Star className={cn('h-3.5 w-3.5', p.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400')} />
          </button>
          <ProcedureMenu procedure={p} onDelete={onDelete} />
        </div>
      </div>

      <Link href={`/builder/${p.id}`} className="flex-1">
        <h3 className="mb-1 font-semibold text-gray-900 line-clamp-2 text-sm leading-snug hover:text-blue-600">{p.title}</h3>
        {p.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>}
      </Link>

      {p.tags && p.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {p.tags.slice(0, 3).map(tag => (
            <span key={tag.id} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
        <span className="text-[10px] text-gray-400">{formatDate(p.updatedAt)}</span>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" asChild>
            <Link href={`/builder/${p.id}`}><Edit3 className="h-3.5 w-3.5" /></Link>
          </Button>
          {p.status === 'published' && (
            <Button size="icon-sm" variant="ghost" asChild>
              <Link href={`/runner/new?procedureId=${p.id}`}><Play className="h-3.5 w-3.5" /></Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProcedureRow({ procedure: p, onFavorite, onDelete }: { procedure: Procedure; onFavorite: () => void; onDelete: () => void }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={onFavorite}>
            <Star className={cn('h-3.5 w-3.5', p.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-gray-400')} />
          </button>
          <Link href={`/builder/${p.id}`} className="font-medium text-sm text-gray-900 hover:text-blue-600 line-clamp-1">{p.title}</Link>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge className={cn('text-[10px]', getTypeColor(p.type))} variant="outline">{getTypeLabel(p.type)}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge className={cn('text-[10px]', getStatusColor(p.status))} variant="outline">{p.status}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">{p.department ?? '—'}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(p.updatedAt)}</td>
      <td className="px-4 py-3 text-xs text-gray-600">{p.owner?.name ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon-sm" variant="ghost" asChild>
            <Link href={`/builder/${p.id}`}><Edit3 className="h-3.5 w-3.5" /></Link>
          </Button>
          {p.status === 'published' && (
            <Button size="icon-sm" variant="ghost" asChild>
              <Link href={`/runner/new?procedureId=${p.id}`}><Play className="h-3.5 w-3.5" /></Link>
            </Button>
          )}
          <ProcedureMenu procedure={p} onDelete={onDelete} />
        </div>
      </td>
    </tr>
  )
}

function ProcedureMenu({ procedure: p, onDelete }: { procedure: Procedure; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded p-1 hover:bg-gray-100">
          <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/builder/${p.id}`}><Edit3 className="mr-2 h-3.5 w-3.5" />Edit</Link>
        </DropdownMenuItem>
        {p.status === 'published' && (
          <DropdownMenuItem asChild>
            <Link href={`/runner/new?procedureId=${p.id}`}><Play className="mr-2 h-3.5 w-3.5" />Run</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/export/${p.id}`}><FileDown className="mr-2 h-3.5 w-3.5" />Export PDF</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onDelete}>
          <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
