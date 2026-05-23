export type Grid = number[][]
export type Difficulty = 'easy' | 'medium' | 'hard'

const CLUE_COUNTS: Record<Difficulty, number> = { easy: 36, medium: 28, hard: 22 }

// ── Seeded RNG (mulberry32) ────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false
    if (grid[i][col] === num) return false
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c] === num) return false
  return true
}

export function validateBoard(grid: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] !== solution[r][c]) return false
  return true
}

// ── Solution generator ────────────────────────────────────────────────────────

function generateSolutionWithRng(rng: () => number): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0))

  function solve(pos: number): boolean {
    if (pos === 81) return true
    const row = Math.floor(pos / 9)
    const col = pos % 9
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = 8; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]]
    }
    for (const num of digits) {
      if (isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num
        if (solve(pos + 1)) return true
        grid[row][col] = 0
      }
    }
    return false
  }

  solve(0)
  return grid
}

export function generateSolution(): Grid {
  const rng = mulberry32((Math.random() * 2147483646 + 1) | 0)
  return generateSolutionWithRng(rng)
}

// ── Uniqueness check (stops after 2 solutions) ────────────────────────────────

function countSolutions(puzzle: Grid, limit = 2): number {
  const g = puzzle.map(r => [...r])
  let count = 0

  function solve(pos: number): void {
    if (count >= limit) return
    if (pos === 81) { count++; return }
    const row = Math.floor(pos / 9)
    const col = pos % 9
    if (g[row][col] !== 0) { solve(pos + 1); return }
    for (let num = 1; num <= 9 && count < limit; num++) {
      if (isValidPlacement(g, row, col, num)) {
        g[row][col] = num
        solve(pos + 1)
        g[row][col] = 0
      }
    }
  }

  solve(0)
  return count
}

// ── Puzzle generator ──────────────────────────────────────────────────────────

function digCells(solution: Grid, rng: () => number, targetClues: number): Grid {
  const puzzle = solution.map(r => [...r])
  const toRemove = 81 - targetClues

  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      positions.push([r, c])

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]]
  }

  let removed = 0
  for (const [r, c] of positions) {
    if (removed >= toRemove) break
    const val = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(puzzle) === 1) {
      removed++
    } else {
      puzzle[r][c] = val
    }
  }

  return puzzle
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const rng = mulberry32((Math.random() * 2147483646 + 1) | 0)
  const solution = generateSolutionWithRng(rng)
  const puzzle = digCells(solution, rng, CLUE_COUNTS[difficulty])
  return { puzzle, solution }
}

export function getDailyPuzzle(): { puzzle: Grid; solution: Grid } {
  const d = new Date()
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  const rng = mulberry32(seed)
  const solution = generateSolutionWithRng(rng)
  const puzzle = digCells(solution, rng, CLUE_COUNTS['medium'])
  return { puzzle, solution }
}
