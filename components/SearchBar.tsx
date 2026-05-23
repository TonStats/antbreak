'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { GAMES } from '@/data/games'

const fuse = new Fuse(GAMES, {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'tags', weight: 2 },
    { name: 'category', weight: 1 },
  ],
  threshold: 0.4,
})

interface SearchBarProps {
  autoFocus?: boolean
}

export default function SearchBar({ autoFocus }: SearchBarProps) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState<typeof GAMES>([])
  const [open, setOpen]     = useState(false)
  const inputRef            = useRef<HTMLInputElement>(null)
  const containerRef        = useRef<HTMLDivElement>(null)
  const router              = useRouter()

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (value.trim()) {
      setResults(fuse.search(value).map((r) => r.item).slice(0, 5))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  function clear() {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => query && setOpen(true)}
            placeholder="Search games..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-8 text-sm outline-none placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && results.length > 0 && (
        <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {results.map((game) => (
            <li key={game.id}>
              <Link
                href={`/games/${game.slug}`}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{game.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{game.category}</span>
              </Link>
            </li>
          ))}
          <li className="border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.push(`/search?q=${encodeURIComponent(query)}`)
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-zinc-50 dark:text-brand-400 dark:hover:bg-zinc-800"
            >
              <Search className="h-3.5 w-3.5" />
              Search all results for &ldquo;{query}&rdquo;
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
