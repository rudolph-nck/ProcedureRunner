'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  type: z.enum(['procedure', 'policy', 'runsheet', 'sop']),
  category: z.string().optional(),
  department: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const PROCEDURE_TYPES = [
  { value: 'procedure', label: 'Procedure', description: 'Step-by-step operational procedure' },
  { value: 'policy', label: 'Policy', description: 'Company policy or regulatory requirement' },
  { value: 'runsheet', label: 'Run Sheet', description: 'Live operational run sheet or playbook' },
  { value: 'sop', label: 'SOP', description: 'Standard Operating Procedure' },
]

export function NewProcedureForm() {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'procedure' },
  })

  const selectedType = watch('type')

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create')
      toast.success('Procedure created — opening builder...')
      router.push(`/builder/${json.data.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create procedure')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROCEDURE_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('type', t.value as FormData['type'])}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    selectedType === t.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500 leading-tight">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g. Employee Onboarding Checklist"
              className={errors.title ? 'border-red-300' : ''}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of this procedure's purpose..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="e.g. Human Resources"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g. Onboarding, Safety"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create & Open Builder
        </Button>
      </div>
    </form>
  )
}
