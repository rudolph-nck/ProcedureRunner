'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { WorkspaceTheme } from '@/types'
import { toast } from 'sonner'
import { Loader2, Palette, Building2, FileDown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Roboto', 'Open Sans']
const BUTTON_STYLES = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
]

export function SettingsShell() {
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-theme'],
    queryFn: async () => {
      const res = await fetch('/api/workspaces/current/theme')
      return res.json()
    },
  })

  const theme: WorkspaceTheme | undefined = data?.data

  const { register, handleSubmit, control, watch, reset, formState: { isDirty, isSubmitting } } = useForm<WorkspaceTheme>({
    defaultValues: {
      primaryColor: '#3B82F6',
      accentColor: '#8B5CF6',
      backgroundColor: '#F9FAFB',
      canvasColor: '#FFFFFF',
      cardColor: '#FFFFFF',
      textColor: '#111827',
      buttonStyle: 'rounded',
      sectionColor: '#EFF6FF',
      warningColor: '#FEF3C7',
      dangerColor: '#FEE2E2',
      fontFamily: 'Inter',
      companyName: '',
      headerText: '',
      footerText: '',
      watermark: '',
    },
  })

  useEffect(() => {
    if (theme) reset(theme)
  }, [theme, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<WorkspaceTheme>) => {
      const res = await fetch('/api/workspaces/current/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      toast.success('Theme saved!')
      queryClient.invalidateQueries({ queryKey: ['workspace-theme'] })
    },
    onError: () => toast.error('Failed to save theme'),
  })

  const values = watch()

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Settings & Branding</h2>
          <p className="text-sm text-gray-500 mt-1">Customize your workspace theme, branding, and export settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
            <Eye className="mr-1.5 h-4 w-4" />{preview ? 'Hide' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handleSubmit(d => saveMutation.mutate(d))} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className={cn('grid gap-6', preview ? 'grid-cols-2' : 'grid-cols-1 max-w-2xl')}>
        <div>
          <Tabs defaultValue="branding">
            <TabsList className="mb-4">
              <TabsTrigger value="branding"><Building2 className="mr-1.5 h-3.5 w-3.5" />Branding</TabsTrigger>
              <TabsTrigger value="colors"><Palette className="mr-1.5 h-3.5 w-3.5" />Colors</TabsTrigger>
              <TabsTrigger value="export"><FileDown className="mr-1.5 h-3.5 w-3.5" />Export</TabsTrigger>
            </TabsList>

            <TabsContent value="branding">
              <Card>
                <CardHeader><CardTitle className="text-base">Workspace Branding</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Company / Team Name</Label>
                    <Input {...register('companyName')} placeholder="Acme Corporation" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Logo URL</Label>
                    <Input {...register('logoUrl')} placeholder="https://example.com/logo.png" />
                    <p className="text-xs text-gray-400">Used in the sidebar and app header.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Font Family</Label>
                    <select {...register('fontFamily')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Button Style</Label>
                    <div className="flex gap-2">
                      {BUTTON_STYLES.map(s => (
                        <label key={s.value} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" {...register('buttonStyle')} value={s.value} className="accent-blue-500" />
                          <span className="text-sm">{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors">
              <Card>
                <CardHeader><CardTitle className="text-base">Color Palette</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { field: 'primaryColor', label: 'Primary Color', desc: 'Buttons, links, and highlights' },
                    { field: 'accentColor', label: 'Accent Color', desc: 'Secondary accents and badges' },
                    { field: 'backgroundColor', label: 'Background Color', desc: 'Page background' },
                    { field: 'canvasColor', label: 'Canvas Color', desc: 'Builder canvas area' },
                    { field: 'cardColor', label: 'Card Color', desc: 'Card and panel backgrounds' },
                    { field: 'textColor', label: 'Text Color', desc: 'Main body text' },
                    { field: 'sectionColor', label: 'Section Color', desc: 'Section background in builder' },
                    { field: 'warningColor', label: 'Warning Color', desc: 'Warning block background' },
                    { field: 'dangerColor', label: 'Danger Color', desc: 'Danger/error block background' },
                  ].map(({ field, label, desc }) => (
                    <div key={field} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="color"
                          {...register(field as keyof WorkspaceTheme)}
                          className="h-8 w-8 rounded cursor-pointer border border-gray-200"
                        />
                        <div>
                          <Label className="text-xs font-medium">{label}</Label>
                          <p className="text-[10px] text-gray-400">{desc}</p>
                        </div>
                      </div>
                      <Input
                        {...register(field as keyof WorkspaceTheme)}
                        className="w-28 h-7 text-xs font-mono"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export & PDF Settings</CardTitle>
                  <CardDescription>Configure how exported PDFs look.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Export Logo URL</Label>
                    <Input {...register('exportLogoUrl')} placeholder="https://example.com/logo-print.png" />
                    <p className="text-xs text-gray-400">Used in PDF exports. Use a high-res version.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>PDF Header Text</Label>
                    <Input {...register('headerText')} placeholder="Acme Corporation — Internal Procedures" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>PDF Footer Text</Label>
                    <Input {...register('footerText')} placeholder="Confidential — For Internal Use Only" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Watermark Text</Label>
                    <Input {...register('watermark')} placeholder="e.g. CONFIDENTIAL, DRAFT" />
                    <p className="text-xs text-gray-400">Displayed as a diagonal watermark on each page.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {preview && (
          <div>
            <Card className="sticky top-6">
              <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="rounded-lg p-4 space-y-3"
                  style={{
                    backgroundColor: values.canvasColor,
                    fontFamily: values.fontFamily,
                    color: values.textColor,
                  }}
                >
                  {values.companyName && (
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: values.primaryColor }}>
                      {values.companyName}
                    </p>
                  )}
                  <div className="rounded-lg p-3" style={{ backgroundColor: values.sectionColor }}>
                    <h3 className="text-sm font-semibold mb-2">Section Preview</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border-2" style={{ borderColor: values.primaryColor }} />
                        <span className="text-xs">Checklist item</span>
                      </div>
                      <div className="h-6 rounded" style={{ backgroundColor: values.cardColor, border: '1px solid #e5e7eb' }} />
                    </div>
                  </div>
                  <div className="rounded-lg p-2" style={{ backgroundColor: values.warningColor }}>
                    <p className="text-xs font-medium">⚠️ Warning callout</p>
                  </div>
                  <button
                    className="rounded px-3 py-1.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor: values.primaryColor,
                      borderRadius: values.buttonStyle === 'pill' ? '999px' : values.buttonStyle === 'square' ? '0' : '6px',
                    }}
                  >
                    Primary Button
                  </button>
                </div>
                <Separator className="my-3" />
                <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-400">PDF Export Preview</p>
                  {values.headerText && <p className="text-xs font-medium mt-1">{values.headerText}</p>}
                  {values.watermark && (
                    <p className="text-lg font-black opacity-10 rotate-[-30deg] select-none mt-2 text-gray-600">
                      {values.watermark}
                    </p>
                  )}
                  {values.footerText && <p className="text-[10px] text-gray-400 mt-2 border-t pt-2">{values.footerText}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
