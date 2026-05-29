export type BibleMode       = 'quickfire' | 'verse' | 'timeline' | 'daily'
export type BibleDifficulty = 'easy' | 'medium' | 'hard'
export type Testament       = 'old' | 'new' | 'both'

export interface BibleQuestion {
  id:            string
  question:      string
  options:       string[]
  correctAnswer: string
  explanation:   string
  book:          string
  testament:     Testament
  difficulty:    BibleDifficulty
  category:      'people' | 'places' | 'events' | 'verses' | 'numbers'
}

export interface VerseQuestion {
  id:           string
  reference:    string
  verseBefore:  string
  missingWords: string[]
  options:      string[]
  correctAnswer: string
  fullVerse:    string
  explanation:  string
  difficulty:   BibleDifficulty
}

export interface TimelineEvent {
  id:          string
  event:       string
  description: string
  order:       number
  period:      string
  reference:   string
}

export interface TimelineQuestion {
  id:         string
  events:     TimelineEvent[]
  difficulty: BibleDifficulty
}

export interface DailyChallenge {
  theme:       string
  description: string
  questions:   BibleQuestion[]
}
