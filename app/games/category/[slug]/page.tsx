import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Zap, Grid3x3, Brain, Type, Calculator,
  BookOpen, Trophy, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { CATEGORIES } from '@/data/categories'
import { getGamesByCategory } from '@/lib/gameUtils'
import CategoryContent from '@/components/CategoryContent'
import AdBanner from '@/components/AdBanner'

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Grid3x3, Brain, Type, Calculator, BookOpen, Trophy, Sparkles,
}

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
  const Icon  = ICON_MAP[category.icon]

  const iconNode = Icon ? (
    <div key="category-icon" className={`rounded-lg p-2 ${category.color}`}>
      <Icon className={`h-5 w-5 ${category.textColor}`} />
    </div>
  ) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Leaderboard ad — below category header, above game grid */}
      {/* AdSense Leaderboard — insert ad unit here */}
      <AdBanner size="leaderboard" className="mb-8" />

      {/* Banner + sort + game grid (client-side sort) */}
      <CategoryContent games={games} category={category} icon={iconNode} />

    </div>
  )
}
