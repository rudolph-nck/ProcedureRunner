import { ExportShell } from '@/components/export/export-shell'

export const metadata = { title: 'Export Procedure' }

export default function ExportPage({ params }: { params: { id: string } }) {
  return <ExportShell procedureId={params.id} />
}
