'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/data/categories'
import GameGrid from '@/components/GameGrid'
import type { Game } from '@/types/game'

export default function AllGamesSection({ games }: { games: Game[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? games.filter((g) => g.category === activeCategory)
    : games

  function toggle(id: string) {
    setActiveCategory((prev) => (prev === id ? null : id))
  }

  return (
    <section className="border-t border-zinc-200 py-12 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            All Games
          </h2>
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {games.length}
          </span>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              activeCategory === null
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            ].join(' ')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                activeCategory === cat.id
                  ? `${cat.color} ${cat.textColor}`
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
              ].join(' ')}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <GameGrid games={filtered} />
      </div>
    </section>
  )
}
