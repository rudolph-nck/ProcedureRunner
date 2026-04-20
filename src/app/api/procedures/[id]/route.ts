import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['procedure', 'policy', 'runsheet', 'sop']).optional(),
  category: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const procedure = await prisma.procedure.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        tags: { include: { tag: true } },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                blocks: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
        _count: { select: { runs: true } },
      },
    })

    if (!procedure) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data = {
      ...procedure,
      tags: procedure.tags.map(pt => pt.tag),
      versions: procedure.versions.map(v => ({
        ...v,
        sections: v.sections.map(s => ({
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
      })),
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch procedure' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = updateSchema.parse(body)

    const { tagIds, ...rest } = parsed

    const procedure = await prisma.procedure.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({ tagId })),
          },
        }),
      },
      include: { owner: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json({ data: { ...procedure, tags: procedure.tags.map(pt => pt.tag) } })
  } catch (e) {
    console.error(e)
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update procedure' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.procedure.delete({ where: { id: params.id } })
    return NextResponse.json({ data: { success: true } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete procedure' }, { status: 500 })
  }
}
