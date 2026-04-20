'use client'

import { useState, useEffect, useRef } from 'react'
import type { ProcedureBlock } from '@/types'
import { cn, formatDuration } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AlertTriangle, AlertOctagon, ExternalLink, Check, Timer, Gauge,
  TimerOff, Play, Pause, RotateCcw, ThumbsUp, Eye, PenLine, Upload,
  Globe, Mail, Flag, TrendingUp, User2, CalendarCheck, Split
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Props {
  block: ProcedureBlock
  value?: string
  completed: boolean
  timerElapsed?: number
  onChange: (value?: string, completed?: boolean, timerElapsed?: number) => void
  isReadOnly: boolean
}

export function RunnerBlock({ block, value, completed, timerElapsed, onChange, isReadOnly }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any
  const validation = block.validation as Record<string, unknown>
  const isRequired = Boolean(validation.required)

  return (
    <div className={cn(
      'rounded-lg transition-all',
      completed && 'opacity-75',
      isRequired && !completed && 'ring-1 ring-amber-200'
    )}>
      {isRequired && !completed && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600 mb-1">
          <span>Required</span>
        </div>
      )}
      <BlockInput block={block} value={value} completed={completed} timerElapsed={timerElapsed} onChange={onChange} isReadOnly={isReadOnly} />
      {completed && (
        <div className="flex items-center gap-1 text-[10px] text-green-600 mt-1">
          <Check className="h-3 w-3" /><span>Completed</span>
        </div>
      )}
    </div>
  )
}

