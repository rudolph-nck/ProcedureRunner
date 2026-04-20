'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function NewRunInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const procedureId = searchParams.get('procedureId')
  const mode = searchParams.get('mode') ?? 'step'

  useEffect(() => {
    if (!procedureId) { router.push('/procedures'); return }

    fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procedureId, mode }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.data?.id) {
          router.replace(`/runner/${json.data.id}`)
        } else {
          toast.error(json.error ?? 'Failed to start run')
          router.push('/procedures')
        }
      })
      .catch(() => {
        toast.error('Failed to start run')
        router.push('/procedures')
      })
  }, [procedureId, mode, router])

  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    </div>
  )
}
