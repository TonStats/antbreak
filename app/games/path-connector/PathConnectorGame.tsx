'use client'

import { useState, useEffect, useRef } from 'react'
import { Network, Maximize2, Minimize2, X, RotateCcw } from 'lucide-react'
import { PUZZLE_LEVELS, getLevelsByDifficulty, getRandomReactionPuzzle } from '@/data/pathPuzzles'
import {
  startPath, extendPath, checkPuzzleComplete, resetPuzzle, COLOR_MAP,
} from '@/lib/pathConnector'
import type { PathCell, ActivePath, PathColor, PuzzleLevel } from '@/types/pathConnector'

// ─── Types ────────────────────────────────────────────────────────────────────

type GameMode   = 'puzzle' | 'reaction'
type SetupStage = 'mode' | 'levels'
type GameStage  = 'setup' | 'playing' | 'complete'
type DiffFilter = 'all' | 'easy' | 'medium' | 'hard' | 'expert'

interface PathProgress {
  completedLevels: number[]
  highestUnlocked: number
}

interface ConfettiPiece {
  id: number
  left: number
  color: string
  width: number
  height: number
  duration: number
  delay: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_PILLS: { id: DiffFilter; label: string }[] = [
  { id: 'all',    label: 'All'    },
  { id: 'easy',   label: 'Easy'   },
  { id: 'medium', label: 'Medium' },
  { id: 'hard',   label: 'Hard'   },
  { id: 'expert', label: 'Expert' },
]

const MODE_OPTIONS = [
  { id: 'puzzle'   as GameMode, emoji: '🗺️', name: 'PUZZLE MODE',   desc: '200 levels. No time limit.'       },
  { id: 'reaction' as GameMode, emoji: '⚡', name: 'REACTION MODE', desc: 'Beat the clock. 30s per puzzle.' },
] as const

const CONFETTI_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#f97316',
]

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getPar(level: PuzzleLevel): number {
  return Math.ceil((level.dots.length / 2) * level.size / 2)
}

function calcStars(level: PuzzleLevel, moves: number): number {
  const par = getPar(level)
  if (moves <= par) return 3
  if (moves <= Math.ceil(par * 1.2)) return 2
  return 1
}

