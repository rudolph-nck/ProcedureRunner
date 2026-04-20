import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { ProcedureSection, ProcedureBlock, BlockType, BlockContent, BlockStyle, BlockValidation, BlockLogic } from '@/types'
import { getBlockDef } from '@/lib/block-registry'
import { generateId } from '@/lib/utils'

interface BuilderState {
  procedureId: string | null
  versionId: string | null
  sections: ProcedureSection[]
  selectedBlockId: string | null
  selectedSectionId: string | null
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  activePanel: 'outline' | 'blocks'

  // Actions
  init: (procedureId: string, versionId: string, sections: ProcedureSection[]) => void
  setSections: (sections: ProcedureSection[]) => void
  selectBlock: (blockId: string | null) => void
  selectSection: (sectionId: string | null) => void
  setActivePanel: (panel: 'outline' | 'blocks') => void
  setDirty: (dirty: boolean) => void
  setSaving: (saving: boolean) => void

  addSection: () => ProcedureSection
  updateSection: (sectionId: string, updates: Partial<ProcedureSection>) => void
  deleteSection: (sectionId: string) => void
  reorderSections: (orderedIds: string[]) => void

  addBlock: (sectionId: string, type: BlockType, afterBlockId?: string) => ProcedureBlock
  updateBlock: (blockId: string, updates: Partial<ProcedureBlock>) => void
  updateBlockContent: (blockId: string, content: BlockContent) => void
  updateBlockStyle: (blockId: string, style: BlockStyle) => void
  updateBlockValidation: (blockId: string, validation: BlockValidation) => void
  updateBlockLogic: (blockId: string, logic: BlockLogic) => void
  deleteBlock: (blockId: string) => void
  reorderBlocks: (sectionId: string, orderedIds: string[]) => void
  moveBlock: (blockId: string, targetSectionId: string, afterBlockId?: string) => void
  duplicateBlock: (blockId: string) => void

  getBlock: (blockId: string) => ProcedureBlock | undefined
  getSection: (sectionId: string) => ProcedureSection | undefined
  getSelectedBlock: () => ProcedureBlock | undefined
  getAllBlocks: () => ProcedureBlock[]
}

