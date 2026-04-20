import { Suspense } from 'react'
import { NewRunInner } from './new-run-inner'
import { Loader2 } from 'lucide-react'

export default function NewRunPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>}>
      <NewRunInner />
    </Suspense>
  )
}
