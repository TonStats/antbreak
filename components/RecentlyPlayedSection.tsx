'use client'

import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { GAMES } from '@/data/games'
import { useUser } from '@/context/UserContext'
import GameCard from '@/components/GameCard'

export default function RecentlyPlayedSection() {
  const { recentlyPlayed } = useUser()

  const games = useMemo(
    () =>
      recentlyPlayed
        .slice(0, 4)
        .map((e) => GAMES.find((g) => g.slug === e.slug))
        .filter((g): g is NonNullable<typeof g> => g !== undefined),
    [recentlyPlayed],
  )

  if (games.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Clock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          Recently Played
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
