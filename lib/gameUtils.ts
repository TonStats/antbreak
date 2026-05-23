import Fuse from 'fuse.js'
import { GAMES } from '@/data/games'
import type { Game } from '@/types/game'

export function getGameBySlug(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug)
}

export function getGamesByCategory(categorySlug: string): Game[] {
  return GAMES.filter((g) => g.category === categorySlug)
}

export function getFeaturedGames(limit = 6): Game[] {
  return GAMES.filter((g) => g.featured)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
}

export function getNewestGames(limit = 6): Game[] {
  return [...GAMES]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, limit)
}

export function getMostPlayed(limit = 6): Game[] {
  return [...GAMES]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
}

export function getRelatedGames(gameId: string, limit = 4): Game[] {
  const game = GAMES.find((g) => g.id === gameId)
  if (!game) return []
  return GAMES.filter((g) => g.id !== gameId && g.category === game.category)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
}


const fuse = new Fuse(GAMES, {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'tags', weight: 2 },
    { name: 'description', weight: 1 },
    { name: 'category', weight: 1 },
  ],
  threshold: 0.4,
  includeScore: false,
})

export function searchGames(query: string, games?: Game[]): Game[] {
  if (!query.trim()) return games ?? GAMES

  const instance =
    games && games !== GAMES
      ? new Fuse(games, {
          keys: [
            { name: 'name', weight: 3 },
            { name: 'tags', weight: 2 },
            { name: 'description', weight: 1 },
            { name: 'category', weight: 1 },
          ],
          threshold: 0.4,
        })
      : fuse

  return instance.search(query).map((r) => r.item)
}
