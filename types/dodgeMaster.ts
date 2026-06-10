export type DodgeMode =
  'classic' | 'lane' | 'boss'

export type Direction =
  'top' | 'bottom' | 'left' | 'right'

export interface Obstacle {
  id: string
  x: number
  y: number
  width: number
  height: number
  speedX: number
  speedY: number
  color: string
  shape: 'circle' | 'square' | 'diamond'
}

export interface Player {
  x: number
  y: number
  size: number
  invincible: boolean
  invincibleTimer: number
}

export interface BossPattern {
  id: number
  name: string
  description: string
  duration: number
  color: string
}

export const BOSS_PATTERNS: BossPattern[] = [
  {
    id: 1,
    name: 'The Scatter',
    description: 'Random burst fire',
    duration: 30,
    color: '#ef4444',
  },
  {
    id: 2,
    name: 'The Wall',
    description: 'Walls with one gap',
    duration: 30,
    color: '#f97316',
  },
  {
    id: 3,
    name: 'The Spiral',
    description: 'Rotating spiral shots',
    duration: 30,
    color: '#a855f7',
  },
  {
    id: 4,
    name: 'The Hunter',
    description: 'Aimed directly at you',
    duration: 30,
    color: '#3b82f6',
  },
  {
    id: 5,
    name: 'The Chaos',
    description: 'All patterns combined',
    duration: 30,
    color: '#ec4899',
  },
]

export interface GameState {
  mode: DodgeMode
  stage: 'setup' | 'countdown' | 'playing' | 'dead' | 'results'
  score: number
  timeAlive: number
  lives: number
  currentBoss: number
  bossesDefeated: number
}
