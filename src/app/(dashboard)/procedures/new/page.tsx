import { NewProcedureForm } from '@/components/procedures/new-procedure-form'

export const metadata = { title: 'New Procedure' }

export default function NewProcedurePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Procedure</h2>
        <p className="text-sm text-gray-500 mt-1">Set up the basic details, then use the builder to add content.</p>
      </div>
      <NewProcedureForm />
    </div>
  )
}
