export type MemoryMode = 'sequence' | 'grid' | 'daily'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface MemoryCard {
  id: string
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export interface SequenceStep {
  emoji: string
  index: number
}

export interface DailyQuestion {
  question: string
  options: string[]
  answer: string
}

export interface DailyImage {
  id: string
  emojis: string[]
  displayTime: number
  questions: DailyQuestion[]
}

export interface MemoryResult {
  mode: MemoryMode
  score: number
  level: number
  time: number
  accuracy: number
  date: string
}
