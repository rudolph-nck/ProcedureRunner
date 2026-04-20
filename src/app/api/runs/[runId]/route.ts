import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
  progress: z.number().min(0).max(100).optional(),
  currentBlockId: z.string().optional().nullable(),
  blockValues: z.array(z.object({
    blockId: z.string(),
    value: z.string().optional().nullable(),
    completed: z.boolean().optional(),
    timerElapsed: z.number().optional().nullable(),
  })).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { runId: string } }) {
  try {
    const run = await prisma.procedureRun.findUnique({
      where: { id: params.runId },
      include: {
        runner: true,
        procedure: true,
        version: {
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: { blocks: { orderBy: { order: 'asc' } } },
            },
          },
        },
        blockValues: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        approvals: { include: { approver: true } },
      },
    })

    if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data = {
      ...run,
      version: run.version ? {
        ...run.version,
        sections: run.version.sections.map(s => ({
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
      } : null,
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { runId: string } }) {
  try {
    const body = await req.json()
    const { blockValues, ...rest } = updateSchema.parse(body)

    const data: Record<string, unknown> = { ...rest }
    if (rest.status === 'completed') data.completedAt = new Date()

    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.procedureRun.update({ where: { id: params.runId }, data })
      }

      if (blockValues?.length) {
        for (const bv of blockValues) {
          await tx.runBlockValue.upsert({
            where: { runId_blockId: { runId: params.runId, blockId: bv.blockId } },
            update: {
              value: bv.value,
              completed: bv.completed ?? false,
              completedAt: bv.completed ? new Date() : null,
              timerElapsed: bv.timerElapsed,
            },
            create: {
              runId: params.runId,
              blockId: bv.blockId,
              value: bv.value,
              completed: bv.completed ?? false,
              completedAt: bv.completed ? new Date() : null,
              timerElapsed: bv.timerElapsed,
            },
          })
        }
      }
    })

    const updated = await prisma.procedureRun.findUnique({
      where: { id: params.runId },
      include: { blockValues: true },
    })

    return NextResponse.json({ data: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
