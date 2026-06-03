export type PuzzleType =
  'sequence' | 'deduction' | 'emojipuzzle' | 'spatial'

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

export interface LogicPuzzle {
  type: 'deduction'
  subtype: 'logic'
  id: string
  question: string
  clues: string[]
  options: string[]
  answer: string
  explanation: string
  difficulty: PuzzleDifficulty
}

export interface OddOneOutPuzzle {
  type: 'deduction'
  subtype: 'oddoneout'
  id: string
  items: string[]
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

export interface EmojiPuzzlePuzzle {
  type: 'emojipuzzle'
  id: string
  parts: Array<{
    content: string
    type: 'emoji' | 'text' | 'symbol'
  }>
  answer: string
  alternateAnswers: string[]
  explanation: string
  hint1Options: string[]
  hint2Options: string[]
  difficulty: PuzzleDifficulty
  style: 'rebus' | 'symbolic'
}

export type AnyPuzzle =
  | SequencePuzzle
  | LogicPuzzle
  | OddOneOutPuzzle
  | SpatialPuzzle
  | EmojiPuzzlePuzzle

export interface PuzzleResult {
  puzzleId: string
  correct: boolean
  timeSeconds: number
  hintUsed: boolean
  pointsEarned: number
}
