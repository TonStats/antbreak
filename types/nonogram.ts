export type CellState = 'empty' | 'filled' | 'marked'
// empty = untouched, filled = player filled black, marked = player marked X (definitely empty)

export type GridSize = 5 | 10 | 15 | 20

export interface NonogramPuzzle {
  id: number
  title: string
  size: GridSize
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  solution: number[][]
  // 1 = filled, 0 = empty
  // solution[row][col]
  category: 'animal' | 'object' | 'symbol' | 'food' | 'nature' | 'face'
  thumbnail?: string
}

export interface NonogramClues {
  rowClues: number[][]
  colClues: number[][]
}

export interface NonogramProgress {
  puzzleId: number
  grid: CellState[][]
  completed: boolean
  timeSeconds: number
  mistakes: number
}

export interface SavedProgress {
  completedPuzzles: number[]
  highestUnlocked: number
  puzzleProgress: Record<number, {
    grid: CellState[][]
    timeSeconds: number
  }>
}
