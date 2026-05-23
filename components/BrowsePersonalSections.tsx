'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Clock, Heart } from 'lucide-react'
import { GAMES } from '@/data/games'
import { useUser } from '@/context/UserContext'
import GameGrid from '@/components/GameGrid'

export default function BrowsePersonalSections() {
  const { recentlyPlayed, favorites } = useUser()

  const recentGames = useMemo(
    () =>
      recentlyPlayed
        .slice(0, 4)
        .map((e) => GAMES.find((g) => g.slug === e.slug))
        .filter((g): g is NonNullable<typeof g> => g !== undefined),
    [recentlyPlayed],
  )

  const favoriteGames = useMemo(
    () =>
      favorites
        .map((slug) => GAMES.find((g) => g.slug === slug))
        .filter((g): g is NonNullable<typeof g> => g !== undefined),
    [favorites],
  )

  if (recentGames.length === 0 && favoriteGames.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">

      {recentGames.length > 0 && (
        <div>
          <div className="mb-5 flex items-center gap-2">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              <Clock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              Recently Played
            </h2>
          </div>
          <GameGrid games={recentGames} />
        </div>
      )}

      {favoriteGames.length > 0 && (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              <Heart className="h-5 w-5 fill-red-500 stroke-red-500" />
              Your Favorites
            </h2>
            <Link
              href="/favorites"
              className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              See all →
            </Link>
          </div>
          <GameGrid games={favoriteGames} />
        </div>
      )}

    </div>
  )
}
