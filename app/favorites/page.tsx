'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { GAMES } from '@/data/games'
import { useUser } from '@/context/UserContext'
import GameCard from '@/components/GameCard'
import AdBanner from '@/components/AdBanner'

export default function FavoritesPage() {
  const { favorites } = useUser()

  const games = useMemo(
    () =>
      favorites
        .map((slug) => GAMES.find((g) => g.slug === slug))
        .filter((g): g is NonNullable<typeof g> => g !== undefined),
    [favorites],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Your Favorites
        </h1>
        {games.length > 0 && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {games.length} saved game{games.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Leaderboard ad — below page header */}
      {/* AdSense Leaderboard — insert ad unit here */}
      <AdBanner size="leaderboard" className="mb-8" />

      {games.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Heart className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No favorites yet. Click ❤ on any game to save it.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            ← Browse games
          </Link>
        </div>
      )}
    </div>
  )
}