function BlockInput({ block, value, completed, timerElapsed, onChange, isReadOnly }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any

  switch (block.type) {
    case 'section_header':
      return <h2 className="text-xl font-bold text-gray-900">{String(content.text ?? '')}</h2>
    case 'subsection':
      return <h3 className="text-base font-semibold text-gray-800">{String(content.text ?? '')}</h3>
    case 'rich_text':
      return <div className="prose-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: String(content.html ?? '') }} />
    case 'instruction':
      return (
        <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-700 shrink-0">i</div>
          <p className="text-sm text-blue-900">{String(content.text ?? '')}</p>
        </div>
      )
    case 'warning': {
      const variant = String(content.variant ?? 'warning')
      const colorMap = { warning: 'border-amber-200 bg-amber-50 text-amber-900', danger: 'border-red-200 bg-red-50 text-red-900', info: 'border-blue-200 bg-blue-50 text-blue-900', success: 'border-green-200 bg-green-50 text-green-900' }
      return (
        <div className={cn('rounded-lg border p-3', colorMap[variant as keyof typeof colorMap] ?? colorMap.warning)}>
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              {content.title && <p className="text-sm font-semibold">{String(content.title)}</p>}
              <p className="text-sm">{String(content.message ?? '')}</p>
            </div>
          </div>
        </div>
      )
    }
    case 'divider':
      return <hr className="border-gray-200" />
    case 'quote':
      return (
        <blockquote className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50/50 rounded-r">
          <p className="text-sm italic text-gray-700">{String(content.text ?? '')}</p>
          {content.source && <p className="text-xs text-gray-500 mt-1">— {String(content.source)}</p>}
        </blockquote>
      )
    case 'link':
      return (
        <a href={String(content.url ?? '#')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100 transition-colors">
          <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700">{String(content.label ?? 'Link')}</p>
            {content.description && <p className="text-xs text-blue-500">{String(content.description)}</p>}
          </div>
        </a>
      )
    case 'stop_hold':
      return (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="h-6 w-6 text-red-600" />
            <p className="text-lg font-black text-red-800 uppercase tracking-wide">{String(content.title ?? 'STOP')}</p>
          </div>
          <p className="text-sm text-red-700">{String(content.message ?? '')}</p>
        </div>
      )
    case 'checklist_item':
      return (
        <div className={cn('flex items-start gap-3 rounded-lg p-3 transition-colors', completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100')}>
          <Checkbox
            checked={completed}
            disabled={isReadOnly}
            onCheckedChange={checked => onChange(undefined, Boolean(checked))}
            className="mt-0.5"
          />
          <div className="flex-1">
            <p className={cn('text-sm', completed && 'line-through text-gray-400')}>{String(content.label ?? '')}</p>
            {content.description && <p className="text-xs text-gray-500 mt-0.5">{String(content.description)}</p>}
          </div>
        </div>
      )
    case 'checklist_group': {
      const items = (content.items as string[]) ?? []
      const currentValues = JSON.parse(value ?? '{}') as Record<number, boolean>
      const allChecked = items.length > 0 && items.every((_, i) => currentValues[i])
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">{String(content.label ?? '')}</p>
          {items.map((item, i) => (
            <div key={i} className={cn('flex items-center gap-2 rounded p-2', currentValues[i] ? 'bg-green-50' : 'bg-gray-50')}>
              <Checkbox
                checked={Boolean(currentValues[i])}
                disabled={isReadOnly}
                onCheckedChange={checked => {
                  const newValues = { ...currentValues, [i]: Boolean(checked) }
                  const allDone = items.every((_, idx) => newValues[idx])
                  onChange(JSON.stringify(newValues), allDone)
                }}
              />
              <span className={cn('text-sm', currentValues[i] && 'line-through text-gray-400')}>{item}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{Object.values(currentValues).filter(Boolean).length}/{items.length} complete</span>
          </div>
        </div>
      )
    }
    case 'text_field':
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={content.description as string} required={Boolean((block.validation as Record<string, unknown>).required)}>
          <Input
            disabled={isReadOnly}
            value={value ?? ''}
            placeholder={String(content.placeholder ?? '')}
            onChange={e => onChange(e.target.value, Boolean(e.target.value))}
          />
        </FieldWrapper>
      )
    case 'long_text':
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={content.description as string} required={Boolean((block.validation as Record<string, unknown>).required)}>
          <Textarea
            disabled={isReadOnly}
            value={value ?? ''}
            placeholder={String(content.placeholder ?? '')}
            rows={Number(content.rows) || 4}
            onChange={e => onChange(e.target.value, Boolean(e.target.value))}
          />
        </FieldWrapper>
      )
    case 'number_field':
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={undefined} required={Boolean((block.validation as Record<string, unknown>).required)}>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              disabled={isReadOnly}
              value={value ?? ''}
              placeholder={String(content.placeholder ?? '0')}
              className="w-32"
              onChange={e => onChange(e.target.value, Boolean(e.target.value))}
            />
            {content.unit && <span className="text-sm text-gray-500">{String(content.unit)}</span>}
          </div>
        </FieldWrapper>
      )
    case 'date_field':
    case 'datetime_field':
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={content.description as string} required={Boolean((block.validation as Record<string, unknown>).required)}>
          <Input
            type={block.type === 'datetime_field' ? 'datetime-local' : 'date'}
            disabled={isReadOnly}
            value={value ?? ''}
            className="w-auto"
            onChange={e => onChange(e.target.value, Boolean(e.target.value))}
          />
        </FieldWrapper>
      )
    case 'dropdown': {
      const opts = (content.options as string[]) ?? []
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={undefined} required={Boolean((block.validation as Record<string, unknown>).required)}>
          <Select disabled={isReadOnly} value={value ?? ''} onValueChange={v => onChange(v, Boolean(v))}>
            <SelectTrigger className="w-full"><SelectValue placeholder={String(content.placeholder ?? 'Select...')} /></SelectTrigger>
            <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </FieldWrapper>
      )
    }
    case 'multi_select': {
      const opts = (content.options as string[]) ?? []
      const selected: string[] = JSON.parse(value ?? '[]')
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={undefined} required={false}>
          <div className="flex flex-wrap gap-2">
            {opts.map(o => {
              const isSelected = selected.includes(o)
              return (
                <button
                  key={o}
                  disabled={isReadOnly}
                  onClick={() => {
                    const newSelected = isSelected ? selected.filter(s => s !== o) : [...selected, o]
                    onChange(JSON.stringify(newSelected), newSelected.length > 0)
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    isSelected ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </FieldWrapper>
      )
    }
    case 'yes_no': {
      const boolValue = value === 'yes' ? true : value === 'no' ? false : null
      return (
        <FieldWrapper label={String(content.label ?? '')} desc={content.description as string} required={false}>
          <div className="flex gap-3">
            <button
              disabled={isReadOnly}
              onClick={() => onChange('yes', true)}
              className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors', value === 'yes' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300')}
            >Yes</button>
            <button
              disabled={isReadOnly}
              onClick={() => onChange('no', true)}
              className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors', value === 'no' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300')}
            >No</button>
          </div>
        </FieldWrapper>
      )
    }
    case 'signature':
      return (
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800 mb-2">{String(content.label ?? 'Signature')}</p>
          <p className="text-xs text-blue-600 mb-3">{String(content.description ?? '')}</p>
          {completed ? (
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Signed: {value}</span>
            </div>
          ) : !isReadOnly ? (
            <div className="space-y-2">
              <Input
                placeholder="Type your full name to sign"
                value={value ?? ''}
                onChange={e => onChange(e.target.value, false)}
              />
              <Button
                size="sm"
                disabled={!value}
                onClick={() => onChange(value, true)}
              >
                <PenLine className="mr-2 h-3.5 w-3.5" />
                Sign & Confirm
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Not signed</p>
          )}
        </div>
      )
    case 'url_input':
      return (
        <FieldWrapper label={String(content.label ?? 'URL')} desc={content.description as string} required={false}>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 shrink-0" />
            <Input type="url" disabled={isReadOnly} value={value ?? ''} placeholder={String(content.placeholder ?? 'https://')} onChange={e => onChange(e.target.value, Boolean(e.target.value))} />
          </div>
        </FieldWrapper>
      )
    case 'email_input':
      return (
        <FieldWrapper label={String(content.label ?? 'Email')} desc={content.description as string} required={false}>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <Input type="email" disabled={isReadOnly} value={value ?? ''} placeholder={String(content.placeholder ?? 'email@example.com')} onChange={e => onChange(e.target.value, Boolean(e.target.value))} />
          </div>
        </FieldWrapper>
      )
    case 'timer':
    case 'stopwatch':
      return <TimerBlock block={block} timerElapsed={timerElapsed} completed={completed} onChange={onChange} isReadOnly={isReadOnly} />
    case 'countdown':
      return <CountdownBlock block={block} timerElapsed={timerElapsed} completed={completed} onChange={onChange} isReadOnly={isReadOnly} />
    case 'approval':
      return (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-semibold text-purple-800">{String(content.label ?? 'Approval Required')}</p>
          </div>
          <p className="text-xs text-purple-600 mb-3">{String(content.description ?? '')}</p>
          {completed ? (
            <div className="flex items-center gap-2 text-green-700"><Check className="h-4 w-4" /><span className="text-sm">Approved</span></div>
          ) : !isReadOnly && (
            <Button size="sm" onClick={() => onChange('approved', true)}>
              <ThumbsUp className="mr-2 h-3.5 w-3.5" />Approve
            </Button>
          )}
        </div>
      )
    case 'decision':
      return (
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Split className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-800">{String(content.question ?? '')}</p>
          </div>
          <div className="flex gap-3">
            <button
              disabled={isReadOnly}
              onClick={() => onChange('yes', true)}
              className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium', value === 'yes' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200')}
            >
              {String(content.yesLabel ?? 'Yes')}
            </button>
            <button
              disabled={isReadOnly}
              onClick={() => onChange('no', true)}
              className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium', value === 'no' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-200')}
            >
              {String(content.noLabel ?? 'No')}
            </button>
          </div>
        </div>
      )
    case 'progress_marker':
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium text-gray-700">{String(content.label ?? 'Progress')}</p>
          </div>
          <Progress value={Number(content.percentage) || 0} className="h-2" />
          <p className="text-xs text-gray-400 mt-1">{Number(content.percentage) || 0}% of procedure complete at this point</p>
        </div>
      )
    case 'completion_checkpoint':
      return (
        <div className={cn('rounded-lg border-2 p-4 transition-colors', completed ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50')}>
          <div className="flex items-center gap-2 mb-2">
            <Flag className={cn('h-5 w-5', completed ? 'text-green-600' : 'text-gray-400')} />
            <p className="text-sm font-semibold text-gray-800">{String(content.label ?? 'Completion Checkpoint')}</p>
          </div>
          <p className="text-xs text-gray-600 mb-3">{String(content.message ?? '')}</p>
          {!isReadOnly && !completed && (
            <Button size="sm" onClick={() => onChange('completed', true)}>
              <Check className="mr-2 h-3.5 w-3.5" />Mark Complete
            </Button>
          )}
          {completed && <div className="flex items-center gap-1 text-green-700"><Check className="h-4 w-4" /><span className="text-sm font-medium">Complete!</span></div>}
        </div>
      )
    default:
      return <p className="text-xs text-gray-400 p-2">{block.type}</p>
  }
}

