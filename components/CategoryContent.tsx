'use client'

import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import GameCard from '@/components/GameCard'
import AdBanner from '@/components/AdBanner'
import type { Game, Category } from '@/types/game'

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

export default function CategoryContent({
  games,
  category,
  icon,
}: {
  games: Game[]
  category: Category
  icon?: ReactNode
}) {
  const [sort, setSort] = useState<SortKey>('popular')
  const sorted = sortGames(games, sort)
  const chunks = chunkArray(sorted, CHUNK_SIZE)

  return (
    <>
      {/* Category banner — name left, sort right */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {category.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {category.description}
            </p>
          </div>
        </div>

        <div className="relative shrink-0">
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

      {/* Game grid — ad injected after every 2 rows (~8 games) */}
      {sorted.length > 0 ? (
        <>
          {chunks.map((chunk, i) => (
            <Fragment key={i}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {chunk.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              {/* AdSense Responsive — insert ad unit here */}
              {i < chunks.length - 1 && (
                <AdBanner size="responsive" className="my-6" />
              )}
            </Fragment>
          ))}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No {category.name} games yet — check back soon.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            ← Back to homepage
          </Link>
        </div>
      )}
    </>
  )
}
