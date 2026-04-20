import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  procedureId: z.string(),
  versionId: z.string().optional(),
  mode: z.enum(['step', 'checklist']).default('step'),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const procedureId = searchParams.get('procedureId')

    const runs = await prisma.procedureRun.findMany({
      where: { ...(procedureId && { procedureId }) },
      include: { runner: true, procedure: true, version: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ data: runs })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { procedureId, versionId, mode } = createSchema.parse(body)

    const procedure = await prisma.procedure.findUnique({ where: { id: procedureId } })
    if (!procedure) return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })

    const targetVersionId = versionId ?? procedure.currentVersionId
    if (!targetVersionId) return NextResponse.json({ error: 'No published version' }, { status: 400 })

    const version = await prisma.procedureVersion.findUnique({ where: { id: targetVersionId } })
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

    const runner = await prisma.user.findFirst()
    if (!runner) return NextResponse.json({ error: 'No user' }, { status: 404 })

    const run = await prisma.procedureRun.create({
      data: {
        procedureId,
        versionId: targetVersionId,
        runnerId: runner.id,
        mode,
        status: 'in_progress',
        progress: 0,
      },
      include: { runner: true, procedure: true, version: { include: { sections: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } } } } },
    })

    return NextResponse.json({ data: run }, { status: 201 })
  } catch (e) {
    console.error(e)
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 })
  }
}
