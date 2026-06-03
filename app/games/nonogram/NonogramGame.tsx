'use client'

import { useState, useEffect, useRef } from 'react'
import { Grid2x2, Maximize2, Minimize2, X, Pause, Play } from 'lucide-react'
import type { NonogramPuzzle, NonogramClues, CellState } from '@/types/nonogram'
import {
  ALL_NONOGRAM_PUZZLES,
  getPuzzle,
  computeClues,
  checkSolution,
  getRowCompletion,
} from '@/data/nonogramPuzzles'

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage      = 'setup' | 'playing'
type Difficulty = 'easy' | 'medium' | 'hard'

// ─── Constants ────────────────────────────────────────────────────────────────

const SERIF       = { fontFamily: 'Georgia, serif' }
const STORAGE_KEY = 'nonogram_progress'

const DIFFICULTIES: { id: Difficulty; label: string; sub: string; preview: number[][] }[] = [
  { id: 'easy',   label: 'Beginner', sub: '5 × 5',   preview: [[0,1,0],[1,1,1],[0,1,0]] },
  { id: 'medium', label: 'Standard', sub: '10 × 10', preview: [[0,1,1],[1,1,1],[1,1,0]] },
  { id: 'hard',   label: 'Advanced', sub: '15 × 15', preview: [[1,1,1],[1,0,1],[1,1,1]] },
]

// Green-tinted confetti for the paper theme
const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => ({
  left:  (i * 37 + 11) % 100,
  delay: (i * 0.13) % 1.8,
  dur:   1.6 + (i * 0.07) % 1.4,
  color: ['#86efac','#4ade80','#a7f3d0','#6ee7b7','#34d399','#10b981'][i % 6],
  w:     4 + (i % 3) * 2,
  h:     6 + (i % 4) * 2,
}))

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function emptyGrid(size: number): CellState[][] {
  return Array.from({ length: size }, () => Array<CellState>(size).fill('empty'))
}

function starsFor(mistakes: number): number {
  if (mistakes === 0) return 3
  if (mistakes <= 3)  return 2
  return 1
}

// ─── localStorage ─────────────────────────────────────────────────────────────

interface StoredData {
  completedPuzzles: number[]
  highestUnlocked:  number
  puzzleProgress:   Record<number, { grid: CellState[][]; timeSeconds: number }>
}

function loadStore(): StoredData {
  if (typeof window === 'undefined') return { completedPuzzles: [], highestUnlocked: 1, puzzleProgress: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completedPuzzles: [], highestUnlocked: 1, puzzleProgress: {} }
    const d = JSON.parse(raw) as Partial<StoredData>
    return {
      completedPuzzles: d.completedPuzzles ?? [],
      highestUnlocked:  d.highestUnlocked  ?? 1,
      puzzleProgress:   d.puzzleProgress   ?? {},
    }
  } catch {
    return { completedPuzzles: [], highestUnlocked: 1, puzzleProgress: {} }
  }
}