function TimerBlock({ block, timerElapsed, completed, onChange, isReadOnly }: Omit<Props, 'value'>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(timerElapsed ?? 0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const stop = () => {
    setIsRunning(false)
    onChange(String(elapsed), true, elapsed)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-700 mb-1">{String(content.label ?? 'Timer')}</p>
      {content.description && <p className="text-xs text-gray-500 mb-2">{String(content.description)}</p>}
      <div className="flex items-center gap-3">
        <span className="font-mono text-2xl font-bold text-gray-900">{formatDuration(elapsed)}</span>
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsRunning(r => !r)}>
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsRunning(false); setElapsed(0) }}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            {elapsed > 0 && <Button size="sm" onClick={stop}>Save Time</Button>}
          </div>
        )}
      </div>
    </div>
  )
}

function CountdownBlock({ block, timerElapsed, completed, onChange, isReadOnly }: Omit<Props, 'value'>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any
  const duration = Number(content.duration ?? 300)
  const [isRunning, setIsRunning] = useState(false)
  const [remaining, setRemaining] = useState(duration - (timerElapsed ?? 0))
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setIsRunning(false)
            onChange(String(duration), true, duration)
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, remaining])

  const pct = ((duration - remaining) / duration) * 100

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-700 mb-2">{String(content.label ?? 'Countdown')}</p>
      <div className="flex items-center gap-3 mb-2">
        <span className={cn('font-mono text-2xl font-bold', remaining === 0 ? 'text-red-600' : 'text-gray-900')}>{formatDuration(remaining)}</span>
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsRunning(r => !r)} disabled={remaining === 0}>
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsRunning(false); setRemaining(duration) }}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      <Progress value={pct} className="h-1.5" />
      {remaining === 0 && <p className="text-xs text-red-600 mt-1 font-medium">Time's up!</p>}
    </div>
  )
}

function FieldWrapper({ label, desc, required, children }: { label: string; desc?: string; required: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {desc && <p className="text-xs text-gray-400">{desc}</p>}
    </div>
  )
}
