import { BuilderShell } from '@/components/builder/builder-shell'

export const metadata = { title: 'Procedure Builder' }

export default function BuilderPage({ params }: { params: { id: string } }) {
  return <BuilderShell procedureId={params.id} />
}
