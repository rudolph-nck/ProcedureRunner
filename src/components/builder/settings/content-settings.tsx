'use client'

import { useBuilderStore } from '@/store/builder-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProcedureBlock, BlockContent } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

interface Props { block: ProcedureBlock }

export function ContentSettings({ block }: Props) {
  const { updateBlockContent } = useBuilderStore()
  const content = block.content as Record<string, unknown>

  const set = (key: string, value: unknown) => {
    updateBlockContent(block.id, { ...content, [key]: value })
  }

  const F = ({ label, field, placeholder, type = 'text' }: { label: string; field: string; placeholder?: string; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        className="h-7 text-xs"
        value={String(content[field] ?? '')}
        placeholder={placeholder}
        onChange={e => set(field, e.target.value)}
      />
    </div>
  )

  const T = ({ label, field, rows = 3, placeholder }: { label: string; field: string; rows?: number; placeholder?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Textarea
        className="text-xs"
        rows={rows}
        value={String(content[field] ?? '')}
        placeholder={placeholder}
        onChange={e => set(field, e.target.value)}
      />
    </div>
  )

  const Tog = ({ label, field }: { label: string; field: string }) => (
    <div className="flex items-center justify-between py-1">
      <Label className="text-xs">{label}</Label>
      <Switch checked={Boolean(content[field])} onCheckedChange={v => set(field, v)} />
    </div>
  )

  switch (block.type) {
    case 'section_header':
    case 'subsection':
      return (
        <div className="space-y-3">
          <F label="Text" field="text" placeholder="Header text..." />
        </div>
      )

    case 'rich_text':
      return (
        <div className="space-y-3">
          <T label="HTML Content" field="html" rows={6} placeholder="<p>Enter content...</p>" />
          <p className="text-[10px] text-gray-400">Supports basic HTML tags: p, strong, em, ul, ol, li</p>
        </div>
      )

    case 'instruction':
      return <T label="Instruction Text" field="text" rows={3} />

    case 'warning':
      return (
        <div className="space-y-3">
          <F label="Title" field="title" placeholder="Warning title..." />
          <T label="Message" field="message" rows={3} placeholder="Warning message..." />
          <div className="space-y-1">
            <Label className="text-xs">Variant</Label>
            <Select value={String(content.variant ?? 'warning')} onValueChange={v => set('variant', v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="danger">Danger</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-3">
          <T label="Quote Text" field="text" rows={3} />
          <F label="Source / Reference" field="source" placeholder="e.g. Policy 2.4.1" />
        </div>
      )

    case 'link':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Link label" />
          <F label="URL" field="url" placeholder="https://" />
          <F label="Description" field="description" placeholder="Optional description" />
        </div>
      )

    case 'image':
      return (
        <div className="space-y-3">
          <F label="Image URL" field="url" placeholder="https://example.com/image.png" />
          <F label="Alt Text" field="alt" placeholder="Describe the image" />
          <F label="Caption" field="caption" placeholder="Optional caption" />
        </div>
      )

    case 'table': {
      const headers = (content.headers as string[]) ?? []
      const rows = (content.rows as string[][]) ?? []
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Column Headers</Label>
            <div className="space-y-1">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    className="h-7 text-xs flex-1"
                    value={h}
                    onChange={e => {
                      const newHeaders = [...headers]
                      newHeaders[i] = e.target.value
                      set('headers', newHeaders)
                    }}
                  />
                  <Button size="icon-sm" variant="ghost" onClick={() => {
                    set('headers', headers.filter((_, idx) => idx !== i))
                    set('rows', rows.map(r => r.filter((_, idx) => idx !== i)))
                  }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {
                set('headers', [...headers, `Column ${headers.length + 1}`])
                set('rows', rows.map(r => [...r, '']))
              }}>
                <Plus className="mr-1 h-3 w-3" />Add Column
              </Button>
            </div>
          </div>
        </div>
      )
    }

    case 'checklist_item':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Task description" />
          <T label="Description / Help Text" field="description" rows={2} placeholder="Additional context..." />
        </div>
      )

    case 'checklist_group': {
      const items = (content.items as string[]) ?? []
      return (
        <div className="space-y-3">
          <F label="Group Label" field="label" placeholder="Group name" />
          <div className="space-y-1">
            <Label className="text-xs">Items</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-1">
                <Input
                  className="h-7 text-xs flex-1"
                  value={item}
                  onChange={e => {
                    const newItems = [...items]
                    newItems[i] = e.target.value
                    set('items', newItems)
                  }}
                />
                <Button size="icon-sm" variant="ghost" onClick={() => set('items', items.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => set('items', [...items, `Task ${items.length + 1}`])}>
              <Plus className="mr-1 h-3 w-3" />Add Item
            </Button>
          </div>
        </div>
      )
    }

    case 'text_field':
    case 'url_input':
    case 'email_input':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Field label" />
          <F label="Placeholder" field="placeholder" placeholder="Input placeholder" />
          <T label="Help Text" field="description" rows={2} placeholder="Optional description" />
        </div>
      )

    case 'long_text':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Field label" />
          <F label="Placeholder" field="placeholder" placeholder="Enter text..." />
          <F label="Rows" field="rows" type="number" placeholder="4" />
          <T label="Help Text" field="description" rows={2} placeholder="Optional description" />
        </div>
      )

    case 'number_field':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Field label" />
          <F label="Unit" field="unit" placeholder="e.g. kg, km, minutes" />
          <F label="Placeholder" field="placeholder" placeholder="0" />
        </div>
      )

    case 'dropdown': {
      const opts = (content.options as string[]) ?? []
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Field label" />
          <F label="Placeholder" field="placeholder" placeholder="Select..." />
          <div className="space-y-1">
            <Label className="text-xs">Options</Label>
            {opts.map((opt, i) => (
              <div key={i} className="flex gap-1">
                <Input
                  className="h-7 text-xs flex-1"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...opts]
                    newOpts[i] = e.target.value
                    set('options', newOpts)
                  }}
                />
                <Button size="icon-sm" variant="ghost" onClick={() => set('options', opts.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => set('options', [...opts, `Option ${opts.length + 1}`])}>
              <Plus className="mr-1 h-3 w-3" />Add Option
            </Button>
          </div>
        </div>
      )
    }

    case 'multi_select': {
      const opts = (content.options as string[]) ?? []
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Field label" />
          <div className="space-y-1">
            <Label className="text-xs">Options</Label>
            {opts.map((opt, i) => (
              <div key={i} className="flex gap-1">
                <Input className="h-7 text-xs flex-1" value={opt} onChange={e => { const n = [...opts]; n[i] = e.target.value; set('options', n) }} />
                <Button size="icon-sm" variant="ghost" onClick={() => set('options', opts.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => set('options', [...opts, `Option ${opts.length + 1}`])}>
              <Plus className="mr-1 h-3 w-3" />Add Option
            </Button>
          </div>
        </div>
      )
    }

    case 'yes_no':
      return (
        <div className="space-y-3">
          <F label="Question" field="label" placeholder="Yes or no question?" />
          <T label="Description" field="description" rows={2} placeholder="Context for this choice" />
        </div>
      )

    case 'signature':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Signature label" />
          <T label="Attestation Text" field="description" rows={2} placeholder="I confirm that..." />
          <Tog label="Require Name" field="requireName" />
        </div>
      )

    case 'file_upload':
    case 'evidence_upload':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Upload label" />
          <F label="Accepted Types" field="accept" placeholder="e.g. image/*, application/pdf" />
          <T label="Description" field="description" rows={2} placeholder="What to upload..." />
        </div>
      )

    case 'timer':
    case 'stopwatch':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Timer label" />
          <T label="Description" field="description" rows={2} placeholder="Purpose of this timer" />
          {block.type === 'timer' && <Tog label="Auto Start" field="autoStart" />}
        </div>
      )

    case 'countdown':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Countdown label" />
          <F label="Duration (seconds)" field="duration" type="number" placeholder="300" />
          <T label="Description" field="description" rows={2} placeholder="Purpose of countdown" />
        </div>
      )

    case 'approval':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Approval label" />
          <T label="Description" field="description" rows={3} placeholder="Approval instructions..." />
        </div>
      )

    case 'stop_hold':
      return (
        <div className="space-y-3">
          <F label="Title" field="title" placeholder="STOP" />
          <T label="Message" field="message" rows={3} placeholder="Do not proceed until..." />
          <div className="space-y-1">
            <Label className="text-xs">Severity</Label>
            <Select value={String(content.severity ?? 'stop')} onValueChange={v => set('severity', v)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stop">Stop</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="caution">Caution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case 'decision':
      return (
        <div className="space-y-3">
          <F label="Question" field="question" placeholder="Decision question" />
          <F label="Yes Option Label" field="yesLabel" placeholder="Yes — Continue" />
          <F label="No Option Label" field="noLabel" placeholder="No — Stop" />
        </div>
      )

    case 'progress_marker':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Progress marker label" />
          <F label="Percentage" field="percentage" type="number" placeholder="50" />
          <T label="Description" field="description" rows={2} placeholder="Progress checkpoint description" />
        </div>
      )

    case 'completion_checkpoint':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Completion label" />
          <T label="Completion Message" field="message" rows={2} placeholder="All tasks complete!" />
        </div>
      )

    case 'assigned_owner':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Assignment label" />
          <T label="Description" field="description" rows={2} placeholder="Assignment instructions" />
        </div>
      )

    case 'due_date':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Due date label" />
          <F label="Offset Days" field="offsetDays" type="number" placeholder="0" />
          <p className="text-[10px] text-gray-400">Offset from run start date</p>
        </div>
      )

    case 'review':
      return (
        <div className="space-y-3">
          <F label="Label" field="label" placeholder="Review label" />
          <T label="Instructions" field="description" rows={3} placeholder="What to review..." />
        </div>
      )

    default:
      return <p className="text-xs text-gray-400">No settings available for this block type.</p>
  }
}
