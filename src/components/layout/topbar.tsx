'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Bell } from 'lucide-react'
import Link from 'next/link'

const titles: Record<string, string> = {
  '/procedures': 'Procedures',
  '/runs': 'Recent Runs',
  '/settings': 'Settings & Branding',
  '/analytics': 'Analytics',
}

export function TopBar() {
  const pathname = usePathname()
  const title = Object.entries(titles).find(([p]) => pathname.startsWith(p))?.[1] ?? 'Procedure Builder'
  const showCreate = pathname.startsWith('/procedures') && !pathname.includes('/builder')

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {showCreate && (
          <Button size="sm" asChild>
            <Link href="/procedures/new">
              <Plus className="mr-1 h-4 w-4" />
              New Procedure
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
