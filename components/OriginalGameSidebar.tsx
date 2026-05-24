'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Maximize2, Heart, Share2, Star } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import type { Game, Category } from '@/types/game'

const BTN_BASE =
  'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors'
const BTN_DEFAULT = `${BTN_BASE} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`

export default function OriginalGameSidebar({
  game,
  category,
}: {
  game: Game
  category?: Category
}) {
  const [copied, setCopied]           = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [userRating, setUserRating]   = useState(0)
  const [avgRating, setAvgRating]     = useState(0)
  const [avgCount, setAvgCount]       = useState(0)
  const { favorites, toggleFavorite } = useUser()
  const favorited = favorites.includes(game.slug)

  useEffect(() => {
    const saved = localStorage.getItem(`rating_${game.slug}`)
    if (saved) setUserRating(Number(saved))

    fetch(`/api/rate-game?slug=${encodeURIComponent(game.slug)}`)
      .then((r) => r.json())
      .then((data: { average: number; count: number }) => {
        if (data.count > 0) {
          setAvgRating(data.average)
          setAvgCount(data.count)
        }
      })
      .catch(() => {})
  }, [game.slug])

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* */ }
  }

  async function handleRate(star: number) {
    const next = userRating === star ? 0 : star
    setUserRating(next)
    if (next === 0) {
      localStorage.removeItem(`rating_${game.slug}`)
    } else {
      localStorage.setItem(`rating_${game.slug}`, String(next))
    }
    try {
      await fetch('/api/rate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: game.slug, rating: next, gameTitle: game.name }),
      })
      const r = await fetch(`/api/rate-game?slug=${encodeURIComponent(game.slug)}`)
      const data: { average: number; count: number } = await r.json()
      setAvgRating(data.count > 0 ? data.average : 0)
      setAvgCount(data.count)
    } catch {}
  }

  function handleFullscreen() {
    const el = document.getElementById('original-game-card')
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else if (el) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  return (
    <aside className="game-sidebar hidden w-[280px] shrink-0 lg:block">

      {/* Game name */}
      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {game.name}
      </h1>

      {/* Category badge */}
      {category && (
        <Link
          href={`/games/category/${category.slug}`}
          className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${category.color} ${category.textColor}`}
        >
          {category.name}
        </Link>
      )}

      <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button type="button" onClick={handleFullscreen} className={BTN_DEFAULT}>
          <Maximize2 className="h-4 w-4" />
          Fullscreen
        </button>

        <button
          type="button"
          onClick={() => toggleFavorite(game.slug)}
          aria-pressed={favorited}
          className={[
            BTN_BASE,
            favorited
              ? 'border-red-600 bg-red-500 text-white hover:bg-red-600'
              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
          ].join(' ')}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-white stroke-white' : ''}`} />
          {favorited ? 'Saved' : 'Add to Favorites'}
        </button>

        <button type="button" onClick={handleShare} className={BTN_DEFAULT}>
          <Share2 className="h-4 w-4" />
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

      {/* Star rating */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rate this game</p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || userRating)
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(star)}
                aria-label={`Rate ${star} out of 5 stars`}
                className="transition-colors"
              >
                <Star
                  className={`h-6 w-6 ${
                    filled ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'
                  }`}
                />
              </button>
            )
          })}
        </div>
        {avgCount > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {avgRating.toFixed(1)} ★ ({avgCount} {avgCount === 1 ? 'rating' : 'ratings'})
          </p>
        )}
      </div>

    </aside>
  )
}
