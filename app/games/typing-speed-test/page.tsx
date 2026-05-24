import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import TypingGame from './TypingGame'
import OriginalGameSidebar from '@/components/OriginalGameSidebar'
import { GAMES } from '@/data/games'
import { CATEGORIES } from '@/data/categories'

const game     = GAMES.find(g => g.id === 'typing-speed-test')!
const category = CATEGORIES.find(c => c.id === game.category)

export const metadata: Metadata = {
  title: 'Typing Speed Test — Check Your WPM Free | Antbreak',
  description:
    'Free online typing speed test. Check your WPM in real time, beat your personal best, and track your accuracy. No signup required.',
}

export default function TypingSpeedTestPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="py-1">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">Home</Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li>
            <Link href={`/games/category/${category?.slug ?? 'original-games'}`} className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
              {category?.name ?? 'Original Games'}
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="font-medium text-zinc-900 dark:text-zinc-100">Typing Speed Test</li>
        </ol>
      </nav>

      {/* Two-column layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">

        {/* Left: game */}
        <div className="min-w-0 flex-1">
          <div style={{ height: 'calc(100vh - 100px)', minHeight: '500px', overflowY: 'auto' }}>
            <TypingGame />
          </div>
        </div>

        {/* Right: sidebar — desktop only */}
        <OriginalGameSidebar game={game} category={category} />

      </div>

      {/* Below-fold: How to Play, Tips, About */}
      <div className="mt-8 space-y-10 pb-10">

        {game.howToPlay.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">How to Play</h2>
            <ol className="space-y-3">
              {game.howToPlay.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {game.tips.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Tips &amp; Tricks</h2>
            <ul className="space-y-2.5">
              {game.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <span className="mt-0.5 select-none text-brand-500 dark:text-brand-400">◆</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">About Typing Speed Test</h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{game.description}</p>
        </section>

      </div>
    </div>
  )
}
