import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ content: z.string().min(1), blockId: z.string().optional() })

export async function POST(req: NextRequest, { params }: { params: { runId: string } }) {
  try {
    const body = await req.json()
    const { content, blockId } = schema.parse(body)
    const author = await prisma.user.findFirst()
    if (!author) return NextResponse.json({ error: 'No user' }, { status: 404 })

    const comment = await prisma.comment.create({
      data: { runId: params.runId, authorId: author.id, content, blockId },
      include: { author: true },
    })

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
