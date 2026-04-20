import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const versionId = searchParams.get('versionId')

    const procedure = await prisma.procedure.findUnique({ where: { id: params.id } })
    if (!procedure) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const targetVersionId = versionId ?? procedure.currentVersionId
    if (!targetVersionId) return NextResponse.json({ error: 'No version' }, { status: 404 })

    const version = await prisma.procedureVersion.findUnique({
      where: { id: targetVersionId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { blocks: { orderBy: { order: 'asc' } } },
        },
      },
    })

    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

    const data = {
      ...version,
      sections: version.sections.map(s => ({
        ...s,
        style: parseJson(s.style, {}),
        blocks: s.blocks.map(b => ({
          ...b,
          content: parseJson(b.content, {}),
          style: parseJson(b.style, {}),
          validation: parseJson(b.validation, {}),
          logic: parseJson(b.logic, {}),
        })),
      })),
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 })
  }
}
