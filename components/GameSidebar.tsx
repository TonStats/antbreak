'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Share2, Trophy } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import AdBanner from '@/components/AdBanner'
import type { Game, Category } from '@/types/game'

interface Props {
  game: Game
  category: Category | undefined
}

export default function GameSidebar({ game, category }: Props) {
  const { favorites, toggleFavorite, getHighScore } = useUser()
  const [copied, setCopied] = useState(false)

  const favorited = favorites.includes(game.slug)
  const bestScore = getHighScore(game.slug)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silent fail
    }
  }

  return (
    <aside className="flex flex-col gap-4">
      {/* ── Best Score ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          <Trophy className="h-3.5 w-3.5" />
          Your Best Score
        </div>
        <p className="text-3xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
          {bestScore !== null ? bestScore.toLocaleString() : '–'}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-600">
          Scores saved automatically after each game
        </p>
      </div>

      {/* ── Favorite button ──────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => toggleFavorite(game.slug)}
        aria-pressed={favorited}
        className={[
          'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
          favorited
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
        ].join(' ')}
      >
        <Heart
          className={`h-4 w-4 ${favorited ? 'fill-white stroke-white' : 'stroke-current'}`}
        />
        {favorited ? 'Saved to Favorites' : 'Add to Favorites'}
      </button>

      {/* ── Share button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleShare}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Share2 className="h-4 w-4" />
        {copied ? 'Copied!' : 'Share Game'}
      </button>

      {/* ── Ad 300×250 — below share button ─────────────────────── */}
      {/* AdSense Rectangle — insert ad unit here */}
      <AdBanner size="rectangle" />

      {/* ── Category badge ───────────────────────────────────────── */}
      {category && (
        <Link
          href={`/games/category/${category.slug}`}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${category.color} ${category.textColor}`}
        >
          {category.name}
        </Link>
      )}
    </aside>
  )
}
