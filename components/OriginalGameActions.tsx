'use client'

import { useState } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'

export default function OriginalGameActions({ slug }: { slug: string }) {
  const { favorites, toggleFavorite } = useUser()
  const [copied, setCopied] = useState(false)
  const favorited = favorites.includes(slug)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* */ }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => toggleFavorite(slug)}
        className={[
          'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
          favorited
            ? 'border-red-600 bg-red-500 text-white hover:bg-red-600'
            : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
        ].join(' ')}
      >
        <Heart className={`h-4 w-4 ${favorited ? 'fill-white stroke-white' : ''}`} />
        {favorited ? 'Saved to Favorites' : 'Add to Favorites'}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <Share2 className="h-4 w-4" />
        {copied ? 'Copied!' : 'Share Game'}
      </button>
    </div>
  )
}
