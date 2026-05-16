import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Rss } from 'lucide-react'
import AdBanner from '@/components/AdBanner'

export const metadata: Metadata = {
  title: 'Blog — Antbreak',
  description:
    'The Antbreak blog — game guides, site news, developer stories, and tips to help you play better. Coming soon.',
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="font-medium text-zinc-900 dark:text-zinc-100">Blog</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        Antbreak Blog
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Game guides, site updates, developer stories, and tips to help you get more out of Antbreak.
      </p>

      {/* Leaderboard ad — below page header */}
      {/* AdSense Leaderboard — insert ad unit here */}
      <AdBanner size="leaderboard" className="mt-6" />

      {/* Coming soon */}
      <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <Rss className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Coming Soon
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            We&apos;re working on articles, game guides, and behind-the-scenes posts.
            Check back soon — first posts are on the way.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          ← Back to games
        </Link>
      </div>

    </div>
  )
}
