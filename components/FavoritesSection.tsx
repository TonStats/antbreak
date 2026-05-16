'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { GAMES } from '@/data/games'
import { useUser } from '@/context/UserContext'
import GameCard from '@/components/GameCard'

export default function FavoritesSection() {
  const { favorites } = useUser()

  const games = useMemo(
    () =>
      favorites
        .map((slug) => GAMES.find((g) => g.slug === slug))
        .filter((g): g is NonNullable<typeof g> => g !== undefined),
    [favorites],
  )

  if (games.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
