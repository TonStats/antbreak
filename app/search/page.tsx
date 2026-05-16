import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { searchGames, getMostPlayed } from '@/lib/gameUtils'
import GameCard from '@/components/GameCard'
import AdBanner from '@/components/AdBanner'

const SITE_NAME = 'Antbreak'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { q = '' } = await searchParams
  const query = Array.isArray(q) ? q[0] : q

  return {
    title: query
      ? `"${query}" — Search Results | ${SITE_NAME}`
      : `Search Games | ${SITE_NAME}`,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q = '' } = await searchParams
  const query   = Array.isArray(q) ? q[0] : q
  const results = query ? searchGames(query) : []
  const popular = getMostPlayed(3)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {query ? (
            <>
              Results for{' '}
              <span className="text-brand-600 dark:text-brand-400">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            'Search Games'
          )}
        </h1>
        {query && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {results.length === 0
              ? 'No games found'
              : `Found ${results.length} game${results.length === 1 ? '' : 's'}`}
          </p>
        )}
      </div>

      {/* Leaderboard ad — below header, above results */}
      {/* AdSense Leaderboard — insert ad unit here */}
      <AdBanner size="leaderboard" className="mb-8" />

      {/* Search results grid */}
      {query && results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Empty state — query present but no results */}
      {query && results.length === 0 && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No games found for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try a different search term, or browse popular games below.
            </p>
          </div>

          {/* Popular suggestions */}
          <div className="w-full max-w-xs">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              Popular Games
            </p>
            <div className="flex flex-col gap-2">
              {popular.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {game.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state — no query at all */}
      {!query && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500 dark:text-zinc-400">
            Use the search bar above to find games.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            ← Browse all games
          </Link>
        </div>
      )}

    </div>
  )
}
