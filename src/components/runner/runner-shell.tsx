'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDuration, getStatusColor, parseJson } from '@/lib/utils'
import type { ProcedureRun, ProcedureSection, ProcedureBlock, RunBlockValue } from '@/types'
import { RunnerBlock } from './runner-block'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, MessageSquare, Save, Flag } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface Props { runId: string }

interface BlockValueMap {
  [blockId: string]: {
    value?: string
    completed: boolean
    timerElapsed?: number
  }
}

export function RunnerShell({ runId }: Props) {
  const queryClient = useQueryClient()
  const [blockValues, setBlockValues] = useState<BlockValueMap>({})
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0)
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout>()

  const { data, isLoading } = useQuery({
    queryKey: ['run', runId],
    queryFn: async () => {
      const res = await fetch(`/api/runs/${runId}`)
      if (!res.ok) throw new Error('Failed to load run')
      return res.json()
    },
  })

  const run: ProcedureRun | undefined = data?.data
  const sections: ProcedureSection[] = run?.version?.sections ?? []
  const allBlocks = sections.flatMap(s => s.blocks)

  useEffect(() => {
    if (run?.blockValues) {
      const map: BlockValueMap = {}
      run.blockValues.forEach((bv: RunBlockValue) => {
        map[bv.blockId] = {
          value: bv.value ?? undefined,
          completed: bv.completed,
          timerElapsed: bv.timerElapsed ?? undefined,
        }
      })
      setBlockValues(map)
    }
  }, [run?.blockValues])

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return res.json()
    },
  })

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/runs/${runId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      return res.json()
    },
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['run', runId] })
    },
  })

  const handleBlockChange = useCallback((blockId: string, value?: string, completed?: boolean, timerElapsed?: number) => {
    setBlockValues(prev => ({
      ...prev,
      [blockId]: {
        value: value ?? prev[blockId]?.value,
        completed: completed ?? prev[blockId]?.completed ?? false,
        timerElapsed: timerElapsed ?? prev[blockId]?.timerElapsed,
      },
    }))

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const completedBlocks = Object.entries({ ...blockValues, [blockId]: { value, completed: completed ?? false, timerElapsed } })
        .filter(([, v]) => v.completed).length
      const progress = allBlocks.length > 0 ? (completedBlocks / allBlocks.length) * 100 : 0

      updateMutation.mutate({
        progress,
        blockValues: [{
          blockId,
          value: value ?? blockValues[blockId]?.value,
          completed: completed ?? blockValues[blockId]?.completed ?? false,
          timerElapsed: timerElapsed ?? blockValues[blockId]?.timerElapsed,
        }],
      })
    }, 1000)
  }, [blockValues, allBlocks.length, updateMutation])

  const completedCount = Object.values(blockValues).filter(v => v.completed).length
  const requiredBlocks = allBlocks.filter(b => {
    const v = b.validation as Record<string, unknown>
    return v.required
  })
  const requiredCompleted = requiredBlocks.filter(b => blockValues[b.id]?.completed).length
  const progress = allBlocks.length > 0 ? (completedCount / allBlocks.length) * 100 : 0

  const handleComplete = async () => {
    const incomplete = requiredBlocks.filter(b => !blockValues[b.id]?.completed)
    if (incomplete.length > 0) {
      toast.error(`${incomplete.length} required item${incomplete.length > 1 ? 's' : ''} must be completed first.`)
      return
    }

    await updateMutation.mutateAsync({
      status: 'completed',
      progress: 100,
    })
    toast.success('Procedure completed!')
    queryClient.invalidateQueries({ queryKey: ['run', runId] })
  }

  const handleSave = () => {
    const bvPayload = Object.entries(blockValues).map(([blockId, v]) => ({
      blockId, ...v,
    }))
    updateMutation.mutate({ progress, blockValues: bvPayload })
    toast.success('Progress saved')
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  if (!run) return <div className="flex h-full items-center justify-center"><p className="text-sm text-gray-500">Run not found.</p></div>

  const isCompleted = run.status === 'completed'
  const mode = run.mode

  return (
    <div className="flex h-full flex-col">
      {/* Runner top bar */}
      <div className="flex h-12 items-center gap-4 border-b border-gray-200 bg-white px-4 shrink-0">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/procedures"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{run.procedure?.title ?? 'Procedure Run'}</span>
            <Badge className={cn('text-[10px]', getStatusColor(run.status))} variant="outline">{run.status.replace('_', ' ')}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex-1 max-w-48">
              <Progress value={progress} className="h-1.5" />
            </div>
            <span className="text-[10px] text-gray-500">{completedCount}/{allBlocks.length} complete</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="mr-1.5 h-3.5 w-3.5" />Save
          </Button>
          {!isCompleted && (
            <Button size="sm" onClick={handleComplete}>
              <Flag className="mr-1.5 h-3.5 w-3.5" />Complete
            </Button>
          )}
        </div>
      </div>

      {isCompleted && (
        <div className="border-b border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Procedure completed successfully!</span>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Section nav for step mode */}
        {mode === 'step' && sections.length > 1 && (
          <div className="w-48 border-r border-gray-200 bg-white">
            <ScrollArea className="h-full">
              <div className="p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1">Sections</p>
                {sections.map((s, i) => {
                  const sectionBlocks = s.blocks
                  const sectionCompleted = sectionBlocks.filter(b => blockValues[b.id]?.completed).length
                  const allSectionDone = sectionBlocks.length > 0 && sectionCompleted === sectionBlocks.length
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSectionIdx(i)}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors',
                        currentSectionIdx === i ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] shrink-0',
                        allSectionDone ? 'bg-green-100 text-green-700' : currentSectionIdx === i ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      )}>
                        {allSectionDone ? '✓' : i + 1}
                      </div>
                      <span className="truncate">{s.title}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main content */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-2xl p-6 space-y-6">
            {mode === 'step' ? (
              sections[currentSectionIdx] ? (
                <RunnerSection
                  section={sections[currentSectionIdx]}
                  blockValues={blockValues}
                  onBlockChange={handleBlockChange}
                  isReadOnly={isCompleted}
                />
              ) : null
            ) : (
              sections.map(s => (
                <RunnerSection
                  key={s.id}
                  section={s}
                  blockValues={blockValues}
                  onBlockChange={handleBlockChange}
                  isReadOnly={isCompleted}
                />
              ))
            )}

            {/* Comments */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 w-full"
              >
                <MessageSquare className="h-4 w-4" />
                Comments {run.comments && run.comments.length > 0 && `(${run.comments.length})`}
              </button>
              {showComments && (
                <div className="mt-3 space-y-3">
                  {run.comments?.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 shrink-0">
                        {c.author?.name?.[0] ?? 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{c.author?.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {!isCompleted && (
                    <div className="flex gap-2">
                      <Textarea
                        className="text-xs flex-1"
                        rows={2}
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                      />
                      <Button size="sm" onClick={() => comment && commentMutation.mutate(comment)} disabled={!comment}>
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Step navigation */}
      {mode === 'step' && sections.length > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSectionIdx(i => Math.max(0, i - 1))}
            disabled={currentSectionIdx === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />Previous
          </Button>
          <span className="text-xs text-gray-500">
            Section {currentSectionIdx + 1} of {sections.length}
          </span>
          <Button
            size="sm"
            onClick={() => setCurrentSectionIdx(i => Math.min(sections.length - 1, i + 1))}
            disabled={currentSectionIdx === sections.length - 1}
          >
            Next<ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function RunnerSection({ section, blockValues, onBlockChange, isReadOnly }: {
  section: ProcedureSection
  blockValues: BlockValueMap
  onBlockChange: (blockId: string, value?: string, completed?: boolean, timerElapsed?: number) => void
  isReadOnly: boolean
}) {
  const style = section.style as Record<string, string>
  return (
    <div
      className="rounded-xl border border-gray-200 overflow-hidden"
      style={{ backgroundColor: style.backgroundColor }}
    >
      <div className="border-b border-gray-100 bg-white/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
        {section.description && <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>}
      </div>
      <div className="p-4 space-y-3 bg-white/50">
        {section.blocks.map(block => (
          <RunnerBlock
            key={block.id}
            block={block}
            value={blockValues[block.id]?.value}
            completed={blockValues[block.id]?.completed ?? false}
            timerElapsed={blockValues[block.id]?.timerElapsed}
            onChange={(value, completed, timerElapsed) => onBlockChange(block.id, value, completed, timerElapsed)}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  )
}
