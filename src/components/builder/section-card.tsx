'use client'

import { useState } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore } from '@/store/builder-store'
import { BlockRenderer } from './block-renderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ProcedureSection, BlockType } from '@/types'
import { GripVertical, Trash2, Plus, ChevronDown, ChevronUp, Edit3, Check } from 'lucide-react'
import { getBlocksByCategory } from '@/lib/block-registry'

interface Props {
  section: ProcedureSection
  isPublished: boolean
}

export function SectionCard({ section, isPublished }: Props) {
  const { selectedSectionId, selectSection, updateSection, deleteSection, addBlock, selectBlock } = useBuilderStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(section.title)

  const isSelected = selectedSectionId === section.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      updateSection(section.id, { title: editTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const sectionStyle = section.style as Record<string, string>

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: sectionStyle.backgroundColor || undefined }}
      className={cn(
        'section-card relative transition-all',
        isDragging && 'opacity-50',
        isSelected && 'ring-2 ring-blue-400'
      )}
      onClick={(e) => { e.stopPropagation(); selectSection(section.id); selectBlock(null) }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        {!isPublished && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100">
            <GripVertical className="h-4 w-4 text-gray-300" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                className="h-7 text-sm font-semibold"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setIsEditingTitle(false) }}
                onBlur={handleTitleSave}
                autoFocus
              />
              <Button size="icon-sm" variant="ghost" onClick={handleTitleSave}><Check className="h-3.5 w-3.5" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-800 truncate">{section.title}</h2>
              {!isPublished && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true) }}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-gray-100 transition-opacity"
                >
                  <Edit3 className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
          )}
          {section.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{section.description}</p>}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-gray-400">{section.blocks.length} block{section.blocks.length !== 1 ? 's' : ''}</span>
          <Button size="icon-sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed) }}>
            {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </Button>
          {!isPublished && (
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); if (confirm('Delete this section?')) deleteSection(section.id) }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Blocks */}
      {!isCollapsed && (
        <div className="p-3 space-y-2">
          <SortableContext items={section.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {section.blocks.map(block => (
              <SortableBlock key={block.id} blockId={block.id} sectionId={section.id} isPublished={isPublished} />
            ))}
          </SortableContext>

          {!isPublished && (
            <QuickAddMenu sectionId={section.id} />
          )}
        </div>
      )}
    </div>
  )
}

function SortableBlock({ blockId, sectionId, isPublished }: { blockId: string; sectionId: string; isPublished: boolean }) {
  const { getBlock, selectedBlockId, selectBlock } = useBuilderStore()
  const block = getBlock(blockId)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: blockId })
  const style = { transform: CSS.Transform.toString(transform), transition }

  if (!block) return null
  const isSelected = selectedBlockId === blockId

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-white transition-all',
        isDragging ? 'opacity-50 shadow-lg' : '',
        isSelected ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-100 hover:border-gray-200'
      )}
      onClick={(e) => { e.stopPropagation(); selectBlock(blockId) }}
    >
      {!isPublished && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 rounded opacity-0 group-hover:opacity-100 z-10 hover:bg-gray-100"
        >
          <GripVertical className="h-3.5 w-3.5 text-gray-400" />
        </div>
      )}
      <div className={cn('px-3 py-2', !isPublished && 'pl-7')}>
        <BlockRenderer block={block} />
      </div>
    </div>
  )
}

function QuickAddMenu({ sectionId }: { sectionId: string }) {
  const { addBlock } = useBuilderStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const blocksByCategory = getBlocksByCategory()

  const quickBlocks: { type: BlockType; label: string }[] = [
    { type: 'checklist_item', label: 'Checklist Item' },
    { type: 'text_field', label: 'Text Field' },
    { type: 'instruction', label: 'Instruction' },
    { type: 'warning', label: 'Warning' },
  ]

  if (!open) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Block
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3" onClick={e => e.stopPropagation()}>
      <div className="mb-2 flex items-center gap-2">
        <Input
          className="h-7 text-xs flex-1"
          placeholder="Search blocks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <Button size="icon-sm" variant="ghost" onClick={() => { setOpen(false); setSearch('') }}>
          <span className="text-xs">✕</span>
        </Button>
      </div>

      {!search && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quickBlocks.map(b => (
            <button
              key={b.type}
              onClick={() => { addBlock(sectionId, b.type); setOpen(false) }}
              className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-40 overflow-y-auto space-y-1">
        {Object.entries(blocksByCategory).map(([cat, blocks]) => {
          const filtered = blocks.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()))
          if (filtered.length === 0) return null
          return (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase text-gray-400 mb-0.5">{cat}</p>
              {filtered.map(def => {
                const Icon = def.icon
                return (
                  <button
                    key={def.type}
                    onClick={() => { addBlock(sectionId, def.type as BlockType); setOpen(false) }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-white transition-colors text-gray-700"
                  >
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                    {def.label}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
