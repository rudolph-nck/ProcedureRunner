'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBuilderStore } from '@/store/builder-store'
import { BuilderLayout } from './builder-layout'
import { BuilderTopBar } from './builder-topbar'
import { parseJson } from '@/lib/utils'
import type { ProcedureSection } from '@/types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Props { procedureId: string }

export function BuilderShell({ procedureId }: Props) {
  const queryClient = useQueryClient()
  const { init, setSaving, setDirty } = useBuilderStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['procedure-builder', procedureId],
    queryFn: async () => {
      const res = await fetch(`/api/procedures/${procedureId}/version`)
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
  })

  const { data: procData } = useQuery({
    queryKey: ['procedure', procedureId],
    queryFn: async () => {
      const res = await fetch(`/api/procedures/${procedureId}`)
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
  })

  useEffect(() => {
    if (data?.data) {
      const version = data.data
      const sections: ProcedureSection[] = version.sections.map((s: ProcedureSection & { style: string | object }) => ({
        ...s,
        style: typeof s.style === 'string' ? parseJson(s.style, {}) : s.style,
        blocks: s.blocks.map((b: unknown) => {
          const block = b as Record<string, unknown>
          return {
            ...block,
            content: typeof block.content === 'string' ? parseJson(block.content as string, {}) : block.content,
            style: typeof block.style === 'string' ? parseJson(block.style as string, {}) : block.style,
            validation: typeof block.validation === 'string' ? parseJson(block.validation as string, {}) : block.validation,
            logic: typeof block.logic === 'string' ? parseJson(block.logic as string, {}) : block.logic,
          }
        }),
      }))
      init(procedureId, version.id, sections)
    }
  }, [data, procedureId, init])

  const saveMutation = useMutation({
    mutationFn: async ({ versionId, sections }: { versionId: string; sections: ProcedureSection[] }) => {
      const res = await fetch(`/api/procedures/${procedureId}/builder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, sections }),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onMutate: () => setSaving(true),
    onSuccess: (result) => {
      setSaving(false)
      setDirty(false)
      if (result?.data?.sections) {
        const version = result.data
        const sections: ProcedureSection[] = version.sections.map((s: ProcedureSection & { style: string | object }) => ({
          ...s,
          style: typeof s.style === 'string' ? parseJson(s.style, {}) : s.style,
          blocks: s.blocks.map((b: unknown) => {
            const block = b as Record<string, unknown>
            return {
              ...block,
              content: typeof block.content === 'string' ? parseJson(block.content as string, {}) : block.content,
              style: typeof block.style === 'string' ? parseJson(block.style as string, {}) : block.style,
              validation: typeof block.validation === 'string' ? parseJson(block.validation as string, {}) : block.validation,
              logic: typeof block.logic === 'string' ? parseJson(block.logic as string, {}) : block.logic,
            }
          }),
        }))
        init(procedureId, version.id, sections)
      }
      queryClient.invalidateQueries({ queryKey: ['procedure', procedureId] })
    },
    onError: () => {
      setSaving(false)
      toast.error('Failed to save. Please try again.')
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (notes?: string) => {
      const res = await fetch(`/api/procedures/${procedureId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error('Failed to publish')
      return res.json()
    },
    onSuccess: (result) => {
      toast.success(result.data?.message ?? 'Published!')
      queryClient.invalidateQueries({ queryKey: ['procedure', procedureId] })
      queryClient.invalidateQueries({ queryKey: ['procedure-builder', procedureId] })
    },
    onError: () => toast.error('Failed to publish'),
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Failed to load procedure.</p>
      </div>
    )
  }

  const versionId = data.data.id
  const procedure = procData?.data

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <BuilderTopBar
        procedure={procedure}
        versionId={versionId}
        onSave={() => {
          const { versionId: vid, sections } = useBuilderStore.getState()
          if (vid) saveMutation.mutate({ versionId: vid, sections })
        }}
        onPublish={() => publishMutation.mutate(undefined)}
        isSaving={saveMutation.isPending}
        isPublishing={publishMutation.isPending}
      />
      <BuilderLayout
        procedureId={procedureId}
        versionId={versionId}
        isPublished={data.data.status === 'published'}
        onSave={(versionId, sections) => saveMutation.mutate({ versionId, sections })}
      />
    </div>
  )
}
