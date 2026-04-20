'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate, getTypeLabel } from '@/lib/utils'
import type { WorkspaceTheme, ProcedureSection, ProcedureBlock } from '@/types'
import { Loader2, Download, ArrowLeft, Printer, CheckSquare, AlertTriangle, AlertOctagon, Timer, ThumbsUp } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

interface Props { procedureId: string }

export function ExportShell({ procedureId }: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['export', procedureId],
    queryFn: async () => {
      const res = await fetch(`/api/export/${procedureId}`)
      if (!res.ok) throw new Error('Failed to load export data')
      return res.json()
    },
  })

  const handlePrint = () => window.print()

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">Failed to load export data.</p>
          {data?.error && <p className="text-xs text-red-500 mt-1">{data.error}</p>}
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href={`/builder/${procedureId}`}><ArrowLeft className="mr-2 h-4 w-4" />Back to Builder</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { procedure, version, theme } = data.data
  const t: WorkspaceTheme | null = theme

  return (
    <div className="flex h-full flex-col">
      {/* Export controls — hidden in print */}
      <div className="no-print flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/builder/${procedureId}`}><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
          <h1 className="text-base font-semibold text-gray-900">Export Preview</h1>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />Print / Save as PDF
        </Button>
      </div>

      {/* Printable content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6 no-print-bg">
        <div
          ref={printRef}
          className="mx-auto max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ fontFamily: t?.fontFamily ?? 'Inter' }}
        >
          {/* Header */}
          <div
            className="px-10 py-8"
            style={{ backgroundColor: t?.primaryColor ?? '#3B82F6' }}
          >
            {t?.logoUrl && (
              <img src={t.logoUrl} alt="Logo" className="h-10 mb-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            )}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs uppercase tracking-widest font-medium mb-1">
                  {t?.companyName ?? ''} &nbsp;·&nbsp; {getTypeLabel(procedure.type)}
                </p>
                <h1 className="text-2xl font-bold text-white leading-tight">{procedure.title}</h1>
                {procedure.description && (
                  <p className="text-white/80 text-sm mt-2 max-w-lg">{procedure.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div>
                <p className="text-white/60 text-[10px] uppercase">Version</p>
                <p className="text-white text-sm font-semibold">v{version.version}</p>
              </div>
              {version.publishedAt && (
                <div>
                  <p className="text-white/60 text-[10px] uppercase">Effective Date</p>
                  <p className="text-white text-sm font-semibold">{formatDate(version.publishedAt)}</p>
                </div>
              )}
              {procedure.department && (
                <div>
                  <p className="text-white/60 text-[10px] uppercase">Department</p>
                  <p className="text-white text-sm font-semibold">{procedure.department}</p>
                </div>
              )}
              {procedure.owner && (
                <div>
                  <p className="text-white/60 text-[10px] uppercase">Owner</p>
                  <p className="text-white text-sm font-semibold">{procedure.owner.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Header band */}
          {t?.headerText && (
            <div className="px-10 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
              {t.headerText}
            </div>
          )}

          {/* Tags */}
          {procedure.tags && procedure.tags.length > 0 && (
            <div className="px-10 pt-6 flex flex-wrap gap-2">
              {procedure.tags.map((tag: { id: string; name: string; color: string }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Sections */}
          <div className="px-10 py-6 space-y-8">
            {version.sections.map((section: ProcedureSection, sIdx: number) => {
              const sStyle = section.style as Record<string, string>
              return (
                <div key={section.id}>
                  <div
                    className="rounded-lg px-4 py-3 mb-4"
                    style={{ backgroundColor: sStyle.backgroundColor ?? (t?.sectionColor ?? '#EFF6FF') }}
                  >
                    <h2 className="text-base font-bold" style={{ color: t?.textColor ?? '#111827' }}>
                      {sIdx + 1}. {section.title}
                    </h2>
                    {section.description && <p className="text-sm text-gray-600 mt-0.5">{section.description}</p>}
                  </div>
                  <div className="space-y-3 pl-2">
                    {section.blocks.map((block: ProcedureBlock) => (
                      <ExportBlock key={block.id} block={block} theme={t} />
                    ))}
                  </div>
                  {sIdx < version.sections.length - 1 && <Separator className="mt-8" />}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-10 py-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{t?.footerText ?? ''}</span>
              <span>v{version.version} &nbsp;·&nbsp; {formatDate(version.publishedAt ?? procedure.createdAt)}</span>
            </div>
          </div>

          {/* Watermark */}
          {t?.watermark && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5 rotate-[-30deg] text-7xl font-black text-gray-800 select-none">
              {t.watermark}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-bg { background: white !important; padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}

function ExportBlock({ block, theme }: { block: ProcedureBlock; theme: WorkspaceTheme | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = block.content as any
  const t = theme

  switch (block.type) {
    case 'section_header':
      return <h2 className="text-xl font-bold text-gray-900 mt-4">{String(content.text ?? '')}</h2>
    case 'subsection':
      return <h3 className="text-base font-semibold text-gray-800 mt-2">{String(content.text ?? '')}</h3>
    case 'instruction':
      return <p className="text-sm text-gray-700 pl-3 border-l-2 border-blue-200">{String(content.text ?? '')}</p>
    case 'rich_text':
      return <div className="prose-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: String(content.html ?? '') }} />
    case 'warning': {
      const variant = String(content.variant ?? 'warning')
      const colors = { warning: `border-amber-200 bg-amber-50`, danger: `border-red-200 bg-red-50`, info: `border-blue-200 bg-blue-50`, success: `border-green-200 bg-green-50` }
      return (
        <div className={cn('rounded-lg border p-3', colors[variant as keyof typeof colors] ?? colors.warning)}>
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
            <div>
              {content.title && <p className="text-sm font-semibold">{String(content.title)}</p>}
              <p className="text-xs">{String(content.message ?? '')}</p>
            </div>
          </div>
        </div>
      )
    }
    case 'stop_hold':
      return (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <p className="font-black text-red-800 uppercase tracking-widest text-sm">{String(content.title ?? 'STOP')}</p>
          </div>
          <p className="text-sm text-red-700 mt-1">{String(content.message ?? '')}</p>
        </div>
      )
    case 'divider':
      return <hr className="border-gray-200" />
    case 'quote':
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-1">
          <p className="text-sm italic text-gray-600">{String(content.text ?? '')}</p>
          {content.source && <p className="text-xs text-gray-400 mt-1">— {String(content.source)}</p>}
        </blockquote>
      )
    case 'link':
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-600">→</span>
          <span className="font-medium">{String(content.label ?? '')}</span>
          {content.url && <span className="text-xs text-gray-400">({String(content.url)})</span>}
        </div>
      )
    case 'checklist_item':
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-4 w-4 rounded border-2 border-gray-400 shrink-0" />
          <div>
            <p className="text-sm">{String(content.label ?? '')}</p>
            {content.description && <p className="text-xs text-gray-500">{String(content.description)}</p>}
          </div>
        </div>
      )
    case 'checklist_group': {
      const items = (content.items as string[]) ?? []
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium">{String(content.label ?? '')}</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 pl-3">
              <div className="h-3.5 w-3.5 rounded border border-gray-400 shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'text_field':
    case 'long_text':
    case 'number_field':
    case 'date_field':
    case 'datetime_field':
    case 'url_input':
    case 'email_input':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">{String(content.label ?? '')}</p>
          <div className="rounded border border-dashed border-gray-300 px-3 py-2 min-h-[32px] bg-gray-50">
            <span className="text-xs text-gray-400">{String(content.placeholder ?? '(Enter value)')}</span>
          </div>
        </div>
      )
    case 'dropdown':
    case 'multi_select': {
      const opts = (content.options as string[]) ?? []
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">{String(content.label ?? '')}</p>
          <div className="flex flex-wrap gap-1.5">
            {opts.map((o, i) => (
              <span key={i} className="rounded border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-500">□ {o}</span>
            ))}
          </div>
        </div>
      )
    }
    case 'yes_no':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">{String(content.label ?? '')}</p>
          <div className="flex gap-3">
            <span className="rounded border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-500">□ Yes</span>
            <span className="rounded border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-500">□ No</span>
          </div>
        </div>
      )
    case 'signature':
      return (
        <div className="rounded-lg border border-gray-300 p-3">
          <p className="text-xs font-medium text-gray-700 mb-1">{String(content.label ?? 'Signature')}</p>
          <p className="text-xs text-gray-500 mb-3">{String(content.description ?? '')}</p>
          <div className="h-12 rounded border border-dashed border-gray-300 bg-gray-50" />
          <div className="mt-2 flex gap-8">
            <div className="border-t border-gray-300 pt-1 text-[10px] text-gray-400">Signature</div>
            <div className="border-t border-gray-300 pt-1 text-[10px] text-gray-400">Date</div>
          </div>
        </div>
      )
    case 'approval':
      return (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-medium text-purple-800">{String(content.label ?? 'Approval Required')}</p>
          </div>
          <p className="text-xs text-purple-600 mt-1">{String(content.description ?? '')}</p>
          <div className="mt-2 h-8 rounded border border-dashed border-purple-300" />
        </div>
      )
    case 'timer':
    case 'stopwatch':
    case 'countdown':
      return (
        <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
          <Timer className="h-4 w-4 text-blue-500" />
          <p className="text-sm text-gray-700">{String(content.label ?? block.type)}</p>
          <div className="ml-auto font-mono text-sm text-gray-400">__ : __</div>
        </div>
      )
    case 'table': {
      const headers = (content.headers as string[]) ?? []
      const rows = (content.rows as string[][]) ?? []
      return (
        <div className="overflow-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-100">{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">{h}</th>)}</tr></thead>
            <tbody>{rows.map((row, ri) => <tr key={ri} className="border-b border-gray-100">{row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-600 min-h-[32px]">{cell || <span className="text-gray-300">—</span>}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    }
    default:
      return null
  }
}
