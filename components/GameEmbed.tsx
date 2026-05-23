'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Maximize2, Loader2, Heart, Share2, Star } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import type { Game, Category } from '@/types/game'

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

const BTN_BASE = 'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors'
const BTN_DEFAULT = `${BTN_BASE} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`

export default function GameEmbed({ game, category }: { game: Game; category?: Category }) {
  const [playing, setPlaying]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [showMore, setShowMore]   = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [userRating, setUserRating]   = useState(0)
  const [avgRating, setAvgRating]     = useState(0)
  const [avgCount, setAvgCount]       = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { addToHistory, favorites, toggleFavorite } = useUser()
  const favorited = favorites.includes(game.slug)

  const { width, height } = game.iframeSettings

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

  const isSelfHosted = game.gameUrl.startsWith('/')
  const iframeSourceProps = isSelfHosted
    ? ({ sandbox: 'allow-scripts allow-same-origin allow-forms' } as const)
    : ({
        referrerPolicy: 'no-referrer-when-downgrade' as const,
        scrolling: 'no',
        frameBorder: '0',
      } as const)

  function startPlaying() {
    setPlaying(true)
    setLoading(true)
    addToHistory(game.slug)
  }

  function handleFullscreen() {
    const el = iframeRef.current
    if (el && typeof el.requestFullscreen === 'function') {
      el.requestFullscreen().catch(() => {})
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* */ }
  }

  async function handleRate(stars: number) {
    setUserRating(stars)
    localStorage.setItem(`rating_${game.slug}`, String(stars))
    try {
      await fetch('/api/rate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: game.slug, rating: stars, gameTitle: game.name }),
      })
      const r = await fetch(`/api/rate-game?slug=${encodeURIComponent(game.slug)}`)
      const data: { average: number; count: number } = await r.json()
      if (data.count > 0) {
        setAvgRating(data.average)
        setAvgCount(data.count)
      }
    } catch {}
  }

  return (
    <>
      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">

        {/* ── Left: game frame ─────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-2xl bg-zinc-900"
            style={{
              aspectRatio: `${width} / ${height}`,
              maxHeight: '720px',
              minHeight: '360px',
            }}
          >
            {!playing ? (
              <>
                <div className="absolute inset-0">
                  {!imgFailed ? (
                    <Image
                      src={game.thumbnail}
                      alt={`${game.name} — click to play`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-800" />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <button
                  onClick={startPlaying}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`Play ${game.name}`}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-2xl backdrop-blur-sm transition-transform duration-150 hover:scale-110 active:scale-95">
                    <Play className="ml-1 h-8 w-8 fill-brand-700 text-brand-700" />
                  </div>
                  <span className="rounded-full bg-black/30 px-4 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                    Click to Play
                  </span>
                </button>
              </>
            ) : (
              <>
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-400" />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={game.gameUrl}
                  title={game.name}
                  allow="fullscreen; autoplay; payment"
                  allowFullScreen
                  onLoad={() => setLoading(false)}
                  className="absolute inset-0 h-full w-full border-0"
                  {...iframeSourceProps}
                />
              </>
            )}
          </div>
        </div>

        {/* ── Right: sidebar ───────────────────────────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-[280px]">

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
            <button
              type="button"
              onClick={handleFullscreen}
              disabled={!playing}
              className={`${BTN_DEFAULT} disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Enter fullscreen"
            >
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

            <button
              type="button"
              onClick={handleShare}
              className={BTN_DEFAULT}
            >
              <Share2 className="h-4 w-4" />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {userRating > 0 ? `Your rating: ${userRating}/5` : 'Rate this game'}
            </p>
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
                        filled
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-zinc-300 dark:text-zinc-600'
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

          <hr className="my-4 border-zinc-200 dark:border-zinc-700" />

          {/* Short description with Read more toggle */}
          {game.description && (
            <div>
              <p className={`text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 ${showMore ? '' : 'line-clamp-3'}`}>
                {game.description}
              </p>
              {game.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="mt-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {showMore ? 'Show less ↑' : 'Read more ↓'}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
