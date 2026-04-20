export type ProcedureType = 'procedure' | 'policy' | 'runsheet' | 'sop'
export type ProcedureStatus = 'draft' | 'published' | 'archived'
export type VersionStatus = 'draft' | 'published'
export type RunStatus = 'in_progress' | 'completed' | 'cancelled'
export type RunMode = 'step' | 'checklist'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'admin' | 'member' | 'viewer'

export type BlockType =
  // Content / structure
  | 'section_header'
  | 'subsection'
  | 'rich_text'
  | 'instruction'
  | 'warning'
  | 'divider'
  | 'quote'
  | 'link'
  | 'image'
  | 'logo'
  | 'file_reference'
  | 'table'
  // Input / execution
  | 'checklist_item'
  | 'checklist_group'
  | 'text_field'
  | 'long_text'
  | 'number_field'
  | 'date_field'
  | 'datetime_field'
  | 'dropdown'
  | 'multi_select'
  | 'yes_no'
  | 'signature'
  | 'file_upload'
  | 'evidence_upload'
  | 'url_input'
  | 'email_input'
  // Workflow / logic
  | 'condition'
  | 'branching'
  | 'approval'
  | 'dependency'
  | 'review'
  | 'stop_hold'
  | 'decision'
  // Utility / run sheet
  | 'timer'
  | 'stopwatch'
  | 'countdown'
  | 'manual_duration'
  | 'assigned_owner'
  | 'due_date'
  | 'progress_marker'
  | 'completion_checkpoint'

export const BLOCK_CATEGORIES = {
  'Content & Structure': [
    'section_header',
    'subsection',
    'rich_text',
    'instruction',
    'warning',
    'divider',
    'quote',
    'link',
    'image',
    'logo',
    'file_reference',
    'table',
  ] as BlockType[],
  'Input & Execution': [
    'checklist_item',
    'checklist_group',
    'text_field',
    'long_text',
    'number_field',
    'date_field',
    'datetime_field',
    'dropdown',
    'multi_select',
    'yes_no',
    'signature',
    'file_upload',
    'evidence_upload',
    'url_input',
    'email_input',
  ] as BlockType[],
  'Workflow & Logic': [
    'condition',
    'branching',
    'approval',
    'dependency',
    'review',
    'stop_hold',
    'decision',
  ] as BlockType[],
  'Utility & Run Sheet': [
    'timer',
    'stopwatch',
    'countdown',
    'manual_duration',
    'assigned_owner',
    'due_date',
    'progress_marker',
    'completion_checkpoint',
  ] as BlockType[],
}

export interface BlockContent {
  // Generic — each block type uses specific keys
  [key: string]: unknown
}

export interface BlockStyle {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: string
  padding?: string
  fontSize?: string
  fontWeight?: string
  align?: 'left' | 'center' | 'right'
}

export interface BlockValidation {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  message?: string
}

export interface BlockLogic {
  conditions?: Condition[]
  dependsOn?: string[]
  showIf?: string
  hideIf?: string
}

export interface Condition {
  blockId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: UserRole
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  theme?: WorkspaceTheme | null
  createdAt: string
  updatedAt: string
}

export interface WorkspaceTheme {
  id: string
  workspaceId: string
  primaryColor: string
  accentColor: string
  backgroundColor: string
  canvasColor: string
  cardColor: string
  textColor: string
  buttonStyle: string
  sectionColor: string
  warningColor: string
  dangerColor: string
  logoUrl?: string | null
  exportLogoUrl?: string | null
  companyName?: string | null
  headerText?: string | null
  footerText?: string | null
  watermark?: string | null
  fontFamily: string
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
  workspaceId: string
}

export interface Procedure {
  id: string
  workspaceId: string
  ownerId: string
  owner?: User
  title: string
  description?: string | null
  type: ProcedureType
  category?: string | null
  department?: string | null
  status: ProcedureStatus
  currentVersionId?: string | null
  tags?: Tag[]
  isFavorite?: boolean
  _count?: { runs: number }
  createdAt: string
  updatedAt: string
}

export interface ProcedureVersion {
  id: string
  procedureId: string
  version: number
  status: VersionStatus
  notes?: string | null
  publishedAt?: string | null
  sections?: ProcedureSection[]
  createdAt: string
  updatedAt: string
}

export interface ProcedureSection {
  id: string
  versionId: string
  title: string
  description?: string | null
  order: number
  style: BlockStyle
  blocks: ProcedureBlock[]
  createdAt: string
  updatedAt: string
}

export interface ProcedureBlock {
  id: string
  sectionId: string
  type: BlockType
  order: number
  content: BlockContent
  style: BlockStyle
  validation: BlockValidation
  logic: BlockLogic
  createdAt: string
  updatedAt: string
}

export interface ProcedureRun {
  id: string
  procedureId: string
  procedure?: Procedure
  versionId: string
  version?: ProcedureVersion
  runnerId: string
  runner?: User
  status: RunStatus
  mode: RunMode
  progress: number
  currentBlockId?: string | null
  startedAt: string
  completedAt?: string | null
  blockValues?: RunBlockValue[]
  comments?: Comment[]
  approvals?: Approval[]
  createdAt: string
  updatedAt: string
}

export interface RunBlockValue {
  id: string
  runId: string
  blockId: string
  value?: string | null
  completed: boolean
  completedAt?: string | null
  timerElapsed?: number | null
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  runId: string
  authorId: string
  author?: User
  content: string
  blockId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Approval {
  id: string
  runId: string
  approverId: string
  approver?: User
  status: ApprovalStatus
  notes?: string | null
  decidedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProcedureFilters {
  search?: string
  type?: ProcedureType | 'all'
  status?: ProcedureStatus | 'all'
  category?: string
  department?: string
  tags?: string[]
  ownerId?: string
  isFavorite?: boolean
  sortBy?: 'title' | 'updatedAt' | 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
