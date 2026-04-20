'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, getStatusColor, getTypeLabel, formatDate } from '@/lib/utils'
import { FileText, Play, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function AnalyticsShell() {
  const { data: procsData, isLoading: procsLoading } = useQuery({
    queryKey: ['procedures-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/procedures?limit=100')
      return res.json()
    },
  })

  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ['runs-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/runs')
      return res.json()
    },
  })

  const procedures = procsData?.data ?? []
  const runs = runsData?.data ?? []

  const stats = {
    total: procedures.length,
    published: procedures.filter((p: { status: string }) => p.status === 'published').length,
    draft: procedures.filter((p: { status: string }) => p.status === 'draft').length,
    totalRuns: runs.length,
    completedRuns: runs.filter((r: { status: string }) => r.status === 'completed').length,
    inProgressRuns: runs.filter((r: { status: string }) => r.status === 'in_progress').length,
  }

  const typeBreakdown = ['procedure', 'policy', 'runsheet', 'sop'].map(type => ({
    type,
    count: procedures.filter((p: { type: string }) => p.type === type).length,
  }))

  const isLoading = procsLoading || runsLoading

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of your procedure library and run activity.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Total Procedures', value: stats.total, icon: FileText, color: 'text-blue-600' },
              { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Drafts', value: stats.draft, icon: Clock, color: 'text-amber-600' },
              { label: 'Total Runs', value: stats.totalRuns, icon: Play, color: 'text-purple-600' },
              { label: 'Completed', value: stats.completedRuns, icon: CheckCircle, color: 'text-green-600' },
              { label: 'In Progress', value: stats.inProgressRuns, icon: TrendingUp, color: 'text-blue-600' },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('h-4 w-4', stat.color)} />
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Procedures by Type</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeBreakdown.map(({ type, count }) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-600">{getTypeLabel(type)}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="w-6 text-right text-sm font-medium text-gray-700">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent runs */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Runs</CardTitle></CardHeader>
              <CardContent>
                {runs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No runs yet.</p>
                ) : (
                  <div className="space-y-2">
                    {runs.slice(0, 6).map((run: { id: string; procedure?: { title?: string }; status: string; progress: number; startedAt: string }) => (
                      <Link
                        key={run.id}
                        href={`/runner/${run.id}`}
                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{run.procedure?.title ?? '—'}</p>
                          <p className="text-xs text-gray-400">{formatDate(run.startedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${run.progress}%` }} />
                          </div>
                          <Badge className={cn('text-[10px]', getStatusColor(run.status))} variant="outline">
                            {run.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recently updated procedures */}
          <Card>
            <CardHeader><CardTitle className="text-sm">All Procedures</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Runs</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.slice(0, 10).map((p: { id: string; title: string; type: string; status: string; _count?: { runs?: number }; updatedAt: string }) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                      <td className="px-4 py-2.5">
                        <Link href={`/builder/${p.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600">{p.title}</Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-500">{getTypeLabel(p.type)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge className={cn('text-[10px]', getStatusColor(p.status))} variant="outline">{p.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-500">{p._count?.runs ?? 0}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-400">{formatDate(p.updatedAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
