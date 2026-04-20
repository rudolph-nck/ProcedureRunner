import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst({
      include: { theme: true, users: true },
    })
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: workspace })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
