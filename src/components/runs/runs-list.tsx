'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, formatDateTime, getStatusColor, getTypeLabel } from '@/lib/utils'
import type { ProcedureRun } from '@/types'
import { Play, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function RunsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: async () => {
      const res = await fetch('/api/runs')
      return res.json()
    },
  })

  const runs: ProcedureRun[] = data?.data ?? []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Runs</h2>
        <p className="text-sm text-gray-500 mt-1">All procedure runs, sorted by most recent.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}

      {!isLoading && runs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-gray-900">No runs yet</h3>
          <p className="text-sm text-gray-500 mb-6">Open a published procedure and click Run to start.</p>
          <Button asChild><Link href="/procedures">Browse Procedures</Link></Button>
        </div>
      )}

      {!isLoading && runs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Procedure</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Runner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Started</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Completed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/runner/${run.id}`} className="font-medium text-sm text-gray-900 hover:text-blue-600">
                      {run.procedure?.title ?? '—'}
                    </Link>
                    {run.procedure?.type && (
                      <p className="text-xs text-gray-400">{getTypeLabel(run.procedure.type)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-[10px]', getStatusColor(run.status))} variant="outline">
                      {run.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={run.progress} className="w-16 h-1.5" />
                      <span className="text-xs text-gray-500">{Math.round(run.progress)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 capitalize">{run.mode}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{run.runner?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(run.startedAt)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{run.completedAt ? formatDateTime(run.completedAt) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/runner/${run.id}`}>
                        {run.status === 'in_progress' ? <><Play className="mr-1 h-3.5 w-3.5" />Continue</> : <><CheckCircle className="mr-1 h-3.5 w-3.5" />View</>}
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
