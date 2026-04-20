'use client'

import type { ProcedureBlock, BlockType } from '@/types'
import { getBlockLabel } from '@/lib/utils'
import { getBlockDef } from '@/lib/block-registry'
import { cn } from '@/lib/utils'
import {
  AlertTriangle, AlertOctagon, CheckSquare, Minus, Quote, ExternalLink,
  Timer, Gauge, TimerOff, ThumbsUp, Eye, Lock, Split, GitBranch, Flag,
  User2, TrendingUp, CalendarCheck, PenLine, Upload, UploadCloud, Hash,
  Calendar, Clock4, ToggleLeft, ListFilter, ChevronDown, Globe, Mail, Table2
} from 'lucide-react'

interface Props {
  block: ProcedureBlock
  isDragging?: boolean
}

export function BlockRenderer({ block, isDragging }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any
  const style = block.style as Record<string, string>

  return (
    <div className={cn('w-full', isDragging && 'pointer-events-none')}>
      <BlockContent type={block.type} content={content} style={style} />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BlockContent({ type, content, style }: { type: BlockType; content: any; style: Record<string, string> }) {
  switch (type) {
    case 'section_header':
      return <h2 className="text-xl font-bold text-gray-900" style={{ color: style.textColor }}>{String(content.text ?? 'Section Header')}</h2>
    case 'subsection':
      return <h3 className="text-base font-semibold text-gray-800" style={{ color: style.textColor }}>{String(content.text ?? 'Subsection')}</h3>
    case 'rich_text':
      return <div className="prose-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: String(content.html ?? '') }} />
    case 'instruction':
      return (
        <div className="flex gap-2">
          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 shrink-0">i</div>
          <p className="text-sm text-gray-700">{String(content.text ?? 'Instruction text...')}</p>
        </div>
      )
    case 'warning': {
      const variant = String(content.variant ?? 'warning')
      const colors = {
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        danger: 'border-red-200 bg-red-50 text-red-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
        success: 'border-green-200 bg-green-50 text-green-900',
      }
      const iconColors = {
        warning: 'text-amber-500',
        danger: 'text-red-500',
        info: 'text-blue-500',
        success: 'text-green-500',
      }
      return (
        <div className={cn('rounded-lg border p-3', colors[variant as keyof typeof colors] ?? colors.warning)}>
          <div className="flex gap-2">
            <AlertTriangle className={cn('h-4 w-4 shrink-0 mt-0.5', iconColors[variant as keyof typeof iconColors] ?? iconColors.warning)} />
            <div>
              {content.title && <p className="text-sm font-semibold mb-0.5">{String(content.title)}</p>}
              <p className="text-xs">{String(content.message ?? '')}</p>
            </div>
          </div>
        </div>
      )
    }
    case 'divider':
      return <Minus className="h-px w-full text-gray-200 my-1" style={{ borderTop: '1px solid currentColor' }} />
    case 'quote':
      return (
        <blockquote className="border-l-4 border-blue-300 pl-3 py-1">
          <p className="text-sm italic text-gray-600">{String(content.text ?? 'Policy or quote text...')}</p>
          {content.source && <p className="text-xs text-gray-400 mt-1">— {String(content.source)}</p>}
        </blockquote>
      )
    case 'link':
      return (
        <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
          <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-600">{String(content.label ?? 'Resource Link')}</p>
            {content.description && <p className="text-xs text-gray-500">{String(content.description)}</p>}
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center h-24">
          {content.url ? (
            <img src={String(content.url)} alt={String(content.alt ?? '')} className="max-h-full object-contain rounded" />
          ) : (
            <p className="text-xs text-gray-400">Image placeholder</p>
          )}
        </div>
      )
    case 'table': {
      const headers = (content.headers as string[]) ?? ['Col 1', 'Col 2']
      const rows = (content.rows as string[][]) ?? [['', '']]
      return (
        <div className="overflow-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50">{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200">{h}</th>)}</tr></thead>
            <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="px-3 py-2 border-b border-gray-100 text-gray-700">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    }
    case 'checklist_item':
      return (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 h-4 w-4 rounded border-2 border-gray-300 shrink-0" />
          <div>
            <p className="text-sm text-gray-800">{String(content.label ?? 'Checklist item')}</p>
            {content.description && <p className="text-xs text-gray-500 mt-0.5">{String(content.description)}</p>}
          </div>
        </div>
      )
    case 'checklist_group': {
      const items = (content.items as string[]) ?? []
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">{String(content.label ?? 'Task Group')}</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded border border-gray-300 shrink-0" />
              <span className="text-xs text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'text_field':
      return (
        <FieldWrapper label={String(content.label ?? 'Text Field')} desc={content.description as string}>
          <div className="h-8 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center px-3">
            <span className="text-xs text-gray-400">{String(content.placeholder ?? 'Text input...')}</span>
          </div>
        </FieldWrapper>
      )
    case 'long_text':
      return (
        <FieldWrapper label={String(content.label ?? 'Long Text')} desc={content.description as string}>
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-2" style={{ minHeight: `${(Number(content.rows) || 3) * 1.6}rem` }}>
            <span className="text-xs text-gray-400">{String(content.placeholder ?? 'Long text...')}</span>
          </div>
        </FieldWrapper>
      )
    case 'number_field':
      return (
        <FieldWrapper label={String(content.label ?? 'Number')} desc={undefined}>
          <div className="flex gap-2 items-center">
            <div className="h-8 w-32 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center px-3">
              <span className="text-xs text-gray-400">{String(content.placeholder ?? '0')}</span>
            </div>
            {content.unit && <span className="text-xs text-gray-500">{String(content.unit)}</span>}
          </div>
        </FieldWrapper>
      )
    case 'date_field':
    case 'datetime_field':
      return (
        <FieldWrapper label={String(content.label ?? 'Date')} desc={content.description as string}>
          <div className="h-8 w-44 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center gap-2 px-3">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">{type === 'datetime_field' ? 'Date & Time' : 'Date'}</span>
          </div>
        </FieldWrapper>
      )
    case 'dropdown': {
      const opts = (content.options as string[]) ?? []
      return (
        <FieldWrapper label={String(content.label ?? 'Dropdown')} desc={undefined}>
          <div className="h-8 w-full rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-between px-3">
            <span className="text-xs text-gray-400">{String(content.placeholder ?? 'Select option...')}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </div>
        </FieldWrapper>
      )
    }
    case 'multi_select': {
      const opts = (content.options as string[]) ?? []
      return (
        <FieldWrapper label={String(content.label ?? 'Multi-Select')} desc={undefined}>
          <div className="flex flex-wrap gap-1">
            {opts.slice(0, 3).map((o, i) => (
              <span key={i} className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-500">{o}</span>
            ))}
          </div>
        </FieldWrapper>
      )
    }
    case 'yes_no':
      return (
        <FieldWrapper label={String(content.label ?? 'Yes / No')} desc={content.description as string}>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500"><span>Yes</span></div>
            <div className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500"><span>No</span></div>
          </div>
        </FieldWrapper>
      )
    case 'signature':
      return (
        <div className="rounded-lg border-2 border-dashed border-blue-200 p-4 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <PenLine className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-medium text-blue-800">{String(content.label ?? 'Signature / Attestation')}</p>
          </div>
          <p className="text-xs text-blue-600">{String(content.description ?? 'Signature required')}</p>
          <div className="mt-2 h-12 rounded border border-blue-200 bg-white" />
        </div>
      )
    case 'file_upload':
    case 'evidence_upload':
      return (
        <FieldWrapper label={String(content.label ?? (type === 'evidence_upload' ? 'Upload Evidence' : 'Upload File'))} desc={content.description as string}>
          <div className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-400">
            {type === 'evidence_upload' ? <UploadCloud className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            Click to upload or drag and drop
          </div>
        </FieldWrapper>
      )
    case 'url_input':
      return (
        <FieldWrapper label={String(content.label ?? 'URL')} desc={content.description as string}>
          <div className="flex items-center gap-2 h-8 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3">
            <Globe className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">{String(content.placeholder ?? 'https://')}</span>
          </div>
        </FieldWrapper>
      )
    case 'email_input':
      return (
        <FieldWrapper label={String(content.label ?? 'Email')} desc={content.description as string}>
          <div className="flex items-center gap-2 h-8 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">{String(content.placeholder ?? 'email@example.com')}</span>
          </div>
        </FieldWrapper>
      )
    case 'approval':
      return (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-semibold text-purple-800">{String(content.label ?? 'Approval Required')}</p>
          </div>
          <p className="text-xs text-purple-600 mt-1">{String(content.description ?? 'This step requires approval.')}</p>
        </div>
      )
    case 'stop_hold':
      return (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-500" />
            <p className="text-sm font-bold text-red-800 uppercase tracking-wide">{String(content.title ?? 'STOP')}</p>
          </div>
          <p className="text-xs text-red-700 mt-1">{String(content.message ?? 'Do not proceed.')}</p>
        </div>
      )
    case 'decision':
      return (
        <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Split className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">{String(content.question ?? 'Decision required')}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-md border border-green-200 bg-green-50 px-2 py-1.5 text-xs text-green-700 text-center">{String(content.yesLabel ?? 'Yes')}</div>
            <div className="flex-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700 text-center">{String(content.noLabel ?? 'No')}</div>
          </div>
        </div>
      )
    case 'timer':
    case 'stopwatch':
    case 'countdown':
      return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {type === 'timer' && <Timer className="h-5 w-5 text-blue-500" />}
          {type === 'stopwatch' && <Gauge className="h-5 w-5 text-green-500" />}
          {type === 'countdown' && <TimerOff className="h-5 w-5 text-orange-500" />}
          <div>
            <p className="text-sm font-medium text-gray-700">{String(content.label ?? (type === 'countdown' ? 'Countdown Timer' : type === 'stopwatch' ? 'Stopwatch' : 'Timer'))}</p>
            {content.description && <p className="text-xs text-gray-500">{String(content.description)}</p>}
            {type === 'countdown' && content.duration && <p className="text-xs text-orange-600 mt-0.5">Duration: {Math.floor(Number(content.duration) / 60)}:{String(Number(content.duration) % 60).padStart(2, '0')}</p>}
          </div>
          <div className="ml-auto font-mono text-sm text-gray-400">0:00</div>
        </div>
      )
    case 'progress_marker':
      return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 bg-gray-50">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-700">{String(content.label ?? 'Progress Checkpoint')}</p>
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${Number(content.percentage) || 0}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-500">{Number(content.percentage) || 0}%</span>
        </div>
      )
    case 'completion_checkpoint':
      return (
        <div className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-3">
          <Flag className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-semibold text-green-800">{String(content.label ?? 'Completion Checkpoint')}</p>
            <p className="text-xs text-green-600">{String(content.message ?? 'All tasks complete.')}</p>
          </div>
        </div>
      )
    case 'review':
      return (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Eye className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">{String(content.label ?? 'Review Required')}</p>
            <p className="text-xs text-amber-600">{String(content.description ?? '')}</p>
          </div>
        </div>
      )
    case 'assigned_owner':
      return (
        <FieldWrapper label={String(content.label ?? 'Assigned To')} desc={content.description as string}>
          <div className="flex items-center gap-2 h-8 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3">
            <User2 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Select assignee...</span>
          </div>
        </FieldWrapper>
      )
    case 'due_date':
      return (
        <FieldWrapper label={String(content.label ?? 'Due Date')} desc={undefined}>
          <div className="flex items-center gap-2 h-8 w-44 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3">
            <CalendarCheck className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Set due date</span>
          </div>
        </FieldWrapper>
      )
    case 'manual_duration':
      return (
        <FieldWrapper label={String(content.label ?? 'Time Spent')} desc={undefined}>
          <div className="flex items-center gap-2 h-8 w-40 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3">
            <Clock4 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">0h 0m</span>
          </div>
        </FieldWrapper>
      )
    default: {
      const def = getBlockDef(type)
      return (
        <div className="flex items-center gap-2 py-1">
          <div className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center shrink-0">
            {def?.icon && <def.icon className="h-3 w-3 text-gray-400" />}
          </div>
          <span className="text-xs text-gray-500">{getBlockLabel(type)}</span>
        </div>
      )
    }
  }
}

function FieldWrapper({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      {children}
      {desc && <p className="text-[10px] text-gray-400">{desc}</p>}
    </div>
  )
}
