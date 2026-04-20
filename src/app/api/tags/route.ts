import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({ name: z.string().min(1), color: z.string().default('#6B7280') })

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst()
    if (!workspace) return NextResponse.json({ data: [] })
    const tags = await prisma.tag.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: 'asc' } })
    return NextResponse.json({ data: tags })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, color } = createSchema.parse(body)
    const workspace = await prisma.workspace.findFirst()
    if (!workspace) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

    const tag = await prisma.tag.upsert({
      where: { name_workspaceId: { name, workspaceId: workspace.id } },
      update: { color },
      create: { name, color, workspaceId: workspace.id },
    })
    return NextResponse.json({ data: tag }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
