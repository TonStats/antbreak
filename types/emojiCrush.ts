export type EmojiTheme =
  'animals' | 'food' | 'space' | 'nature'

export type CellType =
  'normal' | 'bomb' | 'rainbow' | 'empty'

export type ObstacleType =
  'none' | 'locked' | 'stone'

export interface Cell {
  id: string
  emoji: string
  type: CellType
  obstacle: ObstacleType
  isMatched: boolean
  isFalling: boolean
  isNew: boolean
}

export interface LevelTarget {
  emoji: string
  count: number
  collected: number
}

export interface Level {
  id: number
  theme: EmojiTheme
  moves: number
  targets: LevelTarget[]
  lockedCells: number[]
  stoneCells: number[]
  description: string
  starThresholds: [number, number, number]
}

export const EMOJI_THEMES = {
  animals: ['🐶', '🐱', '🐸', '🦊', '🐼', '🦋'],
  food:    ['🍎', '🍕', '🍦', '🍩', '🎂', '🍓'],
  space:   ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐'],
  nature:  ['🌸', '🌻', '🍁', '🌵', '🌊', '🔥'],
}

export const BOMB_EMOJI    = '💣'
export const RAINBOW_EMOJI = '🌈'
export const LOCKED_EMOJI  = '🔒'
export const STONE_EMOJI   = '🪨'
