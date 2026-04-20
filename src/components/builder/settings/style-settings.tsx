'use client'

import { useBuilderStore } from '@/store/builder-store'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProcedureBlock } from '@/types'

interface Props { block: ProcedureBlock }

const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Blue', value: '#EFF6FF' },
  { label: 'Green', value: '#F0FDF4' },
  { label: 'Amber', value: '#FFFBEB' },
  { label: 'Red', value: '#FFF1F2' },
  { label: 'Purple', value: '#FAF5FF' },
  { label: 'Gray', value: '#F9FAFB' },
]

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Black', value: '#111827' },
  { label: 'Gray', value: '#6B7280' },
  { label: 'Blue', value: '#1D4ED8' },
  { label: 'Green', value: '#15803D' },
  { label: 'Red', value: '#B91C1C' },
  { label: 'Purple', value: '#6D28D9' },
]

export function StyleSettings({ block }: Props) {
  const { updateBlockStyle } = useBuilderStore()
  const style = block.style as Record<string, string>

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Background Color</Label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => updateBlockStyle(block.id, { backgroundColor: c.value || undefined })}
              className={`h-6 w-6 rounded-md border-2 transition-transform hover:scale-110 ${style.backgroundColor === (c.value || undefined) ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
              style={{ backgroundColor: c.value || '#fff' }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Text Color</Label>
        <div className="flex flex-wrap gap-1.5">
          {TEXT_COLORS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => updateBlockStyle(block.id, { textColor: c.value || undefined })}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${style.textColor === (c.value || undefined) ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
              style={{ backgroundColor: c.value || '#fff' }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Text Alignment</Label>
        <Select value={style.align ?? 'left'} onValueChange={v => updateBlockStyle(block.id, { align: v as 'left' | 'center' | 'right' })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Font Size</Label>
        <Select value={style.fontSize ?? 'sm'} onValueChange={v => updateBlockStyle(block.id, { fontSize: v })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Extra Small</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="base">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Font Weight</Label>
        <Select value={style.fontWeight ?? 'normal'} onValueChange={v => updateBlockStyle(block.id, { fontWeight: v })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="semibold">Semi Bold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
