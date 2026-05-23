import { GAMES } from '@/data/games'
import CategoryNav from '@/components/CategoryNav'
import GameGrid from '@/components/GameGrid'
import BackToTop from '@/components/BackToTop'

export default function Home() {
  const allGames = [...GAMES].sort((a, b) => b.playCount - a.playCount)

  return (
    <div className="flex flex-col">

      {/* ── Category nav ──────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <CategoryNav />
      </div>

      {/* ── All games grid ─────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GameGrid games={allGames} />
      </div>

      <BackToTop />
    </div>
  )
}
