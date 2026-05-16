import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Gamepad2, Sparkles, Moon, LogIn, LayoutGrid } from 'lucide-react'
import AdBanner from '@/components/AdBanner'

export const metadata: Metadata = {
  title: 'About — Antbreak',
  description:
    'Learn about Antbreak — the free browser gaming platform built for speed, accessibility, and daily fun. No downloads, no logins, just games.',
}

export default function AboutPage() {
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
          <li className="font-medium text-zinc-900 dark:text-zinc-100">About</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        About Antbreak
      </h1>

      <div className="mt-8 space-y-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">

        {/* What we are */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            What is Antbreak?
          </h2>
          <p>
            Antbreak is a free browser gaming platform where you can play hundreds of games
            instantly — no downloads, no plugins, no account required. We believe the best
            games are the ones you can jump into in seconds, whether you have five minutes
            between meetings or a whole afternoon to explore.
          </p>
          <p className="mt-3">
            From brain-teasing puzzles and daily word challenges to retro racing games and
            original titles you won&apos;t find anywhere else, Antbreak is designed to be the
            one tab you keep open all day.
          </p>
        </section>

        {/* Why we built it */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Why We Built This
          </h2>
          <p>
            Browser games should be fast, free, and ad-friendly. Too many gaming sites are
            buried under paywalls, forced sign-ups, or ads that hijack the entire screen.
            We set out to build something different — a platform where games load
            immediately, ads are respectful and non-intrusive, and the experience feels
            polished on every device from a phone to a widescreen monitor.
          </p>
          <p className="mt-3">
            We also wanted a home for original games — titles built specifically for this
            platform, exclusive to Antbreak, and free forever.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            What You Get
          </h2>
          <ul className="space-y-4">
            {[
              {
                icon: <LayoutGrid className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />,
                title: 'Nine game categories',
                body: 'Action & Arcade, Puzzle & Logic, Word & Language, Numbers & Math, Trivia & Knowledge, Sports & Racing, Board & Card, Daily Challenges, and Antbreak Originals.',
              },
              {
                icon: <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />,
                title: 'Antbreak Originals',
                body: 'A growing library of games built in-house and exclusive to this platform. Free to play, forever.',
              },
              {
                icon: <Moon className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />,
                title: 'Dark mode',
                body: 'Full light and dark mode support that respects your system preference and remembers your choice.',
              },
              {
                icon: <LogIn className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />,
                title: 'No login required',
                body: 'Your favorites, play history, and high scores are saved locally in your browser. No account, no email, no tracking.',
              },
            ].map(({ icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5">{icon}</span>
                <span>
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{title} — </strong>
                  {body}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Mission */}
        <section className="rounded-2xl border border-brand-200 bg-brand-50 px-6 py-5 dark:border-brand-900/40 dark:bg-brand-950/30">
          <div className="mb-2 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">
              Our Mission
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-brand-800 dark:text-brand-300">
            To make great browser games accessible to everyone — fast, free, and joyful —
            while giving independent game developers a platform to reach players without
            barriers.
          </p>
        </section>

      </div>

      {/* Responsive ad — bottom of page */}
      {/* AdSense Responsive — insert ad unit here */}
      <AdBanner size="responsive" className="mt-10" />
    </div>
  )
}
