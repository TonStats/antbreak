import type {
  PathCell,
  ActivePath,
  PathColor,
  PuzzleLevel,
} from '../types/pathConnector'
import { COLOR_MAP } from '../data/pathPuzzles'

export { COLOR_MAP }

export function createEmptyBoard(size: number): PathCell[][] {
  return Array(size).fill(null).map(
    () => Array(size).fill(null).map(
      () => ({
        color: null,
        isEndpoint: false,
        isDot: false,
      })
    )
  )
}

export function initBoard(level: PuzzleLevel): PathCell[][] {
  const board = createEmptyBoard(level.size)
  for (const dot of level.dots) {
    board[dot.row][dot.col] = {
      color: dot.color,
      isEndpoint: true,
      isDot: true,
    }
  }
  return board
}

export function initPaths(level: PuzzleLevel): ActivePath[] {
  const colors = new Set(level.dots.map(d => d.color))
  return Array.from(colors).map(color => ({
    color,
    cells: [],
    isComplete: false,
  }))
}

export function isAdjacent(
  r1: number, c1: number,
  r2: number, c2: number
): boolean {
  const dr = Math.abs(r1 - r2)
  const dc = Math.abs(c1 - c2)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

export function canAddToPath(
  board: PathCell[][],
  paths: ActivePath[],
  color: PathColor,
  row: number,
  col: number,
  size: number
): boolean {
  if (row < 0 || row >= size) return false
  if (col < 0 || col >= size) return false

  const cell = board[row][col]

  if (!cell.color) return true

  if (cell.isDot && cell.color === color) return true

  return false
}

export function startPath(
  board: PathCell[][],
  paths: ActivePath[],
  level: PuzzleLevel,
  row: number,
  col: number
): {
  board: PathCell[][]
  paths: ActivePath[]
  activeColor: PathColor | null
} {
  const cell = board[row][col]

  if (!cell.isDot || !cell.color) {
    return { board, paths, activeColor: null }
  }

  const color = cell.color
  const newBoard = board.map(r => r.map(c => ({ ...c })))
  const newPaths = paths.map(p => ({ ...p, cells: [...p.cells] }))

  for (let r = 0; r < level.size; r++) {
    for (let c = 0; c < level.size; c++) {
      if (newBoard[r][c].color === color && !newBoard[r][c].isDot) {
        newBoard[r][c] = { color: null, isEndpoint: false, isDot: false }
      }
    }
  }

  const pathIdx = newPaths.findIndex(p => p.color === color)
  newPaths[pathIdx] = { color, cells: [{ row, col }], isComplete: false }

  return { board: newBoard, paths: newPaths, activeColor: color }
}

export function extendPath(
  board: PathCell[][],
  paths: ActivePath[],
  activeColor: PathColor,
  row: number,
  col: number,
  level: PuzzleLevel
): {
  board: PathCell[][]
  paths: ActivePath[]
  activeColor: PathColor | null
  pathComplete: boolean
} {
  const pathIdx = paths.findIndex(p => p.color === activeColor)
  if (pathIdx === -1) return { board, paths, activeColor, pathComplete: false }

  const path = paths[pathIdx]
  const lastCell = path.cells[path.cells.length - 1]

  if (!isAdjacent(lastCell.row, lastCell.col, row, col)) {
    return { board, paths, activeColor, pathComplete: false }
  }

  if (path.cells.length >= 2) {
    const prev = path.cells[path.cells.length - 2]
    if (prev.row === row && prev.col === col) {
      const newBoard = board.map(r => r.map(c => ({ ...c })))
      const removedCell = path.cells[path.cells.length - 1]
      if (!newBoard[removedCell.row][removedCell.col].isDot) {
        newBoard[removedCell.row][removedCell.col] = {
          color: null,
          isEndpoint: false,
          isDot: false,
        }
      }
      const newPaths = paths.map(p => ({ ...p, cells: [...p.cells] }))
      newPaths[pathIdx] = {
        ...path,
        cells: path.cells.slice(0, -1),
        isComplete: false,
      }
      return { board: newBoard, paths: newPaths, activeColor, pathComplete: false }
    }
  }

  if (!canAddToPath(board, paths, activeColor, row, col, level.size)) {
    return { board, paths, activeColor, pathComplete: false }
  }

  const newBoard = board.map(r => r.map(c => ({ ...c })))
  const newPaths = paths.map(p => ({ ...p, cells: [...p.cells] }))

  const targetDot = level.dots.find(
    d => d.row === row && d.col === col && d.color === activeColor
  )
  const pathComplete = !!targetDot && path.cells.length > 1

  if (!newBoard[row][col].isDot) {
    newBoard[row][col] = { color: activeColor, isEndpoint: false, isDot: false }
  }

  newPaths[pathIdx] = {
    ...path,
    cells: [...path.cells, { row, col }],
    isComplete: pathComplete,
  }

  return {
    board: newBoard,
    paths: newPaths,
    activeColor: pathComplete ? null : activeColor,
    pathComplete,
  }
}

export function checkPuzzleComplete(
  board: PathCell[][],
  paths: ActivePath[],
  size: number
): boolean {
  const allComplete = paths.every(p => p.isComplete)
  if (!allComplete) return false

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r][c].color) return false
    }
  }
  return true
}

export function resetPuzzle(level: PuzzleLevel): {
  board: PathCell[][]
  paths: ActivePath[]
} {
  return {
    board: initBoard(level),
    paths: initPaths(level),
  }
}
