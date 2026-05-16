'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-3 flex w-full max-w-xl items-center gap-2 px-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games…"
          aria-label="Search games"
          className="w-full rounded-full border border-white/20 bg-white/10 py-2 pl-12 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm transition focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-700 shadow-md transition-transform hover:scale-105 active:scale-100"
      >
        Search
      </button>
    </form>
  )
}
