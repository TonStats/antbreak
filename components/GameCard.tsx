'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES } from '@/data/categories'
import { useUser } from '@/context/UserContext'
import type { Game } from '@/types/game'

// 1×1 neutral gray — used as blur placeholder for all dynamic thumbnails
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

function formatPlayCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m plays`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k plays`
  return `${n} plays`
}

export default function GameCard({ game }: { game: Game }) {
  const { favorites, toggleFavorite } = useUser()
  const [imgFailed, setImgFailed] = useState(false)

  const category = CATEGORIES.find((c) => c.id === game.category)
  const favorited = favorites.includes(game.slug)

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(game.slug)
  }

  return (
    <article className="group relative rounded-2xl border border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:border-brand-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700">
      {/* Main link — covers the full card */}
      <Link
        href={`/games/${game.slug}`}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {/* ── Thumbnail ─────────────────────────────────────────────── */}
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-zinc-200 dark:bg-zinc-800">
          {!imgFailed ? (
            <Image
              src={game.thumbnail}
              alt={`${game.name} thumbnail`}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              onError={() => setImgFailed(true)}
            />
          ) : (
            /* Fallback gradient when thumbnail is missing */
            <div
              className={[
                'absolute inset-0',
                category?.color ?? 'bg-zinc-400',
                'opacity-40',
              ].join(' ')}
            />
          )}

          {/* Hover overlay — shows play intent; iframe loads only on navigate */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-150 group-hover:scale-105">
              {/* Filled triangle — the classic ▶ play symbol */}
              <span className="ml-1 select-none text-2xl leading-none text-zinc-900">
                ▶
              </span>
            </div>
          </div>

          {/* EXCLUSIVE ribbon — left-edge flag for original games */}
          {game.isOriginal && (
            <div className="absolute left-0 top-3 z-10">
              <span className="flex items-center gap-1 rounded-r-full bg-indigo-600 py-0.5 pl-2 pr-3 text-[9px] font-bold uppercase tracking-widest text-white shadow-md">
                ✦ Exclusive
              </span>
            </div>
          )}
        </div>

        {/* ── Info ───────────────────────────────────────────────────── */}
        <div className="p-3">
          {/* Category badge */}
          {category && (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${category.color} ${category.textColor}`}
            >
              {category.name}
            </span>
          )}

          {/* Game name */}
          <h3 className="mt-1.5 line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {game.name}
          </h3>

          {/* Play count */}
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {formatPlayCount(game.playCount)}
          </p>
        </div>
      </Link>

      {/* Favorite button — sibling of Link, positioned absolutely over thumbnail */}
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={favorited ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`}
        aria-pressed={favorited}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            favorited
              ? 'fill-red-500 stroke-red-500'
              : 'fill-transparent stroke-white'
          }`}
        />
      </button>
    </article>
  )
}
