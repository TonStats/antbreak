import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { GAMES } from '@/data/games'
import { CATEGORIES } from '@/data/categories'
import { getGameBySlug, getRelatedGames } from '@/lib/gameUtils'
import GameCard from '@/components/GameCard'
import GameEmbed from '@/components/GameEmbed'
import AdBanner from '@/components/AdBanner'

// ─────────────────────────────────────────────────────────────────────────────
// Static params — pre-render a page for every game at build time
// ─────────────────────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }))
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO metadata
// ─────────────────────────────────────────────────────────────────────────────
const SITE_NAME = 'Antbreak'
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://antbreak.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const game = getGameBySlug(slug)

  if (!game) {
    return { title: `Game Not Found | ${SITE_NAME}` }
  }

  const description = game.description.slice(0, 150)
  const ogImage     = game.thumbnail ? `${SITE_URL}${game.thumbnail}` : undefined

  return {
    title: `${game.name} — Play Free Online | ${SITE_NAME}`,
    description,
    openGraph: {
      title:       `${game.name} — Play Free Online | ${SITE_NAME}`,
      description,
      url:         `${SITE_URL}/games/${game.slug}`,
      siteName:    SITE_NAME,
      images:      ogImage ? [{ url: ogImage, alt: game.name }] : [],
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${game.name} — Play Free Online | ${SITE_NAME}`,
      description,
      images:      ogImage ? [ogImage] : [],
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game     = getGameBySlug(slug)

  if (!game) notFound()

  const category = CATEGORIES.find((c) => c.id === game.category)
  const related  = getRelatedGames(String(game.id), 3)

  // JSON-LD — VideoGame schema
  const jsonLd = {
    '@context':           'https://schema.org',
    '@type':              'VideoGame',
    name:                 game.name,
    description:          game.description,
    url:                  `${SITE_URL}/games/${game.slug}`,
    genre:                category?.name,
    image:                game.thumbnail ? `${SITE_URL}${game.thumbnail}` : undefined,
    applicationCategory:  'Game',
    operatingSystem:      'Web Browser',
    offers: {
      '@type': 'Offer',
      price:   '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb — 32px row ──────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="py-2">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link href="/" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            {category && (
              <>
                <li>
                  <Link
                    href={`/games/category/${category.slug}`}
                    className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    {category.name}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              </>
            )}
            <li className="font-medium text-zinc-900 dark:text-zinc-100">
              {game.name}
            </li>
          </ol>
        </nav>

        {/* ── Game + sidebar ────────────────────────────────────── */}
        <GameEmbed game={game} category={category} />

        {/* ── Below-fold content — user scrolls to reach ────────── */}
        <div className="mt-8 space-y-10 pb-10">

            {/* How to Play */}
            {game.howToPlay.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  How to Play
                </h2>
                <ol className="space-y-3">
                  {game.howToPlay.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Tips & Tricks */}
            {game.tips.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Tips &amp; Tricks
                </h2>
                <ul className="space-y-2.5">
                  {game.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      <span className="mt-0.5 select-none text-brand-500 dark:text-brand-400">
                        ◆
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* About / Description */}
            <section>
              <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                About {game.name}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {game.description}
              </p>
            </section>

            {/* Leaderboard ad */}
            {/* AdSense Leaderboard — insert ad unit here */}
            <AdBanner size="leaderboard" />

            {/* You Might Also Like */}
            {related.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    You Might Also Like
                  </h2>
                  {category && (
                    <Link
                      href={`/games/category/${category.slug}`}
                      className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      See all →
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {related.map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              </section>
            )}

            {/* Responsive ad — below related games */}
            {/* AdSense Responsive — insert ad unit here */}
            <AdBanner size="responsive" />
        </div>
      </div>
    </>
  )
}
