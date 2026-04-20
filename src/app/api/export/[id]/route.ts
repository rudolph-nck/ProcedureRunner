import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const procedure = await prisma.procedure.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        tags: { include: { tag: true } },
        workspace: { include: { theme: true } },
        versions: {
          where: { status: 'published' },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: { blocks: { orderBy: { order: 'asc' } } },
            },
          },
        },
      },
    })

    if (!procedure) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const version = procedure.versions[0]
    if (!version) return NextResponse.json({ error: 'No published version' }, { status: 400 })

    const exportData = {
      procedure: {
        ...procedure,
        tags: procedure.tags.map(pt => pt.tag),
        versions: undefined,
      },
      version: {
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
      },
      theme: procedure.workspace.theme,
    }

    return NextResponse.json({ data: exportData })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to prepare export' }, { status: 500 })
  }
}