function getNextReactionDiff(count: number): string {
  if (count < 5)  return 'easy'
  if (count < 12) return 'medium'
  if (count < 20) return 'hard'
  return 'expert'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PathConnectorGame() {
  const cardRef             = useRef<HTMLDivElement>(null)
  const boardRef            = useRef<HTMLDivElement>(null)
  const lastCellRef         = useRef<string | null>(null)
  const reactionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isFullscreen,   setIsFullscreen]   = useState(false)
  const [gameStage,      setGameStage]      = useState<GameStage>('setup')
  const [setupStage,     setSetupStage]     = useState<SetupStage>('mode')
  const [showWinOverlay, setShowWinOverlay] = useState(false)

  // ── Setup state ───────────────────────────────────────────────────────────
  const [mode,         setMode]         = useState<GameMode>('puzzle')
  const [diffFilter,   setDiffFilter]   = useState<DiffFilter>('easy')
  const [currentLevel, setCurrentLevel] = useState<PuzzleLevel | null>(null)

  // ── Progress ─────────────────────────────────────────────────────────────
  const [progress, setProgress] = useState<PathProgress>({
    completedLevels: [],
    highestUnlocked: 1,
  })

  // ── Game state ────────────────────────────────────────────────────────────
  const [board,       setBoard]       = useState<PathCell[][]>([])
  const [paths,       setPaths]       = useState<ActivePath[]>([])
  const [activeColor, setActiveColor] = useState<PathColor | null>(null)
  const [isDrawing,   setIsDrawing]   = useState(false)
  const [moveCount,   setMoveCount]   = useState(0)
  const [cellSize,    setCellSize]    = useState(48)
  const [earnedStars, setEarnedStars] = useState(0)

  // ── Reaction state ────────────────────────────────────────────────────────
  const [reactionTimer,       setReactionTimer]       = useState(30)
  const [reactionScore,       setReactionScore]       = useState(0)
  const [reactionPuzzleCount, setReactionPuzzleCount] = useState(0)
  const [bestReaction,        setBestReaction]        = useState(0)
  const [isNewBest,           setIsNewBest]           = useState(false)

  // ── Visual effects ────────────────────────────────────────────────────────
  const [confetti,    setConfetti]    = useState<ConfettiPiece[]>([])
  const [pointsFlash, setPointsFlash] = useState<string | null>(null)

  // ── Load progress + best ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('path_progress')
      if (raw) setProgress(JSON.parse(raw) as PathProgress)
    } catch {}
    const best = parseInt(localStorage.getItem('path_best_reaction') || '0', 10)
    setBestReaction(best)
  }, [])

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) document.exitFullscreen?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  // ── Release drag outside board ────────────────────────────────────────────
  useEffect(() => {
    const onUp = () => setIsDrawing(false)
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  // ── Reaction timer → game over ────────────────────────────────────────────
  useEffect(() => {
    if (gameStage !== 'playing' || mode !== 'reaction' || reactionTimer !== 0) return
    const best = parseInt(localStorage.getItem('path_best_reaction') || '0', 10)
    if (reactionScore > best) {
      setBestReaction(reactionScore)
      setIsNewBest(true)
      try { localStorage.setItem('path_best_reaction', String(reactionScore)) } catch {}
    } else {
      setBestReaction(best)
      setIsNewBest(false)
    }
    setGameStage('complete')
  }, [reactionTimer, gameStage, mode, reactionScore])

  // ── Cleanup interval on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (reactionIntervalRef.current) clearInterval(reactionIntervalRef.current)
    }
  }, [])

  // ── ResizeObserver ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!boardRef.current || !currentLevel) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      const available = Math.min(width - 32, height - 32)
      const size = Math.max(Math.min(Math.floor(available / currentLevel.size), 64), 36)
      setCellSize(size)
    })
    observer.observe(boardRef.current)
    return () => observer.disconnect()
  }, [currentLevel?.size, gameStage])

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  function toggleFullscreen() {
    if (!document.fullscreenElement) cardRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  function isCompleted(id: number) { return progress.completedLevels.includes(id) }
  function isUnlocked(id: number)  { return id === 1 || id <= progress.highestUnlocked }

  function saveProgress(level: PuzzleLevel) {
    const id = level.id as number
    const completed = progress.completedLevels.includes(id)
      ? progress.completedLevels
      : [...progress.completedLevels, id]
    const highest = Math.max(progress.highestUnlocked, id + 1)
    const next    = { completedLevels: completed, highestUnlocked: highest }
    setProgress(next)
    try { localStorage.setItem('path_progress', JSON.stringify(next)) } catch {}
  }

  function spawnConfetti() {
    const pieces: ConfettiPiece[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      width: Math.random() * 5 + 4,
      height: Math.random() * 8 + 8,
      duration: Math.random() * 1.5 + 2,
      delay: Math.random() * 0.5,
    }))
    setConfetti(pieces)
    setTimeout(() => setConfetti([]), 3500)
  }

  function showFlash(text: string) {
    setPointsFlash(text)
    setTimeout(() => setPointsFlash(null), 1100)
  }

  function startReactionTimer() {
    if (reactionIntervalRef.current) clearInterval(reactionIntervalRef.current)
    reactionIntervalRef.current = setInterval(() => {
      setReactionTimer(prev => {
        if (prev <= 1) {
          clearInterval(reactionIntervalRef.current!)
          reactionIntervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SETUP ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  function resetToSetup() {
    if (reactionIntervalRef.current) {
      clearInterval(reactionIntervalRef.current)
      reactionIntervalRef.current = null
    }
    setGameStage('setup')
    setSetupStage('mode')
    setCurrentLevel(null)
    setBoard([])
    setPaths([])
    setActiveColor(null)
    setIsDrawing(false)
    setMoveCount(0)
    setShowWinOverlay(false)
    setEarnedStars(0)
    setConfetti([])
    setReactionTimer(30)
    setReactionScore(0)
    setReactionPuzzleCount(0)
    setIsNewBest(false)
  }

  function handleDiffPill(d: DiffFilter) {
    setDiffFilter(d)
    setSetupStage('levels')
  }

  function startLevel(level: PuzzleLevel) {
    const { board: b, paths: p } = resetPuzzle(level)
    setCurrentLevel(level)
    setBoard(b)
    setPaths(p)
    setActiveColor(null)
    setIsDrawing(false)
    setMoveCount(0)
    setShowWinOverlay(false)
    setEarnedStars(0)
    setConfetti([])
    lastCellRef.current = null
    setGameStage('playing')
  }

  function startReaction() {
    if (reactionIntervalRef.current) {
      clearInterval(reactionIntervalRef.current)
      reactionIntervalRef.current = null
    }
    const lvl = getRandomReactionPuzzle('easy')
    const { board: b, paths: p } = resetPuzzle(lvl)
    setCurrentLevel(lvl)
    setBoard(b)
    setPaths(p)
    setActiveColor(null)
    setIsDrawing(false)
    setMoveCount(0)
    setReactionTimer(30)
    setReactionScore(0)
    setReactionPuzzleCount(0)
    setIsNewBest(false)
    setConfetti([])
    lastCellRef.current = null
    setGameStage('playing')
    startReactionTimer()
  }

  function handleReset() {
    if (!currentLevel) return
    const { board: b, paths: p } = resetPuzzle(currentLevel)
    setBoard(b)
    setPaths(p)
    setActiveColor(null)
    setIsDrawing(false)
    setMoveCount(0)
    lastCellRef.current = null
  }

  function goNextLevel() {
    if (!currentLevel) { resetToSetup(); return }
    const nextId = (currentLevel.id as number) + 1
    const next   = PUZZLE_LEVELS.find(l => l.id === nextId)
    if (next) startLevel(next)
    else resetToSetup()
  }

  function goToLevelSelect() {
    setShowWinOverlay(false)
    setEarnedStars(0)
    setConfetti([])
    setBoard([])
    setPaths([])
    setActiveColor(null)
    setIsDrawing(false)
    setMoveCount(0)
    setGameStage('setup')
    setSetupStage('levels')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GAME INTERACTION
  // ─────────────────────────────────────────────────────────────────────────

  function getCellCoords(el: Element | null): { row: number; col: number } | null {
    if (!el) return null
    const cell = el.closest('[data-cell]') as HTMLElement | null
    if (!cell?.dataset.cell) return null
    const [r, c] = cell.dataset.cell.split('-').map(Number)
    return { row: r, col: c }
  }

  function onPuzzleComplete(completedBoard: PathCell[][], completedPaths: ActivePath[]) {
    setIsDrawing(false)
    lastCellRef.current = null

    if (mode === 'puzzle' && currentLevel) {
      const stars = calcStars(currentLevel, moveCount)
      setEarnedStars(stars)
      saveProgress(currentLevel)
      setBoard(completedBoard)
      setPaths(completedPaths)
      setActiveColor(null)
      setShowWinOverlay(true)
      if (stars === 3) spawnConfetti()

    } else if (mode === 'reaction' && currentLevel) {
      const nextCount = reactionPuzzleCount + 1
      setReactionScore(s => s + 10)
      setReactionPuzzleCount(nextCount)
      setReactionTimer(t => Math.max(t - 1, 5))
      showFlash('+10')

      const diff = getNextReactionDiff(nextCount)
      const pool = getLevelsByDifficulty(diff)
      const next = pool[Math.floor(Math.random() * pool.length)]
      const { board: nb, paths: np } = resetPuzzle(next)
      setCurrentLevel(next)
      setBoard(nb)
      setPaths(np)
      setActiveColor(null)
      setMoveCount(0)
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!currentLevel || showWinOverlay) return
    e.preventDefault()
    const coords = getCellCoords(e.target as Element)
    if (!coords) return
    const result = startPath(board, paths, currentLevel, coords.row, coords.col)
    if (!result.activeColor) return
    lastCellRef.current = `${coords.row}-${coords.col}`
    setBoard(result.board)
    setPaths(result.paths)
    setActiveColor(result.activeColor)
    setIsDrawing(true)
    setMoveCount(m => m + 1)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDrawing || !activeColor || !currentLevel || showWinOverlay) return
    const coords = getCellCoords(e.target as Element)
    if (!coords) return
    const key = `${coords.row}-${coords.col}`
    if (lastCellRef.current === key) return
    lastCellRef.current = key
    const result = extendPath(board, paths, activeColor, coords.row, coords.col, currentLevel)
    if (result.pathComplete) {
      const done = checkPuzzleComplete(result.board, result.paths, currentLevel.size)
      if (done) { onPuzzleComplete(result.board, result.paths); return }
    }
    setBoard(result.board)
    setPaths(result.paths)
    setActiveColor(result.activeColor)
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (!currentLevel || showWinOverlay) return
    e.preventDefault()
    const touch  = e.touches[0]
    const el     = document.elementFromPoint(touch.clientX, touch.clientY)
    const coords = getCellCoords(el)
    if (!coords) return
    const result = startPath(board, paths, currentLevel, coords.row, coords.col)
    if (!result.activeColor) return
    lastCellRef.current = `${coords.row}-${coords.col}`
    setBoard(result.board)
    setPaths(result.paths)
    setActiveColor(result.activeColor)
    setIsDrawing(true)
    setMoveCount(m => m + 1)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!isDrawing || !activeColor || !currentLevel || showWinOverlay) return
    e.preventDefault()
    const touch  = e.touches[0]
    const el     = document.elementFromPoint(touch.clientX, touch.clientY)
    const coords = getCellCoords(el)
    if (!coords) return
    const key = `${coords.row}-${coords.col}`
    if (lastCellRef.current === key) return
    lastCellRef.current = key
    const result = extendPath(board, paths, activeColor, coords.row, coords.col, currentLevel)
    if (result.pathComplete) {
      const done = checkPuzzleComplete(result.board, result.paths, currentLevel.size)
      if (done) { onPuzzleComplete(result.board, result.paths); return }
    }
    setBoard(result.board)
    setPaths(result.paths)
    setActiveColor(result.activeColor)
  }

  function handleTouchEnd() { setIsDrawing(false) }

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED
  // ─────────────────────────────────────────────────────────────────────────

  const visibleLevels = PUZZLE_LEVELS.filter(
    l => diffFilter === 'all' || l.difficulty === diffFilter
  )

  const timerClass = reactionTimer > 15
    ? 'border-blue-700 bg-blue-900/50 text-blue-300'
    : reactionTimer > 7
    ? 'border-yellow-700 bg-yellow-900/50 text-yellow-300'
    : 'border-rose-700 bg-rose-900/50 text-rose-400 animate-pulse'

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="relative flex flex-col rounded-2xl path-connector-card overflow-hidden bg-slate-950"
      style={{
        height: 'calc(100vh - 100px)',
        minHeight: '580px',
        boxShadow:
          '0 0 0 1px rgba(59,130,246,0.3), ' +
          '0 0 30px rgba(59,130,246,0.06), ' +
          '0 25px 50px rgba(0,0,0,0.7)',
      }}
    >
      {/* ── Confetti ───────────────────────────────────────────────────────── */}
      {confetti.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* ── Title Row ──────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <Network className="h-5 w-5 text-blue-400" />
          <span className="font-mono text-2xl font-bold text-blue-100">Path Connector</span>
        </div>
        <div className="flex items-center gap-2">
          {gameStage !== 'setup' && (
            <button
              onClick={resetToSetup}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-200 transition-colors hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" /> Quit
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/10 p-1.5 text-blue-300 transition-colors hover:bg-white/20"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="h-px shrink-0 bg-blue-900/20" />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SETUP                                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {gameStage === 'setup' && (
        <div className="flex flex-1 flex-col justify-center overflow-y-auto px-5">

          {/* ── Stage A: Mode Select ─────────────────────────────────────── */}
          {setupStage === 'mode' && (
            <>
              <p className="mb-5 text-center font-mono text-xs uppercase tracking-[0.4em] text-blue-900/60">
                PATH CONNECTOR
              </p>

              <div className="grid grid-cols-2 gap-3">
                {MODE_OPTIONS.map(m => {
                  const sel = mode === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`rounded-2xl p-5 transition-all duration-150 ${
                        sel
                          ? 'border-2 border-blue-500 bg-blue-950/60 shadow-lg shadow-blue-500/15'
                          : 'border border-slate-700/50 bg-slate-900 hover:border-blue-700/60 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="text-center text-4xl">{m.emoji}</div>
                      <p className="mt-2 text-center font-mono text-sm font-bold text-blue-100">{m.name}</p>
                      <p className="mt-1 text-center font-mono text-xs text-slate-500">{m.desc}</p>
                    </button>
                  )
                })}
              </div>

              {mode === 'puzzle' && (
                <div className="mt-4 flex justify-center gap-2">
                  {DIFF_PILLS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleDiffPill(f.id)}
                      className={`rounded-full px-3 py-1 font-mono text-xs transition-all duration-150 ${
                        diffFilter === f.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              {mode === 'reaction' && (
                <div className="mt-4">
                  <button
                    onClick={startReaction}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-mono text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-cyan-500"
                  >
                    ⚡ START REACTION
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Stage B: Level Select ────────────────────────────────────── */}
          {setupStage === 'levels' && (
            <>
              <div className="mb-3 flex justify-center gap-2">
                {DIFF_PILLS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setDiffFilter(f.id)}
                    className={`rounded-full px-3 py-1 font-mono text-xs transition-all duration-150 ${
                      diffFilter === f.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex flex-wrap justify-center gap-2 pb-2">
                  {visibleLevels.map(level => {
                    const id        = level.id as number
                    const completed = isCompleted(id)
                    const unlocked  = isUnlocked(id)

                    if (completed) return (
                      <button
                        key={id}
                        onClick={() => startLevel(level)}
                        title={`Level ${id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-mono text-xs font-bold text-white"
                      >✓</button>
                    )
                    if (unlocked) return (
                      <button
                        key={id}
                        onClick={() => startLevel(level)}
                        title={`Level ${id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 font-mono text-xs font-bold text-slate-300 transition-colors hover:border-blue-500/60"
                      >{id}</button>
                    )
                    return (
                      <div
                        key={id}
                        title={`Level ${id} (locked)`}
                        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-700"
                      >🔒</div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-2 text-center">
                <button
                  onClick={() => setSetupStage('mode')}
                  className="cursor-pointer font-mono text-xs text-slate-600 underline"
                >
                  ← Back
                </button>
              </div>
            </>
          )}

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PLAYING                                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {gameStage === 'playing' && currentLevel && (
        <div className="relative flex flex-1 flex-col overflow-hidden">

          {/* ── Stats bar ────────────────────────────────────────────────── */}
          {mode === 'reaction' ? (
            <div className="shrink-0 flex items-center justify-between px-5 py-2">
              <div className="font-mono text-xs text-slate-400">
                Score<br />
                <span className="font-bold text-blue-300 text-sm">{reactionScore} pts</span>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 font-mono text-2xl font-bold transition-colors ${timerClass}`}>
                {reactionTimer}
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                Solved<br />
                <span className="font-bold text-blue-300 text-sm">{reactionPuzzleCount}</span>
              </div>
            </div>
          ) : (
            <div className="shrink-0 flex items-center justify-between px-5 py-2">
              <div className="font-mono text-xs text-blue-300">
                Level {currentLevel.id} · {currentLevel.size}×{currentLevel.size}
              </div>
              <div className="flex items-center gap-1.5">
                {paths.map(p => (
                  <div
                    key={p.color}
                    className="h-2 w-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: p.isComplete ? COLOR_MAP[p.color] : '#334155',
                      boxShadow: p.isComplete ? `0 0 4px ${COLOR_MAP[p.color]}88` : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="font-mono text-xs text-blue-300">{moveCount} moves</div>
            </div>
          )}

          {/* ── Board ────────────────────────────────────────────────────── */}
          <div
            ref={boardRef}
            className="flex flex-1 items-center justify-center overflow-hidden"
          >
            <div
              className="select-none"
              style={{ touchAction: 'none', cursor: isDrawing ? 'crosshair' : 'pointer' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  display: 'inline-grid',
                  gridTemplateColumns: `repeat(${currentLevel.size}, ${cellSize}px)`,
                  gap: '2px',
                }}
              >
                {board.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      data-cell={`${r}-${c}`}
                      className="relative rounded-sm"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: cell.color
                          ? COLOR_MAP[cell.color]
                          : 'rgba(30,41,59,0.95)',
                        border: cell.color ? 'none' : '1px solid rgba(71,85,105,0.2)',
                      }}
                    >
                      {cell.isDot && cell.color && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div
                            className="rounded-full"
                            style={{
                              width: '58%',
                              height: '58%',
                              backgroundColor: COLOR_MAP[cell.color],
                              border: '2.5px solid rgba(255,255,255,0.8)',
                              boxShadow: `0 0 8px ${COLOR_MAP[cell.color]}bb`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Reset button ─────────────────────────────────────────────── */}
          <div className="shrink-0 flex justify-center pb-3 pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-4 py-1.5 font-mono text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* ── Points flash ─────────────────────────────────────────────── */}
          {pointsFlash && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="special-text font-mono text-3xl font-bold text-blue-400">
                {pointsFlash}
              </span>
            </div>
          )}

          {/* ── Puzzle win overlay ───────────────────────────────────────── */}
          {showWinOverlay && mode === 'puzzle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="font-mono text-2xl font-bold text-blue-400">✓ PUZZLE SOLVED</p>

                <div className="space-y-1">
                  <p className="font-mono text-sm text-slate-400">Level {currentLevel.id}</p>
                  <p className="font-mono text-xs text-slate-500">{moveCount} moves</p>
                </div>

                <div className="flex gap-0.5 text-2xl">
                  {Array.from({ length: 3 }, (_, i) => (
                    <span key={i} className={i < earnedStars ? '' : 'opacity-20'}>⭐</span>
                  ))}
                </div>

                <div className="flex gap-3">
                  {(currentLevel.id as number) < 200 && (
                    <button
                      onClick={goNextLevel}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-mono text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-cyan-500"
                    >
                      Next Level →
                    </button>
                  )}
                  <button
                    onClick={goToLevelSelect}
                    className="rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 font-mono text-sm text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    Level Select
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* COMPLETE — Reaction results                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {gameStage === 'complete' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
          <p className="font-mono text-2xl font-bold text-rose-400">GAME OVER</p>

          <div className="text-center">
            <p className="font-mono text-5xl font-bold text-blue-400">{reactionPuzzleCount}</p>
            <p className="mt-1 font-mono text-sm text-slate-400">
              puzzle{reactionPuzzleCount !== 1 ? 's' : ''} solved
            </p>
            <p className="mt-2 font-mono text-sm text-slate-400">{reactionScore} pts</p>
          </div>

          <div className="text-center">
            {isNewBest ? (
              <p className="font-mono text-sm font-bold text-blue-400">⚡ NEW RECORD!</p>
            ) : (
              <p className="font-mono text-xs text-slate-600">Best: {bestReaction} pts</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={startReaction}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-mono text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-cyan-500"
            >
              ⚡ Play Again
            </button>
            <button
              onClick={resetToSetup}
              className="rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 font-mono text-sm text-slate-300 transition-colors hover:bg-slate-700"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
