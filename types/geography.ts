export interface Country {
  name: string
  capital: string
  continent: string
  region: string
  population: number
  flagEmoji: string
  code: string
  funFact: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export type GameMode = 'flags' | 'map' | 'capitals' | 'population' | 'daily'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuizQuestion {
  country: Country
  options?: Country[]
  correctAnswer: string
  questionText: string
  mode: GameMode
}
