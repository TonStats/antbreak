'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export interface HistoryEntry {
  slug: string
  playedAt: number
}

interface UserContextValue {
  favorites: string[]
  recentlyPlayed: HistoryEntry[]
  highScores: Record<string, number>
  toggleFavorite: (slug: string) => void
  addToHistory: (slug: string) => void
  saveHighScore: (slug: string, score: number) => void
  getHighScore: (slug: string) => number | null
}

const UserContext = createContext<UserContextValue | null>(null)

const KEYS = {
  favorites:  'antbreak-favorites',
  history:    'antbreak-history',
  highScores: 'antbreak-scores',
} as const

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [favorites,      setFavorites]   = useState<string[]>([])
  const [recentlyPlayed, setHistory]     = useState<HistoryEntry[]>([])
  const [highScores,     setHighScores]  = useState<Record<string, number>>({})
  const [hydrated,       setHydrated]    = useState(false)

  // Load all state from localStorage once on mount
  useEffect(() => {
    setFavorites(load<string[]>(KEYS.favorites, []))
    setHistory(load<HistoryEntry[]>(KEYS.history, []))
    setHighScores(load<Record<string, number>>(KEYS.highScores, {}))
    setHydrated(true)
  }, [])

  // Persist whenever state changes (skip before hydration to avoid overwriting with empty)
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(KEYS.favorites, JSON.stringify(favorites)) } catch {}
  }, [favorites, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(KEYS.history, JSON.stringify(recentlyPlayed)) } catch {}
  }, [recentlyPlayed, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(KEYS.highScores, JSON.stringify(highScores)) } catch {}
  }, [highScores, hydrated])

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }, [])

  const addToHistory = useCallback((slug: string) => {
    setHistory((prev) => {
      const deduped = prev.filter((e) => e.slug !== slug)
      return [{ slug, playedAt: Date.now() }, ...deduped].slice(0, 20)
    })
  }, [])

  const saveHighScore = useCallback((slug: string, score: number) => {
    setHighScores((prev) => {
      if (score <= (prev[slug] ?? 0)) return prev
      return { ...prev, [slug]: score }
    })
  }, [])

  const getHighScore = useCallback(
    (slug: string): number | null => highScores[slug] ?? null,
    [highScores],
  )

  return (
    <UserContext.Provider
      value={{
        favorites,
        recentlyPlayed,
        highScores,
        toggleFavorite,
        addToHistory,
        saveHighScore,
        getHighScore,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}
