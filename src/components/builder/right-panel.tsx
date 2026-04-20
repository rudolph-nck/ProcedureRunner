'use client'

import { useBuilderStore } from '@/store/builder-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentSettings } from './settings/content-settings'
import { StyleSettings } from './settings/style-settings'
import { ValidationSettings } from './settings/validation-settings'
import { SectionSettings } from './settings/section-settings'
import { getBlockLabel } from '@/lib/utils'
import { getBlockDef } from '@/lib/block-registry'
import { Settings2, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RightPanel() {
  const { getSelectedBlock, selectedBlockId, selectedSectionId, getSection, deleteBlock, duplicateBlock } = useBuilderStore()

  const selectedBlock = getSelectedBlock()
  const selectedSection = selectedSectionId ? getSection(selectedSectionId) : undefined

  if (!selectedBlock && !selectedSection) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <Settings2 className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No selection</p>
          <p className="text-xs text-gray-400 mt-1">Click a block or section to configure it</p>
        </div>
      </div>
    )
  }

  if (selectedBlock) {
    const def = getBlockDef(selectedBlock.type)
    const Icon = def?.icon

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {Icon && (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 shrink-0">
                  <Icon className="h-3.5 w-3.5 text-blue-600" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{getBlockLabel(selectedBlock.type)}</p>
                <p className="text-[10px] text-gray-400 truncate">{selectedBlock.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="icon-sm" variant="ghost" onClick={() => duplicateBlock(selectedBlock.id)} title="Duplicate">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => deleteBlock(selectedBlock.id)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="content" className="flex flex-col flex-1 overflow-hidden">
          <div className="border-b border-gray-100 px-3 py-2">
            <TabsList className="w-full h-7 text-xs">
              <TabsTrigger value="content" className="flex-1 text-xs">Content</TabsTrigger>
              <TabsTrigger value="style" className="flex-1 text-xs">Style</TabsTrigger>
              <TabsTrigger value="validate" className="flex-1 text-xs">Rules</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="content" className="m-0 p-3">
              <ContentSettings block={selectedBlock} />
            </TabsContent>
            <TabsContent value="style" className="m-0 p-3">
              <StyleSettings block={selectedBlock} />
            </TabsContent>
            <TabsContent value="validate" className="m-0 p-3">
              <ValidationSettings block={selectedBlock} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    )
  }

  if (selectedSection) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-semibold text-gray-900">Section Settings</p>
          <p className="text-[10px] text-gray-400 truncate">{selectedSection.title}</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3">
            <SectionSettings section={selectedSection} />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return null
}
