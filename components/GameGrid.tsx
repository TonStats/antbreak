import Link from 'next/link'
import GameCard from './GameCard'
import type { Game } from '@/types/game'

interface GameGridProps {
  games: Game[]
  title?: string
  viewAllHref?: string
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="aspect-video rounded-t-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-3 w-1/3 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  )
}

export default function GameGrid({ games, title, viewAllHref }: GameGridProps) {
  const loading = games.length === 0

  return (
    <section>
      {(title || viewAllHref) && (
        <div className="mb-5 flex items-baseline justify-between">
          {title && (
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View all →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
          : games.map((game) => <GameCard key={game.id} game={game} />)}
      </div>
    </section>
  )
}
