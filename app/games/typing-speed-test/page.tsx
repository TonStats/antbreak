import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import TypingGame from './TypingGame'
import OriginalGameActions from '@/components/OriginalGameActions'
import { GAMES } from '@/data/games'

const game = GAMES.find(g => g.id === 'typing-speed-test')!

export const metadata: Metadata = {
  title: 'Typing Speed Test — Check Your WPM Free | Antbreak',
  description:
    'Free online typing speed test. Check your WPM in real time, beat your personal best, and track your accuracy. No signup required.',
}

export default function TypingSpeedTestPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      <nav aria-label="Breadcrumb" className="py-1 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/games/category/original-games" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">Original Games</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-900 dark:text-zinc-100">Typing Speed Test</span>
      </nav>

      <div className="game-frame">
        <TypingGame />
      </div>

      <div className="mt-6 space-y-6 pb-12">
        <OriginalGameActions slug="typing-speed-test" />

        {game.howToPlay.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">How to Play</h2>
            <ol className="space-y-3">
              {game.howToPlay.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {game.tips.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tips &amp; Tricks</h2>
            <ul className="space-y-2.5">
              {game.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <span className="mt-0.5 shrink-0 select-none text-brand-500 dark:text-brand-400">◆</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{game.description}</p>
      </div>

    </div>
  )
}