export const useBuilderStore = create<BuilderState>()(
  subscribeWithSelector((set, get) => ({
    procedureId: null,
    versionId: null,
    sections: [],
    selectedBlockId: null,
    selectedSectionId: null,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    activePanel: 'blocks',

    init: (procedureId, versionId, sections) => {
      set({ procedureId, versionId, sections, isDirty: false, selectedBlockId: null, selectedSectionId: null })
    },

    setSections: (sections) => set({ sections }),
    selectBlock: (blockId) => set({ selectedBlockId: blockId }),
    selectSection: (sectionId) => set({ selectedSectionId: sectionId }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    setDirty: (dirty) => set({ isDirty: dirty }),
    setSaving: (saving) => set({ isSaving: saving }),

    addSection: () => {
      const section: ProcedureSection = {
        id: `section_${generateId()}`,
        versionId: get().versionId ?? '',
        title: 'New Section',
        description: '',
        order: get().sections.length,
        style: {},
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set(state => ({ sections: [...state.sections, section], isDirty: true }))
      return section
    },

    updateSection: (sectionId, updates) => {
      set(state => ({
        sections: state.sections.map(s =>
          s.id === sectionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        ),
        isDirty: true,
      }))
    },

    deleteSection: (sectionId) => {
      set(state => ({
        sections: state.sections
          .filter(s => s.id !== sectionId)
          .map((s, i) => ({ ...s, order: i })),
        selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
        isDirty: true,
      }))
    },

    reorderSections: (orderedIds) => {
      set(state => ({
        sections: orderedIds.map((id, i) => {
          const s = state.sections.find(s => s.id === id)!
          return { ...s, order: i }
        }),
        isDirty: true,
      }))
    },

    addBlock: (sectionId, type, afterBlockId) => {
      const def = getBlockDef(type)
      const section = get().sections.find(s => s.id === sectionId)
      if (!section) throw new Error('Section not found')

      const afterIndex = afterBlockId
        ? section.blocks.findIndex(b => b.id === afterBlockId)
        : -1
      const insertAt = afterIndex >= 0 ? afterIndex + 1 : section.blocks.length

      const block: ProcedureBlock = {
        id: `block_${generateId()}`,
        sectionId,
        type,
        order: insertAt,
        content: def?.defaultContent ?? {},
        style: def?.defaultStyle ?? {},
        validation: def?.defaultValidation ?? {},
        logic: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set(state => ({
        sections: state.sections.map(s => {
          if (s.id !== sectionId) return s
          const newBlocks = [...s.blocks]
          newBlocks.splice(insertAt, 0, block)
          return { ...s, blocks: newBlocks.map((b, i) => ({ ...b, order: i })) }
        }),
        selectedBlockId: block.id,
        isDirty: true,
      }))
      return block
    },

    updateBlock: (blockId, updates) => {
      set(state => ({
        sections: state.sections.map(s => ({
          ...s,
          blocks: s.blocks.map(b =>
            b.id === blockId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),
        isDirty: true,
      }))
    },

    updateBlockContent: (blockId, content) => {
      get().updateBlock(blockId, { content })
    },

    updateBlockStyle: (blockId, style) => {
      set(state => ({
        sections: state.sections.map(s => ({
          ...s,
          blocks: s.blocks.map(b =>
            b.id === blockId ? { ...b, style: { ...b.style, ...style }, updatedAt: new Date().toISOString() } : b
          ),
        })),
        isDirty: true,
      }))
    },

    updateBlockValidation: (blockId, validation) => {
      set(state => ({
        sections: state.sections.map(s => ({
          ...s,
          blocks: s.blocks.map(b =>
            b.id === blockId ? { ...b, validation: { ...b.validation, ...validation }, updatedAt: new Date().toISOString() } : b
          ),
        })),
        isDirty: true,
      }))
    },

    updateBlockLogic: (blockId, logic) => {
      set(state => ({
        sections: state.sections.map(s => ({
          ...s,
          blocks: s.blocks.map(b =>
            b.id === blockId ? { ...b, logic: { ...b.logic, ...logic }, updatedAt: new Date().toISOString() } : b
          ),
        })),
        isDirty: true,
      }))
    },

    deleteBlock: (blockId) => {
      set(state => ({
        sections: state.sections.map(s => ({
          ...s,
          blocks: s.blocks
            .filter(b => b.id !== blockId)
            .map((b, i) => ({ ...b, order: i })),
        })),
        selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
        isDirty: true,
      }))
    },

    reorderBlocks: (sectionId, orderedIds) => {
      set(state => ({
        sections: state.sections.map(s => {
          if (s.id !== sectionId) return s
          return {
            ...s,
            blocks: orderedIds.map((id, i) => {
              const b = s.blocks.find(b => b.id === id)!
              return { ...b, order: i }
            }),
          }
        }),
        isDirty: true,
      }))
    },

    moveBlock: (blockId, targetSectionId, afterBlockId) => {
      const state = get()
      let block: ProcedureBlock | undefined

      const sections = state.sections.map(s => {
        const found = s.blocks.find(b => b.id === blockId)
        if (found) block = found
        return {
          ...s,
          blocks: s.blocks
            .filter(b => b.id !== blockId)
            .map((b, i) => ({ ...b, order: i })),
        }
      })

      if (!block) return

      const updatedBlock = { ...block, sectionId: targetSectionId }
      const targetSection = sections.find(s => s.id === targetSectionId)
      if (!targetSection) return

      const afterIndex = afterBlockId
        ? targetSection.blocks.findIndex(b => b.id === afterBlockId)
        : -1
      const insertAt = afterIndex >= 0 ? afterIndex + 1 : targetSection.blocks.length

      const finalSections = sections.map(s => {
        if (s.id !== targetSectionId) return s
        const newBlocks = [...s.blocks]
        newBlocks.splice(insertAt, 0, updatedBlock)
        return { ...s, blocks: newBlocks.map((b, i) => ({ ...b, order: i })) }
      })

      set({ sections: finalSections, isDirty: true })
    },

    duplicateBlock: (blockId) => {
      const block = get().getBlock(blockId)
      if (!block) return
      const newBlock: ProcedureBlock = {
        ...block,
        id: `block_${generateId()}`,
        order: block.order + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set(state => ({
        sections: state.sections.map(s => {
          if (s.id !== block.sectionId) return s
          const idx = s.blocks.findIndex(b => b.id === blockId)
          const newBlocks = [...s.blocks]
          newBlocks.splice(idx + 1, 0, newBlock)
          return { ...s, blocks: newBlocks.map((b, i) => ({ ...b, order: i })) }
        }),
        selectedBlockId: newBlock.id,
        isDirty: true,
      }))
    },

    getBlock: (blockId) => {
      for (const section of get().sections) {
        const block = section.blocks.find(b => b.id === blockId)
        if (block) return block
      }
      return undefined
    },

    getSection: (sectionId) => {
      return get().sections.find(s => s.id === sectionId)
    },

    getSelectedBlock: () => {
      const { selectedBlockId } = get()
      if (!selectedBlockId) return undefined
      return get().getBlock(selectedBlockId)
    },

    getAllBlocks: () => {
      return get().sections.flatMap(s => s.blocks)
    },
  }))
)
