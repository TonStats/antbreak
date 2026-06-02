import {
  type Cell,
  type Level,
  type ObstacleType,
  EMOJI_THEMES,
  BOMB_EMOJI,
  RAINBOW_EMOJI,
  STONE_EMOJI,
} from '@/types/emojiCrush'
import { BOMB_BONUS, RAINBOW_BONUS } from '@/data/emojiLevels'

export const GRID_SIZE = 8

// ─── Function 1 ───────────────────────────────────────────────────────────────

export function createCell(
  emoji: string,
  row: number,
  col: number,
  obstacle: ObstacleType = 'none',
): Cell {
  return {
    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
    emoji,
    type: 'normal',
    obstacle,
    isMatched: false,
    isFalling: false,
    isNew: false,
  }
}

// ─── Function 2 ───────────────────────────────────────────────────────────────

export function createBoard(level: Level): Cell[][] {
  const theme = EMOJI_THEMES[level.theme]
  const board: Cell[][] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    board[r] = []
    for (let c = 0; c < GRID_SIZE; c++) {
      const idx = r * GRID_SIZE + c
      const isLocked = level.lockedCells.includes(idx)
      const isStone  = level.stoneCells.includes(idx)
      const obstacle: ObstacleType =
        isStone ? 'stone' : isLocked ? 'locked' : 'none'
      const emoji = isStone
        ? '🪨'
        : theme[Math.floor(Math.random() * theme.length)]
      board[r][c] = createCell(emoji, r, c, obstacle)
    }
  }
  return removeInitialMatches(board, theme)
}

// ─── Function 3 ───────────────────────────────────────────────────────────────

export function removeInitialMatches(
  board: Cell[][],
  theme: string[],
): Cell[][] {
  const newBoard = board.map(r => [...r])
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newBoard[r][c].obstacle !== 'none') continue
      while (hasMatchAt(newBoard, r, c)) {
        newBoard[r][c] = createCell(
          theme[Math.floor(Math.random() * theme.length)],
          r,
          c,
        )
      }
    }
  }
  return newBoard
}

// ─── Function 4 ───────────────────────────────────────────────────────────────

function hasMatchAt(board: Cell[][], r: number, c: number): boolean {
  const e = board[r][c].emoji
  if (board[r][c].obstacle === 'stone') return false
  if (c >= 2 &&
    board[r][c - 1]?.emoji === e &&
    board[r][c - 2]?.emoji === e) return true
  if (r >= 2 &&
    board[r - 1]?.[c]?.emoji === e &&
    board[r - 2]?.[c]?.emoji === e) return true
  return false
}

// ─── Function 5 ───────────────────────────────────────────────────────────────

export function isValidSwap(
  r1: number, c1: number,
  r2: number, c2: number,
): boolean {
  const rowDiff = Math.abs(r1 - r2)
  const colDiff = Math.abs(c1 - c2)
  return (rowDiff === 1 && colDiff === 0) ||
         (rowDiff === 0 && colDiff === 1)
}

// ─── Function 6 ───────────────────────────────────────────────────────────────

export function swapCells(
  board: Cell[][],
  r1: number, c1: number,
  r2: number, c2: number,
): Cell[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })))
  const temp = newBoard[r1][c1]
  newBoard[r1][c1] = newBoard[r2][c2]
  newBoard[r2][c2] = temp
  return newBoard
}

// ─── Function 7 ───────────────────────────────────────────────────────────────

export function findMatches(
  board: Cell[][],
): { row: number; col: number }[][] {
  const matches: { row: number; col: number }[][] = []
  const inMatch = new Set<string>()

  // Horizontal matches
  for (let r = 0; r < GRID_SIZE; r++) {
    let c = 0
    while (c < GRID_SIZE - 2) {
      const e = board[r][c].emoji
      if (board[r][c].obstacle === 'stone' || !e) { c++; continue }
      let len = 1
      while (
        c + len < GRID_SIZE &&
        board[r][c + len].emoji === e &&
        board[r][c + len].obstacle !== 'stone'
      ) { len++ }
      if (len >= 3) {
        const match: { row: number; col: number }[] = []
        for (let i = 0; i < len; i++) {
          match.push({ row: r, col: c + i })
          inMatch.add(`${r},${c + i}`)
        }
        matches.push(match)
      }
      c += len
    }
  }

  // Vertical matches
  for (let c = 0; c < GRID_SIZE; c++) {
    let r = 0
    while (r < GRID_SIZE - 2) {
      const e = board[r][c].emoji
      if (board[r][c].obstacle === 'stone' || !e) { r++; continue }
      let len = 1
      while (
        r + len < GRID_SIZE &&
        board[r + len][c].emoji === e &&
        board[r + len][c].obstacle !== 'stone'
      ) { len++ }
      if (len >= 3) {
        const match: { row: number; col: number }[] = []
        for (let i = 0; i < len; i++) {
          const key = `${r + i},${c}`
          if (!inMatch.has(key)) {
            match.push({ row: r + i, col: c })
            inMatch.add(key)
          }
        }
        if (match.length >= 3) matches.push(match)
      }
      r += len
    }
  }

  return matches
}

// ─── Function 8 ───────────────────────────────────────────────────────────────

