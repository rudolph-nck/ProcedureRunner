import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['procedure', 'policy', 'runsheet', 'sop']).default('procedure'),
  category: z.string().optional(),
  department: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const department = searchParams.get('department')
    const tags = searchParams.getAll('tags')
    const isFavorite = searchParams.get('isFavorite') === 'true'
    const sortBy = searchParams.get('sortBy') ?? 'updatedAt'
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const skip = (page - 1) * limit

    const workspace = await prisma.workspace.findFirst()
    if (!workspace) return NextResponse.json({ error: 'No workspace found' }, { status: 404 })

    const where: Record<string, unknown> = {
      workspaceId: workspace.id,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
          { department: { contains: search } },
        ],
      }),
      ...(type && type !== 'all' && { type }),
      ...(status && status !== 'all' && { status }),
      ...(category && { category }),
      ...(department && { department }),
      ...(tags.length > 0 && { tags: { some: { tagId: { in: tags } } } }),
    }

    const userId = searchParams.get('userId')

    const [procedures, total] = await Promise.all([
      prisma.procedure.findMany({
        where,
        include: {
          owner: true,
          tags: { include: { tag: true } },
          favorites: userId ? { where: { userId } } : false,
          _count: { select: { runs: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.procedure.count({ where }),
    ])

    const data = procedures.map(p => ({
      ...p,
      tags: p.tags.map(pt => pt.tag),
      isFavorite: Array.isArray(p.favorites) ? p.favorites.length > 0 : false,
      favorites: undefined,
    }))

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSchema.parse(body)

    const workspace = await prisma.workspace.findFirst()
    if (!workspace) return NextResponse.json({ error: 'No workspace found' }, { status: 404 })

    const owner = await prisma.user.findFirst({ where: { workspaceId: workspace.id } })
    if (!owner) return NextResponse.json({ error: 'No user found' }, { status: 404 })

    const procedure = await prisma.procedure.create({
      data: {
        workspaceId: workspace.id,
        ownerId: owner.id,
        title: parsed.title,
        description: parsed.description,
        type: parsed.type,
        category: parsed.category,
        department: parsed.department,
        status: 'draft',
        ...(parsed.tagIds?.length && {
          tags: { create: parsed.tagIds.map(tagId => ({ tagId })) },
        }),
      },
      include: { owner: true, tags: { include: { tag: true } } },
    })

    const version = await prisma.procedureVersion.create({
      data: {
        procedureId: procedure.id,
        version: 1,
        status: 'draft',
      },
    })

    await prisma.procedure.update({
      where: { id: procedure.id },
      data: { currentVersionId: version.id },
    })

    await prisma.auditLog.create({
      data: {
        procedureId: procedure.id,
        userId: owner.id,
        action: 'created',
        details: JSON.stringify({ title: procedure.title }),
      },
    })

    return NextResponse.json({ data: { ...procedure, currentVersionId: version.id } }, { status: 201 })
  } catch (e) {
    console.error(e)
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create procedure' }, { status: 500 })
  }
}
