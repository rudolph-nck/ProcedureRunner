import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/utils'
import { z } from 'zod'

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  order: z.number(),
  style: z.record(z.unknown()).default({}),
  blocks: z.array(z.object({
    id: z.string(),
    sectionId: z.string(),
    type: z.string(),
    order: z.number(),
    content: z.record(z.unknown()).default({}),
    style: z.record(z.unknown()).default({}),
    validation: z.record(z.unknown()).default({}),
    logic: z.record(z.unknown()).default({}),
  })),
})

const saveSchema = z.object({
  versionId: z.string(),
  sections: z.array(sectionSchema),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { versionId, sections } = saveSchema.parse(body)

    const version = await prisma.procedureVersion.findUnique({
      where: { id: versionId, procedureId: params.id },
    })

    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    if (version.status === 'published') {
      return NextResponse.json({ error: 'Cannot edit a published version' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.procedureSection.deleteMany({ where: { versionId } })

      for (const section of sections) {
        const isNew = section.id.startsWith('section_')
        const createdSection = await tx.procedureSection.create({
          data: {
            id: isNew ? undefined : section.id,
            versionId,
            title: section.title,
            description: section.description,
            order: section.order,
            style: JSON.stringify(section.style),
          },
        })

        for (const block of section.blocks) {
          const isNewBlock = block.id.startsWith('block_')
          await tx.procedureBlock.create({
            data: {
              id: isNewBlock ? undefined : block.id,
              sectionId: createdSection.id,
              type: block.type,
              order: block.order,
              content: JSON.stringify(block.content),
              style: JSON.stringify(block.style),
              validation: JSON.stringify(block.validation),
              logic: JSON.stringify(block.logic),
            },
          })
        }
      }

      await tx.procedureVersion.update({
        where: { id: versionId },
        data: { updatedAt: new Date() },
      })
    })

    const updated = await prisma.procedureVersion.findUnique({
      where: { id: versionId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { blocks: { orderBy: { order: 'asc' } } },
        },
      },
    })

    const data = {
      ...updated,
      sections: updated!.sections.map(s => ({
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
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
