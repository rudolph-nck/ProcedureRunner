'use client'

import { useBuilderStore } from '@/store/builder-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { ProcedureBlock } from '@/types'
import { isInputBlock } from '@/lib/utils'

interface Props { block: ProcedureBlock }

export function ValidationSettings({ block }: Props) {
  const { updateBlockValidation } = useBuilderStore()
  const v = block.validation as Record<string, unknown>

  if (!isInputBlock(block.type)) {
    return <p className="text-xs text-gray-400">Validation is not applicable for this block type.</p>
  }

  const set = (key: string, value: unknown) => {
    updateBlockValidation(block.id, { ...v, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Required</Label>
        <Switch checked={Boolean(v.required)} onCheckedChange={val => set('required', val)} />
      </div>

      {['text_field', 'long_text', 'url_input', 'email_input'].includes(block.type) && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Min Length</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={String(v.minLength ?? '')}
              placeholder="No minimum"
              onChange={e => set('minLength', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Length</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={String(v.maxLength ?? '')}
              placeholder="No maximum"
              onChange={e => set('maxLength', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </>
      )}

      {block.type === 'number_field' && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Minimum Value</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={String(v.min ?? '')}
              placeholder="No minimum"
              onChange={e => set('min', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Maximum Value</Label>
            <Input
              type="number"
              className="h-7 text-xs"
              value={String(v.max ?? '')}
              placeholder="No maximum"
              onChange={e => set('max', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Validation Error Message</Label>
        <Input
          className="h-7 text-xs"
          value={String(v.message ?? '')}
          placeholder="This field is required"
          onChange={e => set('message', e.target.value)}
        />
      </div>
    </div>
  )
}
