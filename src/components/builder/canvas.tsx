'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, closestCenter, DragMoveEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore } from '@/store/builder-store'
import { BlockRenderer } from './block-renderer'
import { SectionCard } from './section-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProcedureSection } from '@/types'
import { Plus, Save } from 'lucide-react'
import { useState } from 'react'

interface Props {
  versionId: string
  isPublished: boolean
  onSave: (versionId: string, sections: ProcedureSection[]) => void
}

export function Canvas({ versionId, isPublished, onSave }: Props) {
  const {
    sections, selectedBlockId, selectBlock, addSection,
    reorderSections, reorderBlocks, moveBlock, isDirty,
  } = useBuilderStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const saveTimerRef = useRef<NodeJS.Timeout>()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeBlock = activeId
    ? sections.flatMap(s => s.blocks).find(b => b.id === activeId)
    : null

  // Auto-save on change with debounce
  useEffect(() => {
    if (!isDirty) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const state = useBuilderStore.getState()
      if (state.isDirty && state.versionId) {
        onSave(state.versionId, state.sections)
      }
    }, 3000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [isDirty, onSave])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if reordering sections
    const activeSectionIdx = sections.findIndex(s => s.id === activeId)
    const overSectionIdx = sections.findIndex(s => s.id === overId)

    if (activeSectionIdx !== -1 && overSectionIdx !== -1) {
      const orderedIds = arrayMove(sections.map(s => s.id), activeSectionIdx, overSectionIdx)
      reorderSections(orderedIds)
      return
    }

    // Check if reordering blocks within or between sections
    for (const section of sections) {
      const blockIds = section.blocks.map(b => b.id)
      const activeBlockIdx = blockIds.indexOf(activeId)
      const overBlockIdx = blockIds.indexOf(overId)

      if (activeBlockIdx !== -1 && overBlockIdx !== -1) {
        const newOrder = arrayMove(blockIds, activeBlockIdx, overBlockIdx)
        reorderBlocks(section.id, newOrder)
        return
      }
    }

    // Move block to different section
    const activeBlockSection = sections.find(s => s.blocks.some(b => b.id === activeId))
    const overSection = sections.find(s => s.id === overId || s.blocks.some(b => b.id === overId))
    if (activeBlockSection && overSection && activeBlockSection.id !== overSection.id) {
      const afterBlock = overSection.blocks.find(b => b.id === overId)
      moveBlock(activeId, overSection.id, afterBlock?.id)
    }
  }, [sections, reorderSections, reorderBlocks, moveBlock])

  return (
    <div className="min-h-full p-6" onClick={() => selectBlock(null)}>
      <div className="mx-auto max-w-3xl space-y-4">
        {isPublished && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This version is published and read-only. Click <strong>New Draft</strong> to edit.
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map(section => (
              <SectionCard key={section.id} section={section} isPublished={isPublished} />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeBlock && (
              <div className="block-drag-overlay rounded-lg border border-blue-200 bg-white p-3">
                <BlockRenderer block={activeBlock} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {!isPublished && (
          <button
            onClick={(e) => { e.stopPropagation(); addSection() }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm text-gray-400 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        )}

        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Plus className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Start building your procedure</h3>
            <p className="mb-4 text-sm text-gray-500 max-w-sm">
              Add sections to organize your content, then add blocks from the left panel.
            </p>
            <Button onClick={() => addSection()}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Section
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
