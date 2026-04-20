'use client'

import { useState } from 'react'
import { useBuilderStore } from '@/store/builder-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getBlocksByCategory } from '@/lib/block-registry'
import { cn } from '@/lib/utils'
import type { BlockType } from '@/types'
import { Plus, Search, GripVertical, ChevronRight } from 'lucide-react'

export function LeftPanel() {
  const { sections, selectedSectionId, selectedBlockId, addSection, selectBlock, selectSection, addBlock } = useBuilderStore()
  const [search, setSearch] = useState('')
  const blocksByCategory = getBlocksByCategory()

  const filteredCategories = Object.entries(blocksByCategory).map(([cat, blocks]) => ({
    cat,
    blocks: blocks.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase())),
  })).filter(({ blocks }) => !search || blocks.length > 0)

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="blocks" className="flex flex-col h-full">
        <div className="border-b border-gray-100 px-3 pt-3">
          <TabsList className="w-full h-8 text-xs">
            <TabsTrigger value="outline" className="flex-1 text-xs">Outline</TabsTrigger>
            <TabsTrigger value="blocks" className="flex-1 text-xs">Blocks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="outline" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sections</span>
                <Button size="icon-sm" variant="ghost" onClick={() => addSection()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {sections.length === 0 && (
                <p className="px-1 text-xs text-gray-400">No sections yet. Click + to add one.</p>
              )}
              {sections.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => selectSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      selectedSectionId === section.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <GripVertical className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="font-medium truncate">{section.title}</span>
                    <span className="ml-auto text-[10px] text-gray-400 shrink-0">{section.blocks.length}</span>
                  </button>
                  {section.blocks.map(block => (
                    <button
                      key={block.id}
                      onClick={() => selectBlock(block.id)}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-md px-5 py-1 text-left text-[11px] transition-colors',
                        selectedBlockId === block.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      <span className="truncate">{(block.content as Record<string, string>)?.label ?? (block.content as Record<string, string>)?.title ?? block.type}</span>
                    </button>
                  ))}
                </div>
              ))}
              {sections.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => addSection()}>
                  <Plus className="mr-1 h-3.5 w-3.5" />Add Section
                </Button>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="blocks" className="flex-1 overflow-hidden m-0">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-7 h-7 text-xs"
                placeholder="Search blocks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-full pb-4">
            <div className="p-2 space-y-3">
              {sections.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                  <p className="text-xs text-gray-400">Add a section first, then drag blocks onto the canvas.</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => addSection()}>
                    <Plus className="mr-1 h-3.5 w-3.5" />Add Section
                  </Button>
                </div>
              )}
              {filteredCategories.map(({ cat, blocks }) => (
                <div key={cat}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-1">{cat}</p>
                  <div className="space-y-1">
                    {blocks.map(def => {
                      const Icon = def.icon
                      return (
                        <button
                          key={def.type}
                          disabled={sections.length === 0}
                          onClick={() => {
                            if (sections.length === 0) return
                            const targetSection = selectedSectionId ?? sections[sections.length - 1]?.id
                            if (targetSection) addBlock(targetSection, def.type as BlockType)
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs transition-all group',
                            sections.length === 0
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:border-blue-200 hover:bg-blue-50 cursor-pointer active:scale-[0.98]'
                          )}
                          title={def.description}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 group-hover:bg-blue-100 shrink-0">
                            <Icon className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{def.label}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
