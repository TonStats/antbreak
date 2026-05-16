import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'

const SITE_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Games',       href: '/games' },
  { label: 'Favorites',   href: '/favorites' },
  { label: 'Blog',        href: '/blog' },
]

const LEGAL_LINKS = [
  { label: 'About',   href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms',   href: '/terms' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Logo + tagline */}
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 font-bold text-brand-700 dark:text-brand-400"
            >
              <Gamepad2 className="h-5 w-5" />
              <span className="text-lg">Antbreak</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Free browser games, instantly. No downloads, no logins — just play.
            </p>
          </div>

          {/* Site links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Site
            </h3>
            <ul className="space-y-2.5">
              {SITE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-600 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Company
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-600 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community tagline */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Community
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Built with ❤️ for players everywhere
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              New games added weekly. Challenges refreshed daily.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
            © {new Date().getFullYear()} Antbreak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
