'use client'

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { LeftPanel } from './left-panel'
import { Canvas } from './canvas'
import { RightPanel } from './right-panel'
import type { ProcedureSection } from '@/types'

interface Props {
  procedureId: string
  versionId: string
  isPublished: boolean
  onSave: (versionId: string, sections: ProcedureSection[]) => void
}

export function BuilderLayout({ procedureId, versionId, isPublished, onSave }: Props) {
  return (
    <div className="flex-1 overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={20} minSize={15} maxSize={30} className="border-r border-gray-200 bg-white">
          <LeftPanel />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-100 hover:bg-blue-200 transition-colors cursor-col-resize" />
        <Panel defaultSize={55} minSize={40} className="builder-canvas overflow-auto">
          <Canvas
            versionId={versionId}
            isPublished={isPublished}
            onSave={onSave}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-100 hover:bg-blue-200 transition-colors cursor-col-resize" />
        <Panel defaultSize={25} minSize={20} maxSize={35} className="border-l border-gray-200 bg-white overflow-auto">
          <RightPanel />
        </Panel>
      </PanelGroup>
    </div>
  )
}
