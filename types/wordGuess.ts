export type WordGuessMode =
  'classic' | 'speed'

export type LetterState =
  'correct' | 'wrong-position' |
  'incorrect' | 'empty' | 'active'

export interface GuessLetter {
  letter: string
  state: LetterState
}

export interface GuessRow {
  letters: GuessLetter[]
  isComplete: boolean
}

export interface KeyboardKey {
  key: string
  state: LetterState | 'unused'
}

export interface WordGuessResult {
  word: string
  guesses: number
  won: boolean
  timeSeconds?: number
  score?: number
}
