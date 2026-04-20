'use client'

import { useBuilderStore } from '@/store/builder-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ProcedureSection } from '@/types'

interface Props { section: ProcedureSection }

const BG_COLORS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Blue', value: '#EFF6FF' },
  { label: 'Green', value: '#F0FDF4' },
  { label: 'Amber', value: '#FFFBEB' },
  { label: 'Red', value: '#FFF1F2' },
  { label: 'Purple', value: '#FAF5FF' },
  { label: 'Gray', value: '#F9FAFB' },
  { label: 'Dark', value: '#1F2937' },
]

export function SectionSettings({ section }: Props) {
  const { updateSection } = useBuilderStore()
  const style = section.style as Record<string, string>

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Section Title</Label>
        <Input
          className="h-7 text-xs"
          value={section.title}
          onChange={e => updateSection(section.id, { title: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Textarea
          className="text-xs"
          rows={2}
          value={section.description ?? ''}
          placeholder="Optional section description..."
          onChange={e => updateSection(section.id, { description: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Background Color</Label>
        <div className="flex flex-wrap gap-2">
          {BG_COLORS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => updateSection(section.id, { style: { ...style, backgroundColor: c.value } })}
              className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${
                (style.backgroundColor ?? '#FFFFFF') === c.value ? 'border-blue-500 scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
