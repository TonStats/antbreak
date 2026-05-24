'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CalendarDays, Eraser, Grid3x3, Lightbulb,
  Maximize2, Minimize2, Pause, PencilLine, Play, Undo2,
} from 'lucide-react'
import { generatePuzzle, getDailyPuzzle } from '@/lib/sudoku'
import type { Difficulty } from '@/lib/sudoku'

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode  = 'classic' | 'daily'
type Stage = 'setup' | 'playing' | 'complete'

interface MoveRecord {
  row:       number
  col:       number
  prevValue: number
  prevNotes: number[]
}

interface SavedGame {
  puzzle:      number[][]
  solution:    number[][]
  currentGrid: number[][]
  notes:       number[][][]
  difficulty:  Difficulty
  mode:        Mode
  timer:       number
  mistakes:    number
  hints:       number
  moveStack:   MoveRecord[]
  savedAt:     string
  completed:   boolean
  date?:       string
}

interface GameResult {
  time:         number
  difficulty:   Difficulty
  mode:         Mode
  mistakes:     number
  hintsUsed:    number
  isNewBest:    boolean
  previousBest: number | null
  streak:       number
}

// ── Config ────────────────────────────────────────────────────────────────────

const DIFF_CFG: Record<Difficulty, { label: string; sel: string; badge: string }> = {
  easy:   { label: 'Easy',   sel: 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/25', badge: 'bg-emerald-500' },
  medium: { label: 'Medium', sel: 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/25',            badge: 'bg-sky-500' },
  hard:   { label: 'Hard',   sel: 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/25',         badge: 'bg-rose-600' },
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function makeEmptyNotes(): number[][][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
}

function cloneNotes(notes: number[][][]): number[][][] {
  return notes.map(row => row.map(cell => [...cell]))
}

function loadSavedGames(): { classic: SavedGame | null; daily: SavedGame | null; dailyDone: boolean } {
  let classic: SavedGame | null = null
  let daily:   SavedGame | null = null
  let dailyDone = false

  const classicRaw = localStorage.getItem('sudoku_saved_classic')
  if (classicRaw) {
    try {
      const p = JSON.parse(classicRaw) as SavedGame
      if (!p.completed) classic = p
    } catch { localStorage.removeItem('sudoku_saved_classic') }
  }

  const today    = getTodayKey()
  const dailyRaw = localStorage.getItem(`sudoku_daily_${today}`)
  if (dailyRaw) {
    try {
      const p = JSON.parse(dailyRaw) as SavedGame
      if (p.completed) { dailyDone = true }
      else { daily = p }
    } catch { localStorage.removeItem(`sudoku_daily_${today}`) }
  }

  return { classic, daily, dailyDone }
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function triggerConfetti(): () => void {
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#F472B6', '#FB7185', '#A78BFA']
  const particles = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * 300,
    w: 4 + Math.random() * 8,
    h: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vy: 2.5 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 2.5,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
  }))
  const endTime = Date.now() + 3000
  let animId: number
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const remaining = endTime - Date.now()
    for (const p of particles) {
      p.y += p.vy; p.x += p.vx; p.rotation += p.rotSpeed
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.globalAlpha = remaining < 1000 ? Math.max(0, remaining / 1000) : 1
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore()
    }
    if (remaining > 0) animId = requestAnimationFrame(frame)
    else if (canvas.parentNode) canvas.remove()
  }
  animId = requestAnimationFrame(frame)
  return () => { cancelAnimationFrame(animId); if (canvas.parentNode) canvas.remove() }
}

// ── CountdownToMidnight ───────────────────────────────────────────────────────

function CountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function update() {
      const now = new Date(), midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
      const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <p className="mt-2 font-mono text-xs text-stone-500 dark:text-zinc-400">Next puzzle in {timeLeft}</p>
}

// ── SetupScreen ───────────────────────────────────────────────────────────────

interface SetupProps {
  difficulty:       Difficulty
  mode:             Mode
  streak:           number
  savedClassicGame: SavedGame | null
  savedDailyGame:   SavedGame | null
  dailyCompleted:   boolean
  onDifficulty:     (d: Difficulty) => void
  onMode:           (m: Mode) => void
  onStart:          () => void
  onResumeClassic:  () => void
  onResumeDaily:    () => void
}

function SetupScreen({
  difficulty, mode, streak, savedClassicGame, savedDailyGame, dailyCompleted,
  onDifficulty, onMode, onStart, onResumeClassic, onResumeDaily,
}: SetupProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-2">
        <Grid3x3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h1 className="text-2xl font-bold text-stone-800 dark:text-amber-50">Sudoku</h1>
      </div>
      <div className="mb-3 border-b border-amber-200 dark:border-zinc-600" />

      {mode === 'daily' && dailyCompleted && (
        <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50/80 p-2 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Already completed today!</p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">Come back tomorrow for a new puzzle.</p>
          <CountdownToMidnight />
        </div>
      )}

      {/* Difficulty */}
      <div className="mb-4">
        <p className="mb-2 block text-center text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-zinc-300">
          Choose Difficulty
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => onDifficulty(d)}
              className={[
                'rounded-xl border px-4 py-2 text-sm font-semibold transition-all',
                difficulty === d
                  ? DIFF_CFG[d].sel
                  : 'border-stone-200 bg-white text-stone-500 shadow-sm hover:bg-amber-50 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600',
              ].join(' ')}
            >
              {DIFF_CFG[d].label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="mb-3">
        <p className="mb-2 block text-center text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-zinc-300">
          Choose Mode
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onMode('classic')}
            className={[
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all',
              mode === 'classic'
                ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'border-stone-200 bg-white text-stone-500 shadow-sm hover:bg-amber-50 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600',
            ].join(' ')}
          >
            <Grid3x3 className="h-4 w-4" />
            Classic
          </button>
          <button
            onClick={() => onMode('daily')}
            className={[
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all',
              mode === 'daily'
                ? 'border-amber-400 bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'border-stone-200 bg-white text-stone-500 shadow-sm hover:bg-amber-50 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600',
            ].join(' ')}
          >
            <CalendarDays className="h-4 w-4" />
            Daily Puzzle
          </button>
        </div>
      </div>

      {streak > 0 && (
        <div className="mt-1 mb-2 text-center">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">🔥 {streak} day streak</span>
        </div>
      )}

      <button
        onClick={onStart}
        disabled={mode === 'daily' && dailyCompleted}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Play className="mr-2 inline h-4 w-4" />
        Start Puzzle
      </button>

      {savedClassicGame && (
        <button
          onClick={onResumeClassic}
          className="mt-2 w-full rounded-xl bg-amber-500 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-400"
        >
          Resume Classic — {DIFF_CFG[savedClassicGame.difficulty].label} · {formatTime(savedClassicGame.timer)} elapsed
        </button>
      )}

      {savedDailyGame && (
        <button
          onClick={onResumeDaily}
          className="mt-2 w-full rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-400"
        >
          Resume Today&apos;s Puzzle — Daily · {formatTime(savedDailyGame.timer)} elapsed
        </button>
      )}

    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SudokuGame() {
  // Setup
  const [difficulty,       setDifficulty]       = useState<Difficulty>('easy')
  const [mode,             setMode]             = useState<Mode>('classic')
  const [savedClassicGame, setSavedClassicGame] = useState<SavedGame | null>(null)
  const [savedDailyGame,   setSavedDailyGame]   = useState<SavedGame | null>(null)
  const [streak,           setStreak]           = useState(0)
  const [dailyCompleted,   setDailyCompleted]   = useState(false)

  // Game
  const [stage,             setStage]             = useState<Stage>('setup')
  const [puzzle,            setPuzzle]            = useState<number[][]>([])
  const [solution,          setSolution]          = useState<number[][]>([])
  const [grid,              setGrid]              = useState<number[][]>([])
  const [notes,             setNotes]             = useState<number[][][]>([])
  const [selectedCell,      setSelectedCell]      = useState<[number, number] | null>(null)
  const [notesMode,         setNotesMode]         = useState(false)
  const [mistakes,          setMistakes]          = useState(0)
  const [hintsLeft,         setHintsLeft]         = useState(3)
  const [elapsed,           setElapsed]           = useState(0)
  const [moveStack,         setMoveStack]         = useState<MoveRecord[]>([])
  const [showMistakeBanner, setShowMistakeBanner] = useState(false)
  const [shakingCell,       setShakingCell]       = useState<string | null>(null)
  const [gameResult,        setGameResult]        = useState<GameResult | null>(null)
  const [isFullscreen,      setIsFullscreen]      = useState(false)

  // Refs
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef  = useRef(0)
  const confettiRef = useRef<(() => void) | null>(null)

  const stateRef = useRef({ stage: 'setup' as Stage })
  stateRef.current = { stage }

  const actionsRef = useRef({
    handleDigitInput: (_n: number) => {},
    handleErase:      () => {},
    saveGame:         () => {},
  })

  // ── Load saved state on initial mount ────────────────────────────────────

  useEffect(() => {
    const { classic, daily, dailyDone } = loadSavedGames()
    setSavedClassicGame(classic)
    setSavedDailyGame(daily)
    setDailyCompleted(dailyDone)
    const streakRaw = localStorage.getItem('sudoku_streak')
    if (streakRaw) {
      try {
        const { count } = JSON.parse(streakRaw) as { count: number; lastDate: string }
        if (typeof count === 'number') setStreak(count)
      } catch { /* */ }
    }
  }, [])

  // ── Refresh saved-game state whenever setup screen is shown ──────────────

  useEffect(() => {
    if (stage !== 'setup') return
    const { classic, daily, dailyDone } = loadSavedGames()
    setSavedClassicGame(classic)
    setSavedDailyGame(daily)
    if (dailyDone) setDailyCompleted(true)
  }, [stage])

  // ── Timer ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (stage !== 'playing') {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      return
    }
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(e => e + 1)
    }, 1000)
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  }, [stage])

  // ── Keyboard handler ──────────────────────────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const { stage: s } = stateRef.current
      if (s !== 'playing') return

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedCell(prev => {
          if (!prev) return prev
          const [r, c] = prev
          if (e.key === 'ArrowUp')    return [Math.max(0, r - 1) as number, c] as [number, number]
          if (e.key === 'ArrowDown')  return [Math.min(8, r + 1) as number, c] as [number, number]
          if (e.key === 'ArrowLeft')  return [r, Math.max(0, c - 1) as number] as [number, number]
          return [r, Math.min(8, c + 1) as number] as [number, number]
        })
        return
      }

      const digit = parseInt(e.key)
      if (digit >= 1 && digit <= 9) { actionsRef.current.handleDigitInput(digit); return }
      if (e.key === 'Backspace' || e.key === 'Delete') actionsRef.current.handleErase()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // ── Auto-pause when tab goes hidden ──────────────────────────────────────

  useEffect(() => {
    function handleVisibilityChange() {
      const { stage: s } = stateRef.current
      if (document.hidden && s === 'playing') {
        actionsRef.current.saveGame()
        stopTimer()
        setStage('setup')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // ── Save on page unload ───────────────────────────────────────────────────

  useEffect(() => {
    function handleBeforeUnload() {
      if (stateRef.current.stage !== 'playing') return
      actionsRef.current.saveGame()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ── Auto-save on state changes ────────────────────────────────────────────

  useEffect(() => {
    if (stage !== 'playing' || puzzle.length === 0) return
    saveGameToLocalStorage()
  }, [grid, notes, mistakes, hintsLeft, moveStack, stage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      confettiRef.current?.()
    }
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  function saveGameToLocalStorage() {
    if (puzzle.length === 0) return
    const today   = getTodayKey()
    const saveKey = mode === 'classic' ? 'sudoku_saved_classic' : `sudoku_daily_${today}`
    const save: SavedGame = {
      puzzle, solution, currentGrid: grid, notes, difficulty, mode,
      timer: elapsedRef.current, mistakes, hints: hintsLeft,
      moveStack: moveStack.slice(-20), savedAt: new Date().toISOString(),
      completed: false, date: mode === 'daily' ? today : undefined,
    }
    localStorage.setItem(saveKey, JSON.stringify(save))
  }

  function pauseAndGoToSetup() {
    saveGameToLocalStorage()
    stopTimer()
    setStage('setup')
  }

  function updateStreak(): number {
    const today = getTodayKey()
    const d = new Date(); d.setDate(d.getDate() - 1)
    const yesterday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    let saved: { count: number; lastDate: string } = { count: 0, lastDate: '' }
    const raw = localStorage.getItem('sudoku_streak')
    if (raw) { try { saved = JSON.parse(raw) } catch { /* */ } }
    if (saved.lastDate === today) return saved.count
    const newCount = saved.lastDate === yesterday ? saved.count + 1 : 1
    localStorage.setItem('sudoku_streak', JSON.stringify({ count: newCount, lastDate: today }))
    return newCount
  }

  function checkWin(currentGrid: number[][]) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (currentGrid[r][c] !== solution[r][c]) return

    stopTimer()
    const t = elapsedRef.current

    const today   = getTodayKey()
    const saveKey = mode === 'classic' ? 'sudoku_saved_classic' : `sudoku_daily_${today}`
    const completedSave: SavedGame = {
      puzzle, solution, currentGrid, notes, difficulty, mode,
      timer: t, mistakes, hints: hintsLeft, moveStack: [],
      savedAt: new Date().toISOString(), completed: true,
      date: mode === 'daily' ? today : undefined,
    }
    localStorage.setItem(saveKey, JSON.stringify(completedSave))

    let finalStreak = streak
    if (mode === 'daily') {
      setDailyCompleted(true)
      setSavedDailyGame(null)
      finalStreak = updateStreak()
      setStreak(finalStreak)
    } else {
      setSavedClassicGame(null)
    }

    const bestKey  = `sudoku_best_${difficulty}`
    const prevBest = parseInt(localStorage.getItem(bestKey) ?? '0', 10)
    const isNewBest = prevBest === 0 || t < prevBest
    if (isNewBest) localStorage.setItem(bestKey, String(t))

    confettiRef.current?.()
    confettiRef.current = triggerConfetti()

    setGameResult({
      time: t, difficulty, mode, mistakes,
      hintsUsed: 3 - hintsLeft, isNewBest,
      previousBest: prevBest > 0 ? prevBest : null,
      streak: finalStreak,
    })
    setStage('complete')
  }

  // ── Core game actions ─────────────────────────────────────────────────────

  function handleDigitInput(digit: number) {
    if (!selectedCell) return
    const [r, c] = selectedCell
    if (puzzle[r][c] !== 0) return

    if (notesMode) {
      if (grid[r][c] !== 0) return
      const newNotes = cloneNotes(notes)
      const cell = newNotes[r][c]
      const idx = cell.indexOf(digit)
      if (idx >= 0) cell.splice(idx, 1); else cell.push(digit)
      setMoveStack(ms => [...ms.slice(-49), { row: r, col: c, prevValue: grid[r][c], prevNotes: [...notes[r][c]] }])
      setNotes(newNotes)
    } else {
      if (grid[r][c] === solution[r][c] && grid[r][c] !== 0) return
      const prevValue = grid[r][c]
      const prevNotes = [...notes[r][c]]
      const newGrid   = grid.map(row => [...row])
      const newNotes  = cloneNotes(notes)
      newGrid[r][c]   = digit
      newNotes[r][c]  = []

      const isError = digit !== solution[r][c]
      if (isError) {
        setMistakes(m => { const nm = m + 1; if (nm >= 3) setShowMistakeBanner(true); return nm })
        const key = `${r}-${c}`
        setShakingCell(key)
        setTimeout(() => setShakingCell(prev => prev === key ? null : prev), 400)
      } else {
        for (let i = 0; i < 9; i++) {
          newNotes[r][i] = newNotes[r][i].filter(x => x !== digit)
          newNotes[i][c] = newNotes[i][c].filter(x => x !== digit)
        }
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
        for (let dr = 0; dr < 3; dr++)
          for (let dc = 0; dc < 3; dc++)
            newNotes[br+dr][bc+dc] = newNotes[br+dr][bc+dc].filter(x => x !== digit)
      }
      setMoveStack(ms => [...ms.slice(-49), { row: r, col: c, prevValue, prevNotes }])
      setGrid(newGrid); setNotes(newNotes)
      if (!isError) checkWin(newGrid)
    }
  }

  function handleErase() {
    if (!selectedCell) return
    const [r, c] = selectedCell
    if (puzzle[r][c] !== 0) return
    if (grid[r][c] === 0 && notes[r][c].length === 0) return
    setMoveStack(ms => [...ms.slice(-49), { row: r, col: c, prevValue: grid[r][c], prevNotes: [...notes[r][c]] }])
    const newGrid = grid.map(row => [...row]); const newNotes = cloneNotes(notes)
    newGrid[r][c] = 0; newNotes[r][c] = []
    setGrid(newGrid); setNotes(newNotes)
  }

  actionsRef.current = { handleDigitInput, handleErase, saveGame: saveGameToLocalStorage }

  function handleUndo() {
    if (moveStack.length === 0) return
    const last = moveStack[moveStack.length - 1]
    const newGrid = grid.map(row => [...row]); const newNotes = cloneNotes(notes)
    newGrid[last.row][last.col] = last.prevValue
    newNotes[last.row][last.col] = [...last.prevNotes]
    setGrid(newGrid); setNotes(newNotes)
    setMoveStack(ms => ms.slice(0, -1))
    setSelectedCell([last.row, last.col])
  }

  function handleHint() {
    if (hintsLeft <= 0 || !selectedCell) return
    const [r, c] = selectedCell
    if (puzzle[r][c] !== 0) return
    if (grid[r][c] === solution[r][c] && grid[r][c] !== 0) return
    const correct   = solution[r][c]
    const prevValue = grid[r][c]
    const prevNotes = [...notes[r][c]]
    const newGrid   = grid.map(row => [...row]); const newNotes = cloneNotes(notes)
    newGrid[r][c] = correct; newNotes[r][c] = []
    for (let i = 0; i < 9; i++) {
      newNotes[r][i] = newNotes[r][i].filter(x => x !== correct)
      newNotes[i][c] = newNotes[i][c].filter(x => x !== correct)
    }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++)
        newNotes[br+dr][bc+dc] = newNotes[br+dr][bc+dc].filter(x => x !== correct)
    setMoveStack(ms => [...ms.slice(-49), { row: r, col: c, prevValue, prevNotes }])
    setGrid(newGrid); setNotes(newNotes); setHintsLeft(h => h - 1)
    checkWin(newGrid)
  }

  // ── Start / Resume ────────────────────────────────────────────────────────

  function startGame() {
    confettiRef.current?.(); confettiRef.current = null
    stopTimer()
    const { puzzle: p, solution: s } = mode === 'daily' ? getDailyPuzzle() : generatePuzzle(difficulty)
    elapsedRef.current = 0; setElapsed(0)
    setPuzzle(p); setSolution(s); setGrid(p.map(row => [...row]))
    setNotes(makeEmptyNotes()); setSelectedCell(null); setNotesMode(false)
    setMistakes(0); setHintsLeft(3); setMoveStack([])
    setShowMistakeBanner(false); setShakingCell(null); setGameResult(null)
    setStage('playing')
  }

  function resumeGame(saved: SavedGame) {
    confettiRef.current?.(); confettiRef.current = null
    stopTimer()
    elapsedRef.current = saved.timer; setElapsed(saved.timer)
    setPuzzle(saved.puzzle); setSolution(saved.solution)
    setGrid(saved.currentGrid); setNotes(saved.notes)
    setDifficulty(saved.difficulty); setMode(saved.mode)
    setMistakes(saved.mistakes); setHintsLeft(saved.hints)
    setMoveStack(saved.moveStack ?? [])
    setSelectedCell(null); setNotesMode(false)
    setShowMistakeBanner(false); setShakingCell(null); setGameResult(null)
    setStage('playing')
  }

  // ── Cell styling ──────────────────────────────────────────────────────────

  function getCellBg(r: number, c: number): string {
    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c
    if (isSelected) return 'bg-blue-500 dark:bg-blue-600'
    const val    = grid[r][c]
    const isError = val !== 0 && solution.length > 0 && val !== solution[r][c]
    if (isError) return 'bg-red-100 dark:bg-red-900/40'
    if (selectedCell) {
      const [sr, sc] = selectedCell
      const sameUnit = r === sr || c === sc ||
        (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3))
      const selVal = grid[sr][sc]
      if (selVal !== 0 && val !== 0 && val === selVal) return 'bg-yellow-100 dark:bg-zinc-600/40'
      if (sameUnit) return 'bg-blue-100 dark:bg-zinc-700'
    }
    return puzzle[r]?.[c] !== 0
      ? 'bg-blue-50 dark:bg-zinc-900'
      : 'bg-white hover:bg-blue-50/60 dark:bg-zinc-800 dark:hover:bg-zinc-700'
  }

  function getCellText(r: number, c: number): string {
    const val = grid[r][c]
    if (val === 0) return ''
    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c
    if (isSelected) return 'text-white font-bold'
    const isError = solution.length > 0 && val !== solution[r][c]
    if (isError) return 'text-red-500 dark:text-red-400 font-semibold'
    if (puzzle[r]?.[c] !== 0) return 'text-gray-900 dark:text-zinc-100 font-bold'
    return 'text-blue-700 dark:text-sky-300 font-semibold'
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = isFullscreen ? undefined! : {
    boxShadow:
      '0 0 0 1px rgba(251,191,36,0.3), 0 25px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
  }

  const cardClass = isFullscreen
    ? 'fixed inset-0 z-50 overflow-auto bg-amber-50 p-6 dark:bg-zinc-800'
    : 'relative w-full rounded-2xl border-2 border-amber-200 bg-amber-50/90 p-4 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-800/90'

  const ctrlBtn = 'flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

  return (
    <div className="bg-background px-4 py-3">
      <div id="original-game-card" className={cardClass} style={isFullscreen ? undefined : cardStyle}>

        {/* Fullscreen toggle */}
        {stage !== 'setup' && (
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-500 transition-colors hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        )}

        {/* ── Setup ── */}
        {stage === 'setup' && (
          <SetupScreen
            difficulty={difficulty} mode={mode} streak={streak}
            savedClassicGame={savedClassicGame} savedDailyGame={savedDailyGame}
            dailyCompleted={dailyCompleted}
            onDifficulty={setDifficulty} onMode={setMode}
            onStart={startGame}
            onResumeClassic={() => savedClassicGame && resumeGame(savedClassicGame)}
            onResumeDaily={() => savedDailyGame && resumeGame(savedDailyGame)}
          />
        )}

        {/* ── Playing ── */}
        {(stage === 'playing' || stage === 'complete') && puzzle.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-center gap-2 pr-8">
              <Grid3x3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h1 className="text-2xl font-bold text-stone-800 dark:text-amber-50">Sudoku</h1>
            </div>
            <div className="mb-3 border-b border-amber-200 dark:border-zinc-600" />

            {/* Status bar */}
            <div className="mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-stone-700 dark:text-zinc-200">{formatTime(elapsed)}</span>
                <button
                  onClick={pauseAndGoToSetup}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
                  aria-label="Pause"
                >
                  <Pause className="h-3 w-3" />
                  Pause
                </button>
              </div>
              <span className={`${DIFF_CFG[difficulty].badge} rounded-full px-2 py-0.5 text-xs font-semibold text-white`}>
                {DIFF_CFG[difficulty].label}
              </span>
              <span className={`text-xs font-medium ${mistakes > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-stone-400 dark:text-zinc-400'}`}>
                {mistakes}/3 mistakes
              </span>
            </div>

            {/* Mistake banner */}
            {showMistakeBanner && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-sm dark:border-rose-500/40 dark:bg-rose-900/30">
                <p className="mb-2 font-semibold text-rose-600 dark:text-rose-300">3 mistakes reached. Keep going or start fresh?</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setShowMistakeBanner(false)}
                    className="rounded-lg bg-stone-100 px-4 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-200 dark:bg-zinc-600 dark:text-white dark:hover:bg-zinc-500"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => { setShowMistakeBanner(false); stopTimer(); setStage('setup') }}
                    className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-500"
                  >
                    New Puzzle
                  </button>
                </div>
              </div>
            )}

            {/* Board */}
            <div className="mx-auto w-full max-w-[400px]">
              <div className="grid grid-cols-9 overflow-hidden rounded-lg border-2 border-gray-800 bg-white dark:border-zinc-600 dark:bg-zinc-900">
                {Array.from({ length: 9 }, (_, r) =>
                  Array.from({ length: 9 }, (_, c) => {
                    const val       = grid[r][c]
                    const cNotes    = notes[r][c]
                    const hasNotes  = cNotes.length > 0 && val === 0
                    const isShaking = shakingCell === `${r}-${c}`
                    const bg        = getCellBg(r, c)
                    const text      = getCellText(r, c)

                    return (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => {
                          if (stage !== 'playing') return
                          setSelectedCell(prev => prev?.[0] === r && prev?.[1] === c ? null : [r, c])
                        }}
                        className={[
                          'flex aspect-square cursor-pointer select-none items-center justify-center text-base transition-colors duration-75',
                          bg,
                          isShaking ? 'animate-[shake_0.4s_ease]' : '',
                        ].join(' ')}
                        style={{
                          borderRight:  (c === 2 || c === 5) ? '2px solid var(--sudoku-box-border)'  : '1px solid var(--sudoku-cell-border)',
                          borderBottom: (r === 2 || r === 5) ? '2px solid var(--sudoku-box-border)'  : '1px solid var(--sudoku-cell-border)',
                          borderLeft:   'none',
                          borderTop:    'none',
                        }}
                      >
                        {hasNotes ? (
                          <div className="grid h-full w-full grid-cols-3 grid-rows-3 p-px">
                            {[1,2,3,4,5,6,7,8,9].map(n => (
                              <div key={n} className="flex items-center justify-center text-[7px] leading-none text-gray-400 dark:text-zinc-500">
                                {cNotes.includes(n) ? n : ''}
                              </div>
                            ))}
                          </div>
                        ) : val !== 0 ? (
                          <span className={`text-lg leading-none ${text}`}>{val}</span>
                        ) : null}
                      </div>
                    )
                  })
                ).flat()}
              </div>
            </div>

            {/* Number pad */}
            <div className="mx-auto mt-2 w-full max-w-[400px]">
              <div className="grid grid-cols-9 gap-1.5">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button
                    key={n}
                    onClick={() => handleDigitInput(n)}
                    disabled={stage !== 'playing'}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 bg-white text-base font-bold text-gray-800 transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-700"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Control buttons */}
            <div className="mx-auto mt-2 flex w-full max-w-[400px] justify-between gap-1.5">
              <button
                onClick={() => setNotesMode(m => !m)}
                disabled={stage !== 'playing'}
                className={[
                  'flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 px-3 text-sm font-semibold shadow-sm transition-all disabled:opacity-40',
                  notesMode
                    ? 'border-blue-600 bg-blue-500 text-white dark:border-blue-500 dark:bg-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
                ].join(' ')}
              >
                <PencilLine className="h-4 w-4" />
                Notes
              </button>
              <button onClick={handleErase} disabled={stage !== 'playing'} className={ctrlBtn}>
                <Eraser className="h-4 w-4" />
                Erase
              </button>
              <button onClick={handleUndo} disabled={stage !== 'playing' || moveStack.length === 0} className={ctrlBtn}>
                <Undo2 className="h-4 w-4" />
                Undo
              </button>
              <button
                onClick={handleHint}
                disabled={
                  stage !== 'playing' || hintsLeft <= 0 || !selectedCell ||
                  (selectedCell ? puzzle[selectedCell[0]]?.[selectedCell[1]] !== 0 : false)
                }
                className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-amber-600 bg-amber-500 py-2 px-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-300 dark:border-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 dark:disabled:border-zinc-700 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
              >
                <Lightbulb className="h-4 w-4" />
                Hint ({hintsLeft})
              </button>
            </div>

            {/* Back to menu */}
            {stage === 'playing' && (
              <div className="mt-2 text-center">
                <button
                  onClick={pauseAndGoToSetup}
                  className="text-xs text-stone-400 underline hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  ← Back to menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Completion overlay ── */}
        {stage === 'complete' && gameResult && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
            <div
              className="w-full max-w-sm rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center shadow-2xl dark:border-zinc-600 dark:bg-zinc-800"
              style={{ boxShadow: '0 0 0 1px rgba(251,191,36,0.3), 0 25px 60px rgba(0,0,0,0.4)' }}
            >
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <span className="text-3xl text-emerald-500">✓</span>
              </div>
              <h2 className="mb-1 text-2xl font-bold text-stone-800 dark:text-white">Puzzle Complete!</h2>
              <p className="mb-3 text-sm text-stone-600 dark:text-zinc-300">Completed in {formatTime(gameResult.time)}</p>

              <div className="mb-3 space-y-1 rounded-xl border border-amber-200 bg-white/80 p-3 text-xs dark:border-zinc-600 dark:bg-zinc-700/60">
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-zinc-400">Difficulty</span>
                  <span className={`${DIFF_CFG[gameResult.difficulty].badge} rounded-full px-2 py-0.5 text-xs font-semibold text-white`}>
                    {DIFF_CFG[gameResult.difficulty].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-zinc-400">Mistakes</span>
                  <span className={gameResult.mistakes > 0 ? 'font-semibold text-rose-500 dark:text-rose-400' : 'font-semibold text-emerald-600 dark:text-emerald-400'}>
                    {gameResult.mistakes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-zinc-400">Hints used</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{gameResult.hintsUsed}</span>
                </div>
                {gameResult.isNewBest ? (
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-zinc-400">Time</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">🏆 New Best!</span>
                  </div>
                ) : gameResult.previousBest !== null ? (
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-zinc-400">Your best</span>
                    <span className="font-semibold text-stone-700 dark:text-zinc-200">{formatTime(gameResult.previousBest)}</span>
                  </div>
                ) : null}
              </div>

              {gameResult.mode === 'daily' && gameResult.streak > 0 && (
                <div className="mb-3 rounded-xl border border-amber-300 bg-amber-100/80 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">🔥 {gameResult.streak} day streak!</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">Come back tomorrow for a new puzzle.</p>
                  <CountdownToMidnight />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    confettiRef.current?.(); confettiRef.current = null
                    if (gameResult.mode === 'classic') localStorage.removeItem('sudoku_saved_classic')
                    setStage('setup')
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-sm font-bold text-white shadow-md shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400"
                >
                  New Puzzle
                </button>
                <button
                  onClick={() => {
                    confettiRef.current?.(); confettiRef.current = null
                    if (gameResult.mode === 'classic') localStorage.removeItem('sudoku_saved_classic')
                    startGame()
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                >
                  Play Again (Same Settings)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
