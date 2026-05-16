import Link from 'next/link'
import { Sparkles, Star, Flame, Clock, CalendarCheck } from 'lucide-react'

import { GAMES } from '@/data/games'
import {
  getFeaturedGames,
  getNewestGames,
  getMostPlayed,
  getDailyGame,
} from '@/lib/gameUtils'
import GameCard from '@/components/GameCard'
import CategoryNav from '@/components/CategoryNav'
import MidnightCountdown from '@/components/MidnightCountdown'
import RecentlyPlayedSection from '@/components/RecentlyPlayedSection'
import FavoritesSection from '@/components/FavoritesSection'
import AdBanner from '@/components/AdBanner'

// ─────────────────────────────────────────────────────────────────────────────
// Re-usable section-header row
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared responsive 4-column game grid (2 cols mobile, 3 tablet, 4 desktop)
// ─────────────────────────────────────────────────────────────────────────────
function GameRow({ games }: { games: ReturnType<typeof getFeaturedGames> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const featured  = getFeaturedGames(4)
  const newest    = getNewestGames(4)
  const popular   = getMostPlayed(4)
  const daily     = getDailyGame()
  const originals = GAMES.filter((g) => g.isOriginal)
  const total     = GAMES.length

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO — compact banner
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-linear-to-br from-brand-700 to-brand-900 px-4 py-6 text-center text-white sm:px-6 lg:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          Browser Games — Always Free
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Play {total}+ Free Games Instantly
        </h1>
        <p className="mt-1 text-sm text-white/80">
          No Download, No Login
        </p>
        <Link
          href="#featured-games"
          className="mt-4 inline-block rounded-full bg-white px-6 py-2 text-sm font-semibold text-brand-700 shadow-md transition-transform hover:scale-105 active:scale-100"
        >
          Browse Games
        </Link>
      </section>

      {/* ── Sticky category filter bar ─────────────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <CategoryNav />
      </div>

      {/* ── Personal sections — visible only after localStorage loads ─────── */}
      <RecentlyPlayedSection />
      <FavoritesSection />

      {/* ══════════════════════════════════════════════════════════════════════
          2. FEATURED GAMES — horizontal scroll row
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="featured-games"
        className="border-t border-zinc-200 py-10 dark:border-zinc-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Star className="h-5 w-5 fill-accent-500 text-accent-500" />}
            title="Featured Games"
            href="/games"
            linkText="See all →"
          />
        </div>

        {/* Scroll container — padding matches the content column so cards start flush */}
        <div className="scrollbar-hidden flex gap-4 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          {featured.map((game) => (
            <div key={game.id} className="w-[260px] shrink-0 sm:w-72">
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. NEW THIS WEEK
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          title="New This Week"
          href="/games?sort=new"
        />
        <GameRow games={newest} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          5. AD — 728×90 Leaderboard
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Google AdSense Leaderboard — insert ad unit here */}
      <AdBanner size="leaderboard" className="px-4 py-3 sm:px-6" />

      {/* ══════════════════════════════════════════════════════════════════════
          6. MOST POPULAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          title="Most Popular"
          href="/games?sort=popular"
        />
        <GameRow games={popular} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          7. DAILY CHALLENGE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-t border-b border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-950/60 dark:text-pink-400">
              <CalendarCheck className="h-3.5 w-3.5" />
              Daily Challenge
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Today's Challenge
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Can you beat it?
            </p>
          </div>

          {/* Game card — centered, constrained width */}
          <div className="mx-auto mt-8 max-w-[280px]">
            <GameCard game={daily} />
          </div>

          {/* Countdown */}
          <div className="mt-8 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Next challenge in
            </p>
            <MidnightCountdown />
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
              Resets at midnight — come back every day
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9. IN-FEED AD — sits between Daily Challenge and Original Games
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Google AdSense in-feed ad — insert ad unit here */}
      <AdBanner size="responsive" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" />

      {/* ══════════════════════════════════════════════════════════════════════
          8. ORIGINAL GAMES — special purple section
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-linear-to-br from-brand-900 to-indigo-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Label */}
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

          {/* Original game cards */}
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

    </div>
  )
}
