'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, Play, Settings, Star, Clock,
  Building2, ChevronRight, BarChart3
} from 'lucide-react'

const navItems = [
  { label: 'All Procedures', href: '/procedures', icon: FileText },
  { label: 'Favorites', href: '/procedures?isFavorite=true', icon: Star },
  { label: 'Recent Runs', href: '/runs', icon: Clock },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const bottomItems = [
  { label: 'Settings & Branding', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Play className="h-4 w-4 text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 leading-tight">Procedure Builder</span>
          <span className="text-[10px] text-gray-500 leading-tight">Workspace</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Library</p>
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/procedures' && pathname.startsWith(item.href.split('?')[0]))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Quick Filters</p>
          <ul className="space-y-0.5">
            {[
              { label: 'Procedures', href: '/procedures?type=procedure' },
              { label: 'Policies', href: '/procedures?type=policy' },
              { label: 'Run Sheets', href: '/procedures?type=runsheet' },
              { label: 'SOPs', href: '/procedures?type=sop' },
            ].map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                  <ChevronRight className="h-3 w-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-gray-200 px-2 py-3">
        {bottomItems.map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
        <div className="mt-2 flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            A
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-gray-900 truncate">Admin User</span>
            <span className="text-[10px] text-gray-500 truncate">admin@acme.com</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
