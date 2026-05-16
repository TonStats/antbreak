'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap, Grid3x3, Brain, Type, Calculator,
  BookOpen, Trophy, CalendarDays, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CATEGORIES } from '@/data/categories'

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Grid3x3, Brain, Type, Calculator, BookOpen, Trophy, CalendarDays, Sparkles,
}

export default function CategoryNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Game categories" className="relative">
      <div className="scrollbar-hidden flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon]
          const isActive = pathname === `/games/category/${cat.slug}`
          return (
            <Link
              key={cat.id}
              href={`/games/category/${cat.slug}`}
              className={[
                'shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                cat.color,
                cat.textColor,
                isActive
                  ? 'ring-2 ring-white ring-offset-2 dark:ring-offset-zinc-950'
                  : 'opacity-85 hover:opacity-100',
              ].join(' ')}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              {cat.name}
            </Link>
          )
        })}
      </div>

      {/* Right-edge fade — signals more pills beyond the visible area */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-white to-transparent dark:from-zinc-950"
      />
    </nav>
  )
}