export function createSpecialCell(
  match: { row: number; col: number }[],
  swapRow: number,
  swapCol: number,
  _theme: string[],
): Cell | null {
  if (match.length === 4) {
    const cell = createCell(BOMB_EMOJI, swapRow, swapCol)
    cell.type = 'bomb'
    return cell
  }
  if (match.length >= 5) {
    const cell = createCell(RAINBOW_EMOJI, swapRow, swapCol)
    cell.type = 'rainbow'
    return cell
  }
  return null
}

// ─── Function 9 ───────────────────────────────────────────────────────────────

export function applyMatches(
  board: Cell[][],
  matches: { row: number; col: number }[][],
  swapPos?: { r: number; c: number },
): {
  board: Cell[][]
  score: number
  collectedEmoji: string[]
} {
  const newBoard  = board.map(r => r.map(c => ({ ...c })))
  let score       = 0
  const collected: string[]    = []
  const toRemove  = new Set<string>()

  for (const match of matches) {
    score += 5 * match.length

    for (const { row, col } of match) {
      const cell = newBoard[row][col]
      if (cell.obstacle === 'locked') {
        cell.obstacle = 'none'
        continue
      }
      if (cell.obstacle === 'stone') continue
      toRemove.add(`${row},${col}`)
      if (cell.emoji !== BOMB_EMOJI && cell.emoji !== RAINBOW_EMOJI) {
        collected.push(cell.emoji)
      }
    }

    if (match.length >= 4 && swapPos) {
      const theme   = Object.values(EMOJI_THEMES).flat()
      const special = createSpecialCell(
        match, swapPos.r, swapPos.c, theme,
      )
      if (special) {
        toRemove.delete(`${swapPos.r},${swapPos.c}`)
        newBoard[swapPos.r][swapPos.c] = special
      }
    }
  }

  toRemove.forEach(key => {
    const [r, c] = key.split(',').map(Number)
    if (
      newBoard[r][c].obstacle !== 'locked' &&
      newBoard[r][c].obstacle !== 'stone'
    ) {
      const empty = createCell('', r, c)
      empty.emoji = ''
      newBoard[r][c] = empty
    }
  })

  return { board: newBoard, score, collectedEmoji: collected }
}

// ─── Function 10 ──────────────────────────────────────────────────────────────

export function applyGravity(board: Cell[][], theme: string[]): Cell[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })))

  for (let c = 0; c < GRID_SIZE; c++) {
    let writeRow = GRID_SIZE - 1
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      const cell = newBoard[r][c]
      if (cell.obstacle === 'stone') {
        writeRow = r - 1
        continue
      }
      if (cell.emoji !== '') {
        if (writeRow !== r) {
          newBoard[writeRow][c] = { ...cell, isFalling: true }
          const empty = createCell('', r, c)
          empty.emoji = ''
          newBoard[r][c] = empty
        }
        writeRow--
      }
    }
    for (let r = writeRow; r >= 0; r--) {
      if (newBoard[r][c].obstacle === 'stone') continue
      const fresh = createCell(
        theme[Math.floor(Math.random() * theme.length)],
        r,
        c,
      )
      fresh.isNew = true
      newBoard[r][c] = fresh
    }
  }
  return newBoard
}

// ─── Function 11 ──────────────────────────────────────────────────────────────

export function hasAvailableMoves(board: Cell[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c].obstacle !== 'none') continue
      if (c < GRID_SIZE - 1 && board[r][c + 1].obstacle === 'none') {
        const swapped = swapCells(board, r, c, r, c + 1)
        if (findMatches(swapped).length > 0) return true
      }
      if (r < GRID_SIZE - 1 && board[r + 1][c].obstacle === 'none') {
        const swapped = swapCells(board, r, c, r + 1, c)
        if (findMatches(swapped).length > 0) return true
      }
    }
  }
  return false
}

// ─── Function 12 — Bomb activation ────────────────────────────────────────────

export function activateBomb(
  board: Cell[][],
  r: number,
  c: number,
): { board: Cell[][]; score: number; collected: string[] } {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  let score = BOMB_BONUS
  const collected: string[] = []

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= GRID_SIZE) continue
      if (nc < 0 || nc >= GRID_SIZE) continue
      const cell = newBoard[nr][nc]
      if (cell.obstacle === 'stone') continue
      if (cell.emoji && cell.emoji !== STONE_EMOJI) {
        collected.push(cell.emoji)
        const empty = createCell('', nr, nc)
        empty.emoji = ''
        newBoard[nr][nc] = empty
      }
    }
  }

  return { board: newBoard, score, collected }
}

// ─── Function 13 — Rainbow activation ────────────────────────────────────────

export function activateRainbow(
  board: Cell[][],
  targetEmoji: string,
): { board: Cell[][]; score: number; collected: string[] } {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  let score = RAINBOW_BONUS
  const collected: string[] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (
        newBoard[r][c].emoji === targetEmoji &&
        newBoard[r][c].obstacle !== 'stone'
      ) {
        collected.push(targetEmoji)
        const empty = createCell('', r, c)
        empty.emoji = ''
        newBoard[r][c] = empty
      }
    }
  }

  return { board: newBoard, score, collected }
}
