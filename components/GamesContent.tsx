'use client'

import { Fragment, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import GameCard from '@/components/GameCard'
import AdBanner from '@/components/AdBanner'
import { CATEGORIES } from '@/data/categories'
import type { Game } from '@/types/game'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Played' },
  { value: 'newest',  label: 'Newest' },
  { value: 'az',      label: 'A–Z' },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['value']

const CHUNK_SIZE = 8

function sortGames(games: Game[], sort: SortKey): Game[] {
  switch (sort) {
    case 'popular':
      return [...games].sort((a, b) => b.playCount - a.playCount)
    case 'newest':
      return [...games].sort(
        (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
    case 'az':
      return [...games].sort((a, b) => a.name.localeCompare(b.name))
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export default function GamesContent({ games }: { games: Game[] }) {
  const [sort, setSort]                   = useState<SortKey>('popular')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? games.filter((g) => g.category === activeCategory)
    : games

  const sorted = sortGames(filtered, sort)
  const chunks = chunkArray(sorted, CHUNK_SIZE)

  return (
    <>
      {/* Category filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? 'bg-brand-600 text-white'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() =>
              setActiveCategory(cat.slug === activeCategory ? null : cat.slug)
            }
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.slug
                ? 'bg-brand-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort / count bar */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {sorted.length === 0
            ? 'No games found'
            : `Showing ${sorted.length} game${sorted.length === 1 ? '' : 's'}`}
        </p>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none rounded-xl border border-zinc-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-zinc-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* Game grid — ad injected between every 8-game chunk */}
      {sorted.length > 0 ? (
        <>
          {chunks.map((chunk, i) => (
            <Fragment key={i}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {chunk.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              {i < chunks.length - 1 && (
                <AdBanner size="responsive" className="my-6" />
              )}
            </Fragment>
          ))}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No games found in this category yet.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            ← Show all games
          </button>
        </div>
      )}
    </>
  )
}
