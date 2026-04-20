import { RunnerShell } from '@/components/runner/runner-shell'

export const metadata = { title: 'Run Procedure' }

export default function RunnerPage({ params }: { params: { runId: string } }) {
  return <RunnerShell runId={params.runId} />
}
