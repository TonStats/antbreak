'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Gamepad2, Moon, Sun, Menu, X, Search } from 'lucide-react'
import SearchBar from './SearchBar'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/browse' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-brand-700 dark:text-brand-400"
        >
          <Gamepad2 className="h-6 w-6" />
          <span className="text-xl tracking-tight">Antbreak</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={label}
                href={href}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Search bar — desktop only */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {/* Mobile: search toggle */}
          <button
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen)
              setMenuOpen(false)
            }}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="hidden h-5 w-5 dark:block" />
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => {
              setMenuOpen(!menuOpen)
              setMobileSearchOpen(false)
            }}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800 md:hidden">
          <SearchBar autoFocus />
        </div>
      )}

      {/* Mobile nav menu */}
      {menuOpen && (
        <nav className="border-t border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-800 md:hidden">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href }) => {
              const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className={[
                      'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                    ].join(' ')}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
