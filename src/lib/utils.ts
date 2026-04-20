import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BlockType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800 border-green-200'
    case 'draft': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'procedure': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'policy': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'runsheet': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'sop': return 'bg-teal-50 text-teal-700 border-teal-200'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case 'procedure': return 'Procedure'
    case 'policy': return 'Policy'
    case 'runsheet': return 'Run Sheet'
    case 'sop': return 'SOP'
    default: return type
  }
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T }
  catch { return fallback }
}

export function getBlockLabel(type: BlockType): string {
  const labels: Record<BlockType, string> = {
    section_header: 'Section Header',
    subsection: 'Subsection',
    rich_text: 'Rich Text',
    instruction: 'Instruction',
    warning: 'Warning / Callout',
    divider: 'Divider',
    quote: 'Quote / Policy Note',
    link: 'Link / Resource',
    image: 'Image',
    logo: 'Logo',
    file_reference: 'File Reference',
    table: 'Table',
    checklist_item: 'Checklist Item',
    checklist_group: 'Checklist Group',
    text_field: 'Text Field',
    long_text: 'Long Text',
    number_field: 'Number Field',
    date_field: 'Date',
    datetime_field: 'Date & Time',
    dropdown: 'Dropdown',
    multi_select: 'Multi-Select',
    yes_no: 'Yes / No Toggle',
    signature: 'Signature / Attestation',
    file_upload: 'File Upload',
    evidence_upload: 'Evidence Upload',
    url_input: 'URL Input',
    email_input: 'Email Input',
    condition: 'Condition Block',
    branching: 'Branching Block',
    approval: 'Approval Block',
    dependency: 'Dependency Block',
    review: 'Review Block',
    stop_hold: 'Stop / Hold',
    decision: 'Decision Block',
    timer: 'Timer',
    stopwatch: 'Stopwatch',
    countdown: 'Countdown Timer',
    manual_duration: 'Manual Duration',
    assigned_owner: 'Assigned Owner',
    due_date: 'Due Date',
    progress_marker: 'Progress Marker',
    completion_checkpoint: 'Completion Checkpoint',
  }
  return labels[type] ?? type
}

export function isInputBlock(type: BlockType): boolean {
  const inputTypes: BlockType[] = [
    'checklist_item', 'checklist_group', 'text_field', 'long_text',
    'number_field', 'date_field', 'datetime_field', 'dropdown', 'multi_select',
    'yes_no', 'signature', 'file_upload', 'evidence_upload', 'url_input', 'email_input',
    'timer', 'stopwatch', 'countdown', 'approval',
  ]
  return inputTypes.includes(type)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