function saveStore(data: StoredData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniGrid({ filled }: { filled: number[][] }) {
  return (
    <div
      className="grid gap-0.5 mb-2"
      style={{ gridTemplateColumns: `repeat(${filled[0].length}, 1fr)`, width: 36, height: 36 }}
    >
      {filled.flat().map((v, i) => (
        <div key={i} className={`rounded-sm ${v ? 'bg-stone-700 dark:bg-stone-200' : 'bg-stone-100 dark:bg-stone-700'}`} />
      ))}
    </div>
  )
}

function PixelArt({ solution }: { solution: number[][] }) {
  const n      = solution.length
  const cellPx = Math.max(1, Math.floor(120 / n))
  const size   = cellPx * n
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cellPx}px)`, width: size, height: size, gap: 0, lineHeight: 0 }}
      className="shadow-lg"
    >
      {solution.flat().map((v, i) => (
        <div key={i} style={{ width: cellPx, height: cellPx }} className={v ? 'bg-stone-800 dark:bg-stone-100' : ''} />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NonogramGame() {

  // ── UI ──────────────────────────────────────────────────────────────────────
  const cardRef    = useRef<HTMLDivElement>(null)
  const [stage,        setStage]        = useState<Stage>('setup')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHowTo,    setShowHowTo]    = useState(false)

  // ── Setup ────────────────────────────────────────────────────────────────────
  const [difficulty,       setDifficulty]       = useState<Difficulty | null>(null)
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<number | null>(null)
  const [completedIds,     setCompletedIds]     = useState<number[]>([])

  // ── Game ─────────────────────────────────────────────────────────────────────
  const [puzzle,        setPuzzle]        = useState<NonogramPuzzle | null>(null)
  const [clues,         setClues]         = useState<NonogramClues | null>(null)
  const [grid,          setGrid]          = useState<CellState[][]>([])
  const [elapsedTime,   setElapsedTime]   = useState(0)
  const [isPaused,      setIsPaused]      = useState(false)
  const [mistakes,      setMistakes]      = useState(0)
  const [isComplete,    setIsComplete]    = useState(false)
  const [showConfetti,  setShowConfetti]  = useState(false)
  const [completedRows, setCompletedRows] = useState<Set<number>>(new Set())
  const [completedCols, setCompletedCols] = useState<Set<number>>(new Set())
  const [flashCell,     setFlashCell]     = useState<string | null>(null)

  // ── Board sizing ─────────────────────────────────────────────────────────────
  const boardRef   = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(40)

  // ── Refs for event handlers (avoid stale closures) ───────────────────────────
  const gridRef          = useRef<CellState[][]>([])
  const elapsedRef       = useRef(0)
  const puzzleRef        = useRef<NonogramPuzzle | null>(null)
  const mistakesRef      = useRef(0)
  const isCompleteRef    = useRef(false)
  const isDraggingRef    = useRef(false)
  const dragActionRef    = useRef<CellState>('filled')

  useEffect(() => { gridRef.current       = grid        }, [grid])
  useEffect(() => { elapsedRef.current    = elapsedTime }, [elapsedTime])
  useEffect(() => { puzzleRef.current     = puzzle       }, [puzzle])
  useEffect(() => { mistakesRef.current   = mistakes     }, [mistakes])
  useEffect(() => { isCompleteRef.current = isComplete   }, [isComplete])

  // ── Load completions ─────────────────────────────────────────────────────────
  useEffect(() => {
    setCompletedIds(loadStore().completedPuzzles)
  }, [])

  // ── Fullscreen sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // ── ESC exits fullscreen ──────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  // ── Timer ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'playing' || isComplete || isPaused) return
    const id = setInterval(() => setElapsedTime(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [stage, isComplete, isPaused])

  // ── Save on unmount ───────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (puzzleRef.current && !isCompleteRef.current) saveInProgress()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-save every 30 s ──────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'playing' || !puzzle) return
    const id = setInterval(() => saveInProgress(), 30_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, puzzle])

  // ── Save on pause ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPaused && puzzle) saveInProgress()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused])

  // ── Confetti auto-hide ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showConfetti) return
    const t = setTimeout(() => setShowConfetti(false), 4_000)
    return () => clearTimeout(t)
  }, [showConfetti])

  // ── ResizeObserver ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!boardRef.current || !puzzle || stage !== 'playing') return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      const clueSpace = puzzle.size <= 5 ? 44 : puzzle.size <= 10 ? 64 : 88
      const availW    = width  - clueSpace
      const availH    = height - clueSpace - 40
      const maxCell   = puzzle.size <= 5 ? 72 : puzzle.size <= 10 ? 48 : 32
      const size = Math.min(
        Math.floor(availW / puzzle.size),
        Math.floor(availH / puzzle.size),
        maxCell,
      )
      setCellSize(Math.max(size, 16))
    })
    observer.observe(boardRef.current)
    return () => observer.disconnect()
  }, [puzzle, stage])

  // ── Game logic ────────────────────────────────────────────────────────────────

  function saveInProgress() {
    const p = puzzleRef.current
    if (!p) return
    const data = loadStore()
    data.puzzleProgress[p.id] = { grid: gridRef.current, timeSeconds: elapsedRef.current }
    saveStore(data)
  }

  function persistComplete(puzzleId: number) {
    const data = loadStore()
    if (!data.completedPuzzles.includes(puzzleId)) data.completedPuzzles.push(puzzleId)
    data.highestUnlocked = Math.max(data.highestUnlocked ?? 1, puzzleId + 1)
    delete data.puzzleProgress[puzzleId]
    saveStore(data)
    setCompletedIds([...data.completedPuzzles])
  }

  function updateCompletedLines(g: CellState[][], p: NonogramPuzzle) {
    const rows = new Set<number>()
    const cols = new Set<number>()
    for (let r = 0; r < p.size; r++) {
      if (getRowCompletion(g, p.solution, r)) rows.add(r)
    }
    for (let c = 0; c < p.size; c++) {
      let ok = true
      for (let r = 0; r < p.size; r++) {
        if ((g[r][c] === 'filled') !== (p.solution[r][c] === 1)) { ok = false; break }
      }
      if (ok) cols.add(c)
    }
    setCompletedRows(rows)
    setCompletedCols(cols)
  }

  function applyCell(r: number, c: number, action: CellState) {
    const p = puzzleRef.current
    if (!p || isCompleteRef.current) return
    const current = gridRef.current[r]?.[c]
    if (current === action) return

    const newGrid = gridRef.current.map(row => [...row])
    newGrid[r][c] = action
    gridRef.current = newGrid
    setGrid(newGrid)

    if (action === 'filled' && p.solution[r][c] === 0) {
      setMistakes(m => m + 1)
      mistakesRef.current += 1
      const key = `${r},${c}`
      setFlashCell(key)
      setTimeout(() => setFlashCell(prev => prev === key ? null : prev), 600)
    }

    updateCompletedLines(newGrid, p)

    if (checkSolution(newGrid, p.solution)) {
      isCompleteRef.current = true
      setIsComplete(true)
      if (mistakesRef.current === 0) setShowConfetti(true)
      persistComplete(p.id)
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await cardRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }

  function startGame(puzzleId: number) {
    const p = getPuzzle(puzzleId)
    if (!p) return
    const store       = loadStore()
    const saved       = store.puzzleProgress[puzzleId]
    const initialGrid = saved?.grid ?? emptyGrid(p.size)
    const initialTime = saved?.timeSeconds ?? 0

    gridRef.current       = initialGrid
    elapsedRef.current    = initialTime
    puzzleRef.current     = p
    mistakesRef.current   = 0
    isCompleteRef.current = false

    setPuzzle(p)
    setClues(computeClues(p.solution))
    setGrid(initialGrid)
    setElapsedTime(initialTime)
    setMistakes(0)
    setIsComplete(false)
    setShowConfetti(false)
    setIsPaused(false)
    setCompletedRows(new Set())
    setCompletedCols(new Set())
    setFlashCell(null)
    setStage('playing')
  }

  function handleQuit() {
    saveInProgress()
    setStage('setup')
    setPuzzle(null)
    setClues(null)
    setGrid([])
    gridRef.current = []
    setIsComplete(false)
    setIsPaused(false)
    setShowConfetti(false)
  }

  function handleCellClick(r: number, c: number, e: React.MouseEvent) {
    e.preventDefault()
    if (isPaused || isCompleteRef.current) return
    const current = gridRef.current[r]?.[c] ?? 'empty'
    applyCell(r, c, current === 'filled' ? 'empty' : 'filled')
  }

  function handleRightClick(r: number, c: number, e: React.MouseEvent) {
    e.preventDefault()
    if (isPaused || isCompleteRef.current) return
    const current = gridRef.current[r]?.[c] ?? 'empty'
    applyCell(r, c, current === 'marked' ? 'empty' : 'marked')
  }

  function handleMouseDown(r: number, c: number, e: React.MouseEvent) {
    if (e.button !== 0 || isPaused || isCompleteRef.current) return
    e.preventDefault()
    const current = gridRef.current[r]?.[c] ?? 'empty'
    const action: CellState = current === 'filled' ? 'empty' : 'filled'
    dragActionRef.current = action
    isDraggingRef.current = true
    applyCell(r, c, action)
  }

  function handleMouseEnter(r: number, c: number) {
    if (!isDraggingRef.current || isPaused || isCompleteRef.current) return
    applyCell(r, c, dragActionRef.current)
  }

  function handleMouseUp() { isDraggingRef.current = false }

  function handleTouchStart(e: React.TouchEvent) {
    if (isPaused || isCompleteRef.current) return
    const touch = e.touches[0]
    const el    = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
    const data  = el?.dataset?.cell
    if (!data) return
    const [r, c] = data.split(',').map(Number)
    if (isNaN(r) || isNaN(c)) return
    const current = gridRef.current[r]?.[c] ?? 'empty'
    const action: CellState = current === 'filled' ? 'empty' : 'filled'
    dragActionRef.current = action
    isDraggingRef.current = true
    applyCell(r, c, action)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDraggingRef.current || isPaused || isCompleteRef.current) return
    const touch = e.touches[0]
    const el    = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
    const data  = el?.dataset?.cell
    if (!data) return
    const [r, c] = data.split(',').map(Number)
    if (isNaN(r) || isNaN(c)) return
    applyCell(r, c, dragActionRef.current)
  }

  function handleTouchEnd() { isDraggingRef.current = false }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const difficultyPuzzles     = difficulty ? ALL_NONOGRAM_PUZZLES.filter(p => p.difficulty === difficulty) : []
  const completedInDifficulty = difficultyPuzzles.filter(p => completedIds.includes(p.id)).length
  const nextPuzzle            = puzzle
    ? ALL_NONOGRAM_PUZZLES.find(p => p.difficulty === puzzle.difficulty && p.id === puzzle.id + 1)
    : null
  const stars = starsFor(mistakes)

  // Clue sizing
  const clueNumSz  = Math.max(Math.round(cellSize * 0.82), 14)
  const maxRowLen  = clues ? Math.max(...clues.rowClues.map(r => r.length), 1) : 1
  const maxColLen  = clues ? Math.max(...clues.colClues.map(c => c.length), 1) : 1
  const rowClueW   = maxRowLen * clueNumSz + 6
  const colClueH   = maxColLen * clueNumSz + 4
  const clueFontCls = cellSize >= 40 ? 'text-sm' : cellSize >= 26 ? 'text-xs' : 'text-[10px]'

  // ── Cell styling ──────────────────────────────────────────────────────────────

  function cellCls(cell: CellState, r: number, c: number): string {
    const isFlash = flashCell === `${r},${c}`
    if (isFlash)          return 'bg-rose-200 dark:bg-rose-900 cursor-pointer'
    if (cell === 'filled') return 'bg-stone-800 dark:bg-stone-100'
    if (cell === 'marked') return 'bg-stone-100 dark:bg-stone-900 cursor-pointer'
    return 'bg-white dark:bg-stone-800 hover:bg-green-50 dark:hover:bg-stone-700 cursor-pointer'
  }

  function cellBorder(r: number, c: number, size: number): React.CSSProperties {
    return {
      borderTopWidth:    1,
      borderLeftWidth:   1,
      borderRightWidth:  (c + 1) % 5 === 0 && c < size - 1 ? 2 : 1,
      borderBottomWidth: (r + 1) % 5 === 0 && r < size - 1 ? 2 : 1,
      borderStyle: 'solid',
      borderColor: 'rgb(214 211 209)',
    }
  }

  // ── Shared button style ───────────────────────────────────────────────────────

  const iconBtnCls = 'rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400 transition-colors p-1.5 w-8 h-8 flex items-center justify-center shrink-0'

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className={[
        'h-full flex flex-col rounded-2xl nonogram-card bg-stone-50 dark:bg-stone-900 relative overflow-hidden',
        isFullscreen ? '' : 'border-2 border-stone-200 dark:border-stone-700',
      ].join(' ')}
      style={{ boxShadow: '0 0 0 1px rgba(134,239,172,0.4), 0 25px 50px rgba(0,0,0,0.1)' }}
    >

      {/* ── Confetti ─────────────────────────────────────────────────────────── */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {CONFETTI_PIECES.map((p, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left:              `${p.left}%`,
                width:             `${p.w}px`,
                height:            `${p.h}px`,
                backgroundColor:   p.color,
                animationDuration: `${p.dur}s`,
                animationDelay:    `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 shrink-0">
        <Grid2x2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
        <h1
          className="text-stone-800 dark:text-stone-100 font-bold leading-none truncate flex-1"
          style={{ ...SERIF, fontSize: puzzle && stage !== 'setup' ? '1.05rem' : '1.4rem' }}
        >
          {puzzle && stage !== 'setup' ? `#${puzzle.id} — ${puzzle.title}` : 'Nonogram'}
        </h1>

        {stage === 'playing' && (
          <span className="text-stone-600 dark:text-stone-300 font-mono text-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 shrink-0">
            {formatTime(elapsedTime)}
          </span>
        )}

        {stage === 'playing' && !isComplete && (
          <button
            type="button"
            onClick={() => setIsPaused(v => !v)}
            className={`${iconBtnCls} hover:text-stone-700 dark:hover:text-stone-200`}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        )}

        {stage === 'playing' && (
          <button
            type="button"
            onClick={handleQuit}
            className={`${iconBtnCls} hover:text-rose-500 hover:border-rose-300 dark:hover:text-rose-400`}
            aria-label="Quit"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className={`${iconBtnCls} hover:text-green-600 hover:border-green-300 dark:hover:text-green-400`}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      <hr className="border-stone-200 dark:border-stone-700 mx-5 shrink-0" />

      {/* ══ SETUP ════════════════════════════════════════════════════════════ */}
      {stage === 'setup' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col justify-center">

          <p className="text-stone-400 dark:text-stone-500 text-xs uppercase tracking-[0.4em] text-center mb-5" style={SERIF}>
            Nonogram Puzzles
          </p>

          <p className="text-stone-600 dark:text-stone-400 text-xs uppercase tracking-widest font-semibold text-center mb-3">
            Choose Difficulty
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {DIFFICULTIES.map(d => {
              const sel = difficulty === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setDifficulty(d.id); setSelectedPuzzleId(null) }}
                  className={[
                    'flex flex-col items-center rounded-2xl p-4 cursor-pointer transition-all duration-150 border',
                    sel
                      ? 'bg-green-50 dark:bg-green-950/50 border-2 border-green-400 dark:border-green-500 shadow-md shadow-green-100 dark:shadow-none'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm hover:border-green-300 hover:bg-green-50/50 dark:hover:border-green-700',
                  ].join(' ')}
                >
                  <MiniGrid filled={d.preview} />
                  <span className="font-bold text-sm text-stone-700 dark:text-stone-200 leading-tight">{d.label}</span>
                  <span className="text-xs text-stone-500 mt-0.5">{d.sub}</span>
                </button>
              )
            })}
          </div>

          {difficulty && difficultyPuzzles.length > 0 && (
            <div className="mb-1">
              <p className="text-stone-600 dark:text-stone-400 text-xs uppercase tracking-widest font-semibold text-center mb-2">
                Choose Level
              </p>

              <div className="flex flex-wrap gap-1.5 justify-center max-h-28 overflow-y-auto py-1">
                {difficultyPuzzles.map(p => {
                  const done = completedIds.includes(p.id)
                  const sel  = selectedPuzzleId === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPuzzleId(p.id)}
                      title={p.title}
                      className={[
                        'w-12 h-10 rounded-xl text-sm font-mono transition-all duration-150 border',
                        sel  ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-700 dark:border-stone-200' :
                        done ? 'bg-green-500 text-white border-green-400 dark:bg-green-600 dark:border-green-500' :
                               'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-green-400 hover:bg-green-50 dark:hover:border-green-600',
                      ].join(' ')}
                    >
                      {done && !sel ? '✓' : p.id}
                    </button>
                  )
                })}
              </div>

              <p className="text-stone-400 dark:text-stone-500 text-xs text-center mt-2" style={SERIF}>
                Solved: {completedInDifficulty} / {difficultyPuzzles.length}
              </p>

              {selectedPuzzleId && (() => {
                const p = getPuzzle(selectedPuzzleId)
                return p ? (
                  <p className="text-stone-500 dark:text-stone-400 text-xs text-center mt-1 italic" style={SERIF}>
                    #{p.id} — {p.title}
                  </p>
                ) : null
              })()}
            </div>
          )}

          <button
            type="button"
            onClick={() => selectedPuzzleId && startGame(selectedPuzzleId)}
            disabled={!selectedPuzzleId}
            className={[
              'mt-4 w-full py-3 rounded-xl font-bold text-base transition-all shadow-md',
              'bg-stone-800 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white',
              !selectedPuzzleId ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            style={SERIF}
          >
            ▶ Start Puzzle
          </button>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-stone-400 dark:text-stone-500 text-xs underline hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              style={SERIF}
            >
              {showHowTo ? 'Hide guide' : 'How to play'}
            </button>
            {showHowTo && (
              <div className="mt-2 text-left bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-2" style={SERIF}>
                {([
                  ['Clues',  'Numbers beside each row/column show groups of filled cells in order.'],
                  ['Fill',   'Left-click to fill a cell black. Click again to clear it.'],
                  ['Mark',   'Right-click to place × (this cell is definitely empty).'],
                  ['Groups', '"3 2" means: 3 filled, at least one gap, then 2 filled.'],
                  ['Tip',    'Start with the longest runs — they constrain the most cells.'],
                ] as [string, string][]).map(([label, body]) => (
                  <div key={label}>
                    <span className="text-green-700 dark:text-green-400 text-xs font-semibold">{label}: </span>
                    <span className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">{body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ PLAYING ══════════════════════════════════════════════════════════ */}
      {stage === 'playing' && puzzle && clues && (
        <div
          ref={boardRef}
          className="flex-1 flex flex-col items-center justify-center p-2 overflow-hidden relative"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >

          {/* ── Pause overlay ─────────────────────────────────────────────── */}
          {isPaused && !isComplete && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-stone-500 dark:text-stone-400 text-lg font-bold mb-3" style={SERIF}>Paused</p>
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold px-6 py-2 rounded-xl text-sm hover:bg-stone-700"
                  style={SERIF}
                >
                  ▶ Resume
                </button>
              </div>
            </div>
          )}

          {/* ── Win overlay ───────────────────────────────────────────────── */}
          {isComplete && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-stone-50/98 dark:bg-stone-900/98 overflow-y-auto py-4">

              {/* Pixel art reveal */}
              <PixelArt solution={puzzle.solution} />

              {/* Puzzle title */}
              <p className="text-stone-800 dark:text-stone-100 font-bold text-2xl text-center px-4" style={SERIF}>
                {puzzle.title}
              </p>

              {/* Stats */}
              <div className="text-center">
                <p className="text-stone-600 dark:text-stone-400 text-sm font-mono">
                  Solved in {formatTime(elapsedTime)}
                </p>
                {mistakes === 0 ? (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-0.5">✓ Perfect solve!</p>
                ) : (
                  <p className="text-rose-500 text-sm mt-0.5">{mistakes} mistake{mistakes !== 1 ? 's' : ''}</p>
                )}
              </div>

              {/* Stars */}
              <div className="text-3xl text-center leading-none">
                {[1,2,3].map(s => (
                  <span key={s} className={stars >= s ? 'text-amber-400' : 'text-stone-200 dark:text-stone-700'}>★</span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-1">
                {nextPuzzle && (
                  <button
                    type="button"
                    onClick={() => startGame(nextPuzzle.id)}
                    className="bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-xl py-3 px-8 hover:bg-stone-700 dark:hover:bg-white transition-all shadow-md"
                    style={SERIF}
                  >
                    Next ▶
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleQuit}
                  className="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 font-bold rounded-xl py-3 px-8 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
                  style={SERIF}
                >
                  Level Select
                </button>
              </div>
            </div>
          )}

          {/* Mistake counter */}
          {mistakes > 0 && !isComplete && (
            <p className="text-stone-400 dark:text-stone-500 text-xs mb-1 shrink-0 font-mono">
              ✗ {mistakes} mistake{mistakes !== 1 ? 's' : ''}
            </p>
          )}

          {/* ── Board ─────────────────────────────────────────────────────── */}
          <div
            className="shrink-0"
            style={{ userSelect: 'none', touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top: corner + column clues */}
            <div className="flex">
              <div style={{ width: rowClueW, height: colClueH }} />
              {clues.colClues.map((clue, c) => {
                const done = completedCols.has(c)
                return (
                  <div
                    key={c}
                    style={{ width: cellSize, height: colClueH }}
                    className="flex flex-col items-center justify-end"
                  >
                    {clue.map((n, i) => (
                      <div
                        key={i}
                        style={{ height: clueNumSz, lineHeight: `${clueNumSz}px` }}
                        className={[
                          `w-full flex items-center justify-center font-mono font-bold select-none ${clueFontCls}`,
                          done ? 'text-green-600 dark:text-green-400' : 'text-stone-700 dark:text-stone-300',
                        ].join(' ')}
                      >
                        {n === 0 ? '' : n}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Body: row clue + grid row */}
            {grid.map((row, r) => {
              const doneRow = completedRows.has(r)
              return (
                <div key={r} className="flex">
                  {/* Row clues */}
                  <div
                    style={{ width: rowClueW, height: cellSize }}
                    className="flex items-center justify-end pr-1"
                  >
                    {clues.rowClues[r].map((n, i) => (
                      <div
                        key={i}
                        style={{ width: clueNumSz, height: cellSize, lineHeight: `${cellSize}px` }}
                        className={[
                          `flex items-center justify-center font-mono font-bold select-none ${clueFontCls}`,
                          doneRow ? 'text-green-600 dark:text-green-400' : 'text-stone-700 dark:text-stone-300',
                        ].join(' ')}
                      >
                        {n === 0 ? '' : n}
                      </div>
                    ))}
                  </div>

                  {/* Cells */}
                  {row.map((cell, c) => (
                    <div
                      key={c}
                      data-cell={`${r},${c}`}
                      style={{ width: cellSize, height: cellSize, ...cellBorder(r, c, puzzle.size) }}
                      className={`shrink-0 flex items-center justify-center transition-colors duration-75 ${cellCls(cell, r, c)}`}
                      onClick={e  => handleCellClick(r, c, e)}
                      onContextMenu={e => handleRightClick(r, c, e)}
                      onMouseDown={e  => handleMouseDown(r, c, e)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                    >
                      {cell === 'marked' && flashCell !== `${r},${c}` && (
                        <span className={`font-bold select-none text-stone-400 dark:text-stone-500 ${cellSize >= 30 ? 'text-xs' : 'text-[9px]'}`}>
                          ✕
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
