export type PuzzleType =
  'sequence' | 'pattern' | 'logic' |
  'oddoneout' | 'rebus' | 'spatial' |
  'emojidecoder'

export type PuzzleMode = 'classic' | 'speedrun'

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard'

export interface SequencePuzzle {
  type: 'sequence'
  id: string
  sequence: (number | string)[]
  missingIndex: number
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export interface PatternPuzzle {
  type: 'pattern'
  id: string
  grid: string[][]
  options: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export interface LogicPuzzle {
  type: 'logic'
  id: string
  question: string
  clues: string[]
  options: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export interface OddOneOutPuzzle {
  type: 'oddoneout'
  id: string
  items: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export interface RebusPuzzle {
  type: 'rebus'
  id: string
  parts: Array<{
    content: string
    type: 'emoji' | 'text' | 'symbol'
  }>
  options: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export interface SpatialPuzzle {
  type: 'spatial'
  id: string
  question: string
  options: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
  shapeDescription: string
}

export interface EmojiDecoderPuzzle {
  type: 'emojidecoder'
  id: string
  emojis: string[]
  category: string
  options: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export type AnyPuzzle =
  | SequencePuzzle
  | PatternPuzzle
  | LogicPuzzle
  | OddOneOutPuzzle
  | RebusPuzzle
  | SpatialPuzzle
  | EmojiDecoderPuzzle

export interface PuzzleResult {
  puzzleId: string
  correct: boolean
  timeSeconds: number
  hintUsed: boolean
  pointsEarned: number
}
