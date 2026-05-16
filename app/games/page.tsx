import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { GAMES } from '@/data/games'
import AdBanner from '@/components/AdBanner'
import GamesContent from '@/components/GamesContent'

export const metadata: Metadata = {
  title: 'All Games — Play Free | Antbreak',
  description: `Browse all ${GAMES.length}+ free browser games on Antbreak — puzzles, trivia, word games, racing, and more. No download, no login.`,
}

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="font-medium text-zinc-900 dark:text-zinc-100">Games</li>
        </ol>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          All Games
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {GAMES.length} free browser games — no download, no login.
        </p>
      </div>

      <AdBanner size="leaderboard" className="mb-8" />

      <GamesContent games={GAMES} />
    </div>
  )
}
