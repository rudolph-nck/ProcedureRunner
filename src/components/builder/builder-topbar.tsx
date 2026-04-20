'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBuilderStore } from '@/store/builder-store'
import { cn, getStatusColor } from '@/lib/utils'
import type { Procedure } from '@/types'
import { ChevronLeft, Save, Send, Play, Eye, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  procedure?: Procedure
  versionId: string
  onSave: () => void
  onPublish: () => void
  isSaving: boolean
  isPublishing: boolean
}

export function BuilderTopBar({ procedure, versionId, onSave, onPublish, isSaving, isPublishing }: Props) {
  const { isDirty, isSaving: storeSaving, sections, versionId: storeVersionId } = useBuilderStore()
  const router = useRouter()

  const handleSave = () => {
    const state = useBuilderStore.getState()
    if (state.versionId) onSave()
  }

  return (
    <div className="flex h-12 items-center gap-3 border-b border-gray-200 bg-white px-4">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href="/procedures"><ChevronLeft className="h-4 w-4" /></Link>
      </Button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-gray-900 truncate">{procedure?.title ?? 'Loading...'}</h1>
        {procedure && (
          <Badge className={cn('text-[10px] shrink-0', getStatusColor(procedure.status))} variant="outline">
            {procedure.status}
          </Badge>
        )}
        {isDirty && <span className="text-[10px] text-amber-600 shrink-0">● Unsaved changes</span>}
        {!isDirty && !isSaving && <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1"><Check className="h-3 w-3" />Saved</span>}
      </div>

      <div className="flex items-center gap-2">
        {procedure?.status === 'published' && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/runner/new?procedureId=${procedure.id}`}>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Run
            </Link>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          Save
        </Button>

        <Button
          size="sm"
          onClick={onPublish}
          disabled={isPublishing || isSaving}
        >
          {isPublishing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
          {procedure?.status === 'published' ? 'New Draft' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
