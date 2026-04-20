import { Suspense } from 'react'
import { ProcedureList } from '@/components/procedures/procedure-list'
import { Loader2 } from 'lucide-react'

export const metadata = { title: 'Procedures' }

export default function ProceduresPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>}>
      <ProcedureList />
    </Suspense>
  )
}
