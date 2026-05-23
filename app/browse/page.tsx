import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Flame, Clock } from 'lucide-react'

import { GAMES } from '@/data/games'
import { getNewestGames, getMostPlayed } from '@/lib/gameUtils'
import GameCard from '@/components/GameCard'
import FourHourCountdown from '@/components/FourHourCountdown'
import AdBanner from '@/components/AdBanner'
import BrowsePersonalSections from '@/components/BrowsePersonalSections'
import BackToTop from '@/components/BackToTop'

function get4HourSeed() {
  const now = new Date()
  const hourBlock = Math.floor(now.getHours() / 4)
  return now.getFullYear() * 100000 + (now.getMonth() + 1) * 1000 + now.getDate() * 10 + hourBlock
}

export const metadata: Metadata = {
  title: 'Browse Games — Antbreak',
}

function SectionHeader({
  icon,
  title,
  href,
  linkText = 'View all →',
}: {
  icon?: React.ReactNode
  title: string
  href?: string
  linkText?: string
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        {icon}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {linkText}
        </Link>
      )}
    </div>
  )
}

function GameRow({ games }: { games: ReturnType<typeof getMostPlayed> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}

export default function BrowsePage() {
  const popular   = getMostPlayed(4)
  const newest    = getNewestGames(4)
  const originals = GAMES.filter((g) => g.isOriginal)

  const seed    = get4HourSeed()
  const index1  = seed % originals.length
  const index2r = (seed * 7 + 3) % originals.length
  const index2  = index2r === index1 ? (index2r + 1) % originals.length : index2r
  const challengeGames = [originals[index1], originals[index2]]

  return (
    <div className="flex flex-col">

      {/* ── Personal sections — visible only when localStorage has data ───── */}
      <BrowsePersonalSections />

      {/* ══════════════════════════════════════════════════════════════════════
          1. MOST POPULAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          title="Most Popular"
          href="/browse"
        />
        <GameRow games={popular} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. NEW THIS WEEK
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          title="New This Week"
          href="/browse"
        />
        <GameRow games={newest} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. AD — Leaderboard
      ══════════════════════════════════════════════════════════════════════ */}
      <AdBanner size="leaderboard" className="px-4 py-3 sm:px-6" />

      {/* ══════════════════════════════════════════════════════════════════════
          4. DAILY CHALLENGE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-b border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Today's Challenge
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Can you beat it?
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-4">
            {challengeGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Next challenge in
            </p>
            <FourHourCountdown />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. AD — In-feed
      ══════════════════════════════════════════════════════════════════════ */}
      <AdBanner size="responsive" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" />

      {/* ══════════════════════════════════════════════════════════════════════
          6. ORIGINAL GAMES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-linear-to-br from-brand-900 to-indigo-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
              Antbreak Originals
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Games You Can't Find Anywhere Else
          </h2>
          <p className="mt-2 max-w-xl text-brand-200">
            Built in-house and exclusive to Antbreak. Free to play, forever.
          </p>

          {originals.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {originals.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-12 text-center">
              <Sparkles className="h-10 w-10 text-indigo-400 opacity-40" />
              <p className="text-brand-200">
                Original games coming soon — check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      <BackToTop />
    </div>
  )
}
