import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const themeSchema = z.object({
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  canvasColor: z.string().optional(),
  cardColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonStyle: z.string().optional(),
  sectionColor: z.string().optional(),
  warningColor: z.string().optional(),
  dangerColor: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  exportLogoUrl: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  headerText: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  watermark: z.string().optional().nullable(),
  fontFamily: z.string().optional(),
})

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst({ include: { theme: true } })
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: workspace.theme })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = themeSchema.parse(body)

    const workspace = await prisma.workspace.findFirst()
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const theme = await prisma.workspaceTheme.upsert({
      where: { workspaceId: workspace.id },
      update: parsed,
      create: { workspaceId: workspace.id, ...parsed },
    })

    return NextResponse.json({ data: theme })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
