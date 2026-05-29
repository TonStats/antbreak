export type RiddleMode = 'classic' | 'speed' | 'daily'

export type RiddleCategory = 'wordplay' | 'logic' | 'math' | 'nature' | 'whatami'

export type RiddleDifficulty = 'easy' | 'medium' | 'hard'

export interface Riddle {
  id:               string
  question:         string
  answer:           string
  alternateAnswers: string[]
  explanation:      string
  category:         RiddleCategory
  difficulty:       RiddleDifficulty
  hint:             string
}

export interface RiddleResult {
  riddleId:     string
  correct:      boolean
  attempts:     number
  timeSeconds:  number
  pointsEarned: number
}
