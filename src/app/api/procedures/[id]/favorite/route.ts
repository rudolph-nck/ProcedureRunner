import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findFirst()
    if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })

    const existing = await prisma.favorite.findUnique({
      where: { userId_procedureId: { userId: user.id, procedureId: params.id } },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { userId_procedureId: { userId: user.id, procedureId: params.id } } })
      return NextResponse.json({ data: { isFavorite: false } })
    } else {
      await prisma.favorite.create({ data: { userId: user.id, procedureId: params.id } })
      return NextResponse.json({ data: { isFavorite: true } })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
