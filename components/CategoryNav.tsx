'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap, Grid3x3, Brain, Type, Calculator,
  BookOpen, Trophy, Sparkles,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CATEGORIES } from '@/data/categories'
import { GAMES } from '@/data/games'

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Grid3x3, Brain, Type, Calculator, BookOpen, Trophy, Sparkles,
}

function getActiveCategorySlug(pathname: string): string | null {
  const catMatch = pathname.match(/^\/games\/category\/([^/]+)$/)
  if (catMatch) return catMatch[1]
  const gameMatch = pathname.match(/^\/games\/([^/]+)$/)
  if (gameMatch) {
    const game = GAMES.find((g) => g.slug === gameMatch[1])
    if (game) return game.category
  }
  return null
}

export default function CategoryNav() {
  const pathname = usePathname()
  const activeCategorySlug = getActiveCategorySlug(pathname)
  const scrollRef         = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateArrows()
    return () => clearInterval(scrollIntervalRef.current)
  }, [])

  function handleMouseMove(e: React.MouseEvent) {
    const container = scrollRef.current
    if (!container) return
    const rect      = container.getBoundingClientRect()
    const x         = e.clientX - rect.left
    const width     = rect.width
    const edgeZone  = 80
    const baseSpeed = 4
    clearInterval(scrollIntervalRef.current)
    if (x < edgeZone) {
      const intensity = 1 - x / edgeZone
      scrollIntervalRef.current = setInterval(() => {
        container.scrollLeft -= baseSpeed * (1 + intensity * 2)
        updateArrows()
      }, 16)
    } else if (x > width - edgeZone) {
      const intensity = (x - (width - edgeZone)) / edgeZone
      scrollIntervalRef.current = setInterval(() => {
        container.scrollLeft += baseSpeed * (1 + intensity * 2)
        updateArrows()
      }, 16)
    }
  }

  function handleMouseLeave() {
    clearInterval(scrollIntervalRef.current)
  }

  return (
    <nav aria-label="Game categories" className="relative">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-14 items-center justify-start pl-1 bg-gradient-to-r from-white to-transparent dark:from-zinc-950"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}

      <div
        ref={scrollRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onScroll={updateArrows}
        className="scrollbar-hidden flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
      >
        {CATEGORIES.map((cat) => {
          const Icon     = ICON_MAP[cat.icon]
          const isActive = cat.slug === activeCategorySlug
          const hasActive = activeCategorySlug !== null
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
                  : hasActive
                    ? 'opacity-50 hover:opacity-100'
                    : 'opacity-85 hover:opacity-100',
              ].join(' ')}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              {cat.name}
            </Link>
          )
        })}
      </div>

      {/* Right fade + arrow */}
      {canScrollRight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-14 items-center justify-end pr-1 bg-gradient-to-l from-white to-transparent dark:from-zinc-950"
        >
          <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}
    </nav>
  )
}
