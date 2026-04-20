import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const notes = body.notes ?? null

    const procedure = await prisma.procedure.findUnique({
      where: { id: params.id },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    })

    if (!procedure) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const latestVersion = procedure.versions[0]
    if (!latestVersion) return NextResponse.json({ error: 'No version found' }, { status: 400 })

    if (latestVersion.status === 'published') {
      const newVersion = await prisma.procedureVersion.create({
        data: {
          procedureId: procedure.id,
          version: latestVersion.version + 1,
          status: 'draft',
          notes: 'New draft from published version',
        },
      })
      return NextResponse.json({ data: { message: 'New draft created', version: newVersion } })
    }

    const updated = await prisma.procedureVersion.update({
      where: { id: latestVersion.id },
      data: { status: 'published', publishedAt: new Date(), notes },
    })

    await prisma.procedure.update({
      where: { id: params.id },
      data: { status: 'published', currentVersionId: updated.id },
    })

    const owner = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (owner) {
      await prisma.auditLog.create({
        data: {
          procedureId: params.id,
          userId: owner.id,
          action: 'published',
          details: JSON.stringify({ version: updated.version, notes }),
        },
      })
    }

    return NextResponse.json({ data: { message: 'Published', version: updated } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
