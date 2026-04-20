import { BlockType, BLOCK_CATEGORIES } from '@/types'
import {
  Type, AlignLeft, FileText, AlertTriangle, Minus, Quote, Link, Image, Square,
  Paperclip, Table2, CheckSquare, CheckCircle, TextCursor, AlignJustify,
  Hash, Calendar, Clock4, ChevronDown, ListFilter, ToggleLeft, PenLine,
  Upload, UploadCloud, Globe, Mail, GitBranch, Network, ThumbsUp, Lock,
  Eye, AlertOctagon, Split, Timer, Watch, TimerOff, Gauge, User2,
  CalendarCheck, TrendingUp, Flag
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface BlockDef {
  type: BlockType
  label: string
  description: string
  icon: LucideIcon
  category: string
  defaultContent: Record<string, unknown>
  defaultStyle: Record<string, unknown>
  defaultValidation: Record<string, unknown>
}

export const BLOCK_REGISTRY: BlockDef[] = [
  // Content & Structure
  { type: 'section_header', label: 'Section Header', description: 'Large heading to separate major sections', icon: Type, category: 'Content & Structure', defaultContent: { text: 'Section Title', level: 1 }, defaultStyle: {}, defaultValidation: {} },
  { type: 'subsection', label: 'Subsection', description: 'Smaller sub-heading', icon: AlignLeft, category: 'Content & Structure', defaultContent: { text: 'Subsection Title', level: 2 }, defaultStyle: {}, defaultValidation: {} },
  { type: 'rich_text', label: 'Rich Text', description: 'Formatted text content', icon: FileText, category: 'Content & Structure', defaultContent: { html: '<p>Enter your text here...</p>' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'instruction', label: 'Instruction', description: 'Guidance or step instruction', icon: AlignJustify, category: 'Content & Structure', defaultContent: { text: 'Enter instruction text here.' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'warning', label: 'Warning / Callout', description: 'Alert, warning, or important notice', icon: AlertTriangle, category: 'Content & Structure', defaultContent: { title: 'Important', message: 'Enter warning message here.', variant: 'warning' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'divider', label: 'Divider', description: 'Horizontal rule separator', icon: Minus, category: 'Content & Structure', defaultContent: { style: 'solid' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'quote', label: 'Quote / Policy Note', description: 'Quoted text or policy reference', icon: Quote, category: 'Content & Structure', defaultContent: { text: 'Enter policy or reference text here.', source: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'link', label: 'Link / Resource', description: 'URL or document link', icon: Link, category: 'Content & Structure', defaultContent: { label: 'Resource Link', url: '', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'image', label: 'Image', description: 'Embedded image block', icon: Image, category: 'Content & Structure', defaultContent: { url: '', alt: '', caption: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'logo', label: 'Logo', description: 'Company or team logo display', icon: Square, category: 'Content & Structure', defaultContent: { src: '', width: 120, align: 'left' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'file_reference', label: 'File Reference', description: 'Reference to a document or file', icon: Paperclip, category: 'Content & Structure', defaultContent: { filename: '', description: '', url: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'table', label: 'Table', description: 'Data table block', icon: Table2, category: 'Content & Structure', defaultContent: { headers: ['Column 1', 'Column 2'], rows: [['', '']] }, defaultStyle: {}, defaultValidation: {} },
  // Input & Execution
  { type: 'checklist_item', label: 'Checklist Item', description: 'Single checkbox task', icon: CheckSquare, category: 'Input & Execution', defaultContent: { label: 'Task description', description: '' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'checklist_group', label: 'Checklist Group', description: 'Group of checklist items', icon: CheckCircle, category: 'Input & Execution', defaultContent: { label: 'Task Group', items: ['Task 1', 'Task 2'] }, defaultStyle: {}, defaultValidation: {} },
  { type: 'text_field', label: 'Text Field', description: 'Short text input', icon: TextCursor, category: 'Input & Execution', defaultContent: { label: 'Field Label', placeholder: 'Enter value...', description: '' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'long_text', label: 'Long Text', description: 'Multi-line text input', icon: AlignJustify, category: 'Input & Execution', defaultContent: { label: 'Field Label', placeholder: 'Enter text...', rows: 4, description: '' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'number_field', label: 'Number Field', description: 'Numeric input', icon: Hash, category: 'Input & Execution', defaultContent: { label: 'Field Label', placeholder: '0', unit: '' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'date_field', label: 'Date', description: 'Date picker input', icon: Calendar, category: 'Input & Execution', defaultContent: { label: 'Date', description: '' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'datetime_field', label: 'Date & Time', description: 'Date and time picker', icon: Clock4, category: 'Input & Execution', defaultContent: { label: 'Date & Time', description: '' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'dropdown', label: 'Dropdown', description: 'Single-select dropdown', icon: ChevronDown, category: 'Input & Execution', defaultContent: { label: 'Select Option', options: ['Option 1', 'Option 2', 'Option 3'], placeholder: 'Select...' }, defaultStyle: {}, defaultValidation: { required: false } },
  { type: 'multi_select', label: 'Multi-Select', description: 'Multiple choice selection', icon: ListFilter, category: 'Input & Execution', defaultContent: { label: 'Select Options', options: ['Option 1', 'Option 2', 'Option 3'] }, defaultStyle: {}, defaultValidation: {} },
  { type: 'yes_no', label: 'Yes / No Toggle', description: 'Boolean yes/no input', icon: ToggleLeft, category: 'Input & Execution', defaultContent: { label: 'Yes or No?', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'signature', label: 'Signature / Attestation', description: 'Signature or confirmation field', icon: PenLine, category: 'Input & Execution', defaultContent: { label: 'Signature', description: 'I confirm the above is accurate.', requireName: true }, defaultStyle: {}, defaultValidation: { required: true } },
  { type: 'file_upload', label: 'File Upload', description: 'File attachment input', icon: Upload, category: 'Input & Execution', defaultContent: { label: 'Upload File', accept: '*', maxSize: 10, description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'evidence_upload', label: 'Evidence Upload', description: 'Evidence photo/document upload', icon: UploadCloud, category: 'Input & Execution', defaultContent: { label: 'Upload Evidence', description: '', accept: 'image/*,application/pdf' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'url_input', label: 'URL Input', description: 'Web address input field', icon: Globe, category: 'Input & Execution', defaultContent: { label: 'URL', placeholder: 'https://', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'email_input', label: 'Email Input', description: 'Email address input field', icon: Mail, category: 'Input & Execution', defaultContent: { label: 'Email Address', placeholder: 'name@example.com', description: '' }, defaultStyle: {}, defaultValidation: {} },
  // Workflow & Logic
  { type: 'condition', label: 'Condition Block', description: 'Show/hide content based on condition', icon: GitBranch, category: 'Workflow & Logic', defaultContent: { label: 'Condition', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'branching', label: 'Branching Block', description: 'Multiple path decision point', icon: Network, category: 'Workflow & Logic', defaultContent: { question: 'Which path applies?', branches: ['Path A', 'Path B'] }, defaultStyle: {}, defaultValidation: {} },
  { type: 'approval', label: 'Approval Block', description: 'Requires approver sign-off', icon: ThumbsUp, category: 'Workflow & Logic', defaultContent: { label: 'Approval Required', description: 'This step requires manager approval before proceeding.' }, defaultStyle: {}, defaultValidation: { required: true } },
  { type: 'dependency', label: 'Dependency Block', description: 'Block depends on another step', icon: Lock, category: 'Workflow & Logic', defaultContent: { label: 'Dependency', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'review', label: 'Review Block', description: 'Review and confirm section', icon: Eye, category: 'Workflow & Logic', defaultContent: { label: 'Review Required', description: 'Please review the information above before continuing.' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'stop_hold', label: 'Stop / Hold', description: 'Hard stop that requires resolution', icon: AlertOctagon, category: 'Workflow & Logic', defaultContent: { title: 'STOP', message: 'Do not proceed until this condition is resolved.', severity: 'stop' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'decision', label: 'Decision Block', description: 'Binary decision point', icon: Split, category: 'Workflow & Logic', defaultContent: { question: 'Decision required', yesLabel: 'Yes — Continue', noLabel: 'No — Stop' }, defaultStyle: {}, defaultValidation: {} },
  // Utility & Run Sheet
  { type: 'timer', label: 'Timer', description: 'Elapsed time tracker', icon: Timer, category: 'Utility & Run Sheet', defaultContent: { label: 'Timer', description: '', autoStart: false }, defaultStyle: {}, defaultValidation: {} },
  { type: 'stopwatch', label: 'Watch', description: 'Watch for tracking duration', icon: Gauge, category: 'Utility & Run Sheet', defaultContent: { label: 'Watch', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'countdown', label: 'Countdown Timer', description: 'Count down from a set time', icon: TimerOff, category: 'Utility & Run Sheet', defaultContent: { label: 'Countdown', duration: 300, description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'manual_duration', label: 'Manual Duration', description: 'Record time spent manually', icon: Clock4, category: 'Utility & Run Sheet', defaultContent: { label: 'Time Spent', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'assigned_owner', label: 'Assigned Owner', description: 'Assign a person to a task', icon: User2, category: 'Utility & Run Sheet', defaultContent: { label: 'Assigned To', description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'due_date', label: 'Due Date', description: 'Task deadline', icon: CalendarCheck, category: 'Utility & Run Sheet', defaultContent: { label: 'Due Date', offsetDays: 0 }, defaultStyle: {}, defaultValidation: {} },
  { type: 'progress_marker', label: 'Progress Marker', description: 'Mark a progress milestone', icon: TrendingUp, category: 'Utility & Run Sheet', defaultContent: { label: 'Progress Checkpoint', percentage: 50, description: '' }, defaultStyle: {}, defaultValidation: {} },
  { type: 'completion_checkpoint', label: 'Completion Checkpoint', description: 'Final sign-off checkpoint', icon: Flag, category: 'Utility & Run Sheet', defaultContent: { label: 'Procedure Complete', message: 'All tasks have been completed.' }, defaultStyle: {}, defaultValidation: {} },
]

export const BLOCK_MAP = new Map<BlockType, BlockDef>(
  BLOCK_REGISTRY.map(def => [def.type, def])
)

export function getBlockDef(type: BlockType): BlockDef | undefined {
  return BLOCK_MAP.get(type)
}

export function getBlocksByCategory(): Record<string, BlockDef[]> {
  const result: Record<string, BlockDef[]> = {}
  for (const cat of Object.keys(BLOCK_CATEGORIES)) {
    result[cat] = BLOCK_CATEGORIES[cat as keyof typeof BLOCK_CATEGORIES]
      .map(t => BLOCK_MAP.get(t)!)
      .filter(Boolean)
  }
  return result
}
