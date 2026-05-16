import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { CATEGORIES } from '@/data/categories'
import { getGamesByCategory } from '@/lib/gameUtils'
import CategoryContent from '@/components/CategoryContent'
import AdBanner from '@/components/AdBanner'

const SITE_NAME = 'Antbreak'
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://antbreak.com'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)

  if (!category) {
    return { title: `Category Not Found | ${SITE_NAME}` }
  }

  return {
    title:       `${category.name} Games — Play Free | ${SITE_NAME}`,
    description: category.description,
    openGraph: {
      title:       `${category.name} Games — Play Free | ${SITE_NAME}`,
      description: category.description,
      url:         `${SITE_URL}/games/category/${category.slug}`,
      siteName:    SITE_NAME,
      type:        'website',
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)

  if (!category) notFound()

  const games = getGamesByCategory(slug)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li>
            <Link href="/games" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
              Games
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="font-medium text-zinc-900 dark:text-zinc-100">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Category header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {category.description}
        </p>
      </div>

      {/* Leaderboard ad — below category header, above game grid */}
      {/* AdSense Leaderboard — insert ad unit here */}
      <AdBanner size="leaderboard" className="mb-8" />

      {/* Sort dropdown + game grid (client-side sort) */}
      <CategoryContent games={games} category={category} />

    </div>
  )
}
