'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Maximize2, Loader2, AlertTriangle, X, Heart, Share2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import type { Game, Category } from '@/types/game'

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

const BTN_BASE = 'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors'
const BTN_DEFAULT = `${BTN_BASE} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`

export default function GameEmbed({ game, category }: { game: Game; category?: Category }) {
  const [playing, setPlaying]                 = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [imgFailed, setImgFailed]             = useState(false)
  const [reportOpen, setReportOpen]           = useState(false)
  const [reportText, setReportText]           = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [copied, setCopied]                   = useState(false)
  const [showMore, setShowMore]               = useState(false)
  const iframeRef                             = useRef<HTMLIFrameElement>(null)
  const { addToHistory, favorites, toggleFavorite } = useUser()
  const favorited = favorites.includes(game.slug)

  const { width, height } = game.iframeSettings

  // Self-hosted games get sandbox for security.
  // Third-party embeds must not be sandboxed — it blocks the referrer header.
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

  async function handleReport() {
    if (!reportText.trim()) return
    try {
      await fetch('/api/report-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: game.slug, description: reportText }),
      })
    } catch {}
    setReportText('')
    setReportSubmitted(true)
    setTimeout(() => {
      setReportSubmitted(false)
      setReportOpen(false)
    }, 2000)
  }

  return (
    <>
      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">

        {/* ── Left: game frame — fills available column width, maintains ratio ── */}
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

        {/* ── Right: sidebar — 280px on desktop, full width on mobile ─────── */}
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

          {/* Report */}
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            disabled={!playing}
            className="mt-4 flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-600 disabled:cursor-not-allowed dark:hover:text-zinc-200"
          >
            <AlertTriangle className="h-3 w-3" />
            Report a problem
          </button>
        </aside>
      </div>

      {/* ── Report Modal ─────────────────────────────────────────────────── */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Report a Problem
              </h3>
              <button
                onClick={() => setReportOpen(false)}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <p className="py-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                Thanks for your report!
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                  Describe the issue with{' '}
                  <strong className="font-medium text-zinc-700 dark:text-zinc-300">
                    {game.name}
                  </strong>:
                </p>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Game doesn't load, audio issues, broken controls…"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReport}
                    disabled={!reportText.trim()}
                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-400"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
