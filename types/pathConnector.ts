export type GridSize = 5 | 6 | 7 | 8 | 9 | 10

export type PathColor =
  'red' | 'blue' | 'green' | 'yellow' |
  'orange' | 'purple' | 'pink' | 'cyan' |
  'white' | 'maroon'

export interface Dot {
  row: number
  col: number
  color: PathColor
}

export interface PuzzleLevel {
  id: number
  size: GridSize
  dots: Dot[]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  group: number
}

export interface PathCell {
  color: PathColor | null
  isEndpoint: boolean
  isDot: boolean
}

export interface ActivePath {
  color: PathColor
  cells: { row: number; col: number }[]
  isComplete: boolean
}

export interface PathConnectorState {
  board: PathCell[][]
  paths: ActivePath[]
  isComplete: boolean
  moveCount: number
}
