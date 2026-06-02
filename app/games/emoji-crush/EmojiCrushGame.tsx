'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Sparkles, Maximize2, Minimize2, X } from 'lucide-react'
import { LEVELS } from '@/data/emojiLevels'
import { EMOJI_THEMES, BOMB_EMOJI, RAINBOW_EMOJI } from '@/types/emojiCrush'
import type { Cell, Level, LevelTarget } from '@/types/emojiCrush'
import {
  GRID_SIZE,
  createBoard,
  swapCells,
  findMatches,
  applyMatches,
  applyGravity,
  isValidSwap,
  hasAvailableMoves,
  activateBomb,
  activateRainbow,
} from '@/lib/emojiCrush'
import Confetti from '../image-memory-test/Confetti'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms))

// ─── Types ────────────────────────────────────────────────────────────────────

interface Progress {
  highestUnlocked: number
  levelStars: Record<number, number>
}

const DEFAULT_PROGRESS: Progress = { highestUnlocked: 1, levelStars: {} }

interface SpecialText {
  text: string
  color: string
  key: number
}

// ─── GameCell ─────────────────────────────────────────────────────────────────

interface CellProps {
  cell: Cell
  r: number
  c: number
  cellSize: number
  isSelected: boolean
  isExploding: boolean
  onClick: (r: number, c: number) => void
}

const GameCell = memo(function GameCell({
  cell, r, c, cellSize, isSelected, isExploding, onClick,
}: CellProps) {
  const fontSize = Math.min(Math.max(Math.round(cellSize * 0.55), 20), 30)

  let cls = 'flex items-center justify-center select-none rounded-xl '

  if (cell.obstacle === 'stone') {
    cls += 'bg-stone-600/80 cursor-not-allowed '
  } else if (cell.obstacle === 'locked') {
    cls += 'bg-slate-700/80 cursor-not-allowed '
  } else if (cell.isMatched) {
    cls += 'bg-white/10 opacity-0 scale-0 transition-all duration-200 '
  } else if (isSelected) {
    cls += 'bg-yellow-400/20 ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent scale-110 cursor-pointer transition-transform duration-100 '
  } else if (cell.type === 'bomb') {
    cls += 'bg-red-500/30 border border-red-400 ring-1 ring-red-400/50 animate-pulse cursor-pointer hover:scale-105 transition-transform duration-100 '
  } else if (cell.type === 'rainbow') {
    cls += 'bg-gradient-to-br from-red-400/20 to-violet-400/20 border border-white/30 cursor-pointer hover:scale-105 transition-transform duration-100 '
  } else {
    cls += 'bg-white/10 cursor-pointer hover:scale-105 hover:bg-white/20 transition-transform duration-100 '
  }

  if (cell.isNew)     cls += 'cell-new '
  if (cell.isFalling) cls += 'cell-falling '
  if (isExploding)    cls += 'cell-exploding '

  return (
    <div
      className={cls}
      style={{ width: cellSize, height: cellSize, fontSize }}
      onClick={() => {
        if (cell.obstacle === 'stone' || cell.obstacle === 'locked') return
        onClick(r, c)
      }}
      role="button"
      aria-label={cell.emoji || 'empty cell'}
    >
      {cell.emoji}
    </div>
  )
})
GameCell.displayName = 'GameCell'

// ─── EmojiCrushGame ───────────────────────────────────────────────────────────

export default function EmojiCrushGame() {
  const cardRef = useRef<HTMLDivElement>(null)

  // ── UI ──────────────────────────────────────────────────────────────────
  const [isFullscreen,  setIsFullscreen]  = useState(false)
  const [stage,         setStage]         = useState<'setup' | 'playing'>('setup')
  const [cellSize,      setCellSize]      = useState(48)

  // ── Progress ─────────────────────────────────────────────────────────
  const [progress,      setProgress]      = useState<Progress>(DEFAULT_PROGRESS)
  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVELS[0])
  const [currentLevel,  setCurrentLevel]  = useState<Level>(LEVELS[0])

  // ── Game ─────────────────────────────────────────────────────────────
  const [board,         setBoard]         = useState<Cell[][]>([])
  const [selectedCell,  setSelectedCell]  = useState<{ r: number; c: number } | null>(null)
  const [movesLeft,     setMovesLeft]     = useState(0)
  const [score,         setScore]         = useState(0)
  const [finalScore,    setFinalScore]    = useState(0)
  const [targets,       setTargets]       = useState<LevelTarget[]>([])
  const [isAnimating,   setIsAnimating]   = useState(false)
  const [gameResult,    setGameResult]    = useState<'playing' | 'won' | 'lost'>('playing')
  const [comboCount,    setComboCount]    = useState(0)
  const [showCombo,     setShowCombo]     = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)

  // special-effect state
  const [bombedCells,   setBombedCells]   = useState<Set<string>>(new Set())
  const [specialTexts,  setSpecialTexts]  = useState<SpecialText[]>([])

  // ── Refs for async handlers ──────────────────────────────────────────
  const movesLeftRef    = useRef(0)
  const scoreRef        = useRef(0)
  const targetsRef      = useRef<LevelTarget[]>([])
  const currentLevelRef = useRef<Level>(LEVELS[0])
  const progressRef     = useRef<Progress>(DEFAULT_PROGRESS)
  const isAnimatingRef  = useRef(false)
  const gameResultRef   = useRef<'playing' | 'won' | 'lost'>('playing')
  const specialTextKey  = useRef(0)

  useEffect(() => { progressRef.current = progress }, [progress])

  // ── Load saved progress ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('emoji_progress')
      if (raw) {
        const parsed = JSON.parse(raw) as Progress
        setProgress(parsed)
        progressRef.current = parsed
      }
    } catch {}
  }, [])

  // ── Fullscreen listener ──────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // ── Escape key ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) document.exitFullscreen?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  // ── ResizeObserver (mobile-aware) ───────────────────────────────────
  useEffect(() => {
    if (!cardRef.current) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      const isMobile = width < 640
      const maxSize  = isMobile ? 44  : 56
      const overhead = isMobile ? 300 : 220
      const hPad     = isMobile ? 20  : 40
      const minSize  = isMobile ? 32  : 36
      const size = Math.min(
        Math.floor((height - overhead) / GRID_SIZE),
        Math.floor((width  - hPad)     / GRID_SIZE),
        maxSize,
      )
      setCellSize(Math.max(size, minSize))
    })
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────

  function toggleFullscreen() {
    if (!document.fullscreenElement) cardRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const isLevelUnlocked = (lv: Level) =>
    lv.id === 1 || lv.id <= progress.highestUnlocked

  const starsFor = (lv: Level) => progress.levelStars[lv.id] ?? 0

  function computeStars(s: number, lv: Level): number {
    if (s >= lv.starThresholds[2]) return 3
    if (s >= lv.starThresholds[1]) return 2
    return 1
  }

  // ── Special-effect helpers ────────────────────────────────────────────

  function showBombExplosion(r: number, c: number) {
    const keys = new Set<string>()
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          keys.add(`${nr},${nc}`)
        }
      }
    }
    setBombedCells(keys)
    setTimeout(() => setBombedCells(new Set()), 350)
  }

  function addSpecialText(text: string, color: string) {
    const key = ++specialTextKey.current
    setSpecialTexts(prev => [...prev, { text, color, key }])
    setTimeout(() => setSpecialTexts(prev => prev.filter(t => t.key !== key)), 950)
  }

  // ── Level init ────────────────────────────────────────────────────────

  function initLevel(lv: Level) {
    const freshTargets = lv.targets.map(t => ({ ...t, collected: 0 }))
    targetsRef.current      = freshTargets
    movesLeftRef.current    = lv.moves
    scoreRef.current        = 0
    currentLevelRef.current = lv
    gameResultRef.current   = 'playing'
    isAnimatingRef.current  = false

    setBoard(createBoard(lv))
    setTargets(freshTargets)
    setMovesLeft(lv.moves)
    setScore(0)
    setFinalScore(0)
    setSelectedCell(null)
    setGameResult('playing')
    setComboCount(0)
    setIsAnimating(false)
    setCurrentLevel(lv)
    setConfettiActive(false)
    setBombedCells(new Set())
    setSpecialTexts([])
  }

  function handleStartLevel() {
    initLevel(selectedLevel)
    setStage('playing')
  }

  // ── Target tracking ──────────────────────────────────────────────────

  function updateTargets(collectedEmoji: string[]) {
    const updated = targetsRef.current.map(t => {
      const added = collectedEmoji.filter(e => e === t.emoji).length
      return { ...t, collected: Math.min(t.collected + added, t.count) }
    })
    targetsRef.current = updated
    setTargets(updated)
  }

  // ── Save progress ────────────────────────────────────────────────────

  function saveProgress(fs: number) {
    const lv      = currentLevelRef.current
    const earned  = computeStars(fs, lv)
    const prev    = progressRef.current
    const best    = Math.max(prev.levelStars[lv.id] ?? 0, earned)
    const highest = Math.min(Math.max(prev.highestUnlocked, lv.id + 1), LEVELS.length)
    const next: Progress = {
      highestUnlocked: highest,
      levelStars: { ...prev.levelStars, [lv.id]: best },
    }
    setProgress(next)
    progressRef.current = next
    try { localStorage.setItem('emoji_progress', JSON.stringify(next)) } catch {}
  }

  // ── Check win / lose ──────────────────────────────────────────────────

  function checkGameState(currentBoard: Cell[][]) {
    if (gameResultRef.current !== 'playing') return

    const allMet = targetsRef.current.every(t => t.collected >= t.count)
    if (allMet) {
      const fs = scoreRef.current
      gameResultRef.current = 'won'
      setFinalScore(fs)
      setGameResult('won')
      saveProgress(fs)
      if (computeStars(fs, currentLevelRef.current) === 3) {
        setConfettiActive(true)
        setTimeout(() => setConfettiActive(false), 3600)
      }
      return
    }

    if (movesLeftRef.current <= 0) {
      gameResultRef.current = 'lost'
      setGameResult('lost')
      return
    }

    if (!hasAvailableMoves(currentBoard)) {
      setBoard(createBoard(currentLevelRef.current))
    }
  }

  // ── Cascade processor ────────────────────────────────────────────────

  async function processMatchesCascade(
    currentBoard: Cell[][],
    matches: { row: number; col: number }[][],
    swapPos: { r: number; c: number },
    combo: number,
    rainbowTarget: string | null,
  ): Promise<void> {
    if (matches.length === 0) {
      isAnimatingRef.current = false
      setIsAnimating(false)
      setComboCount(0)
      checkGameState(currentBoard)
      return
    }

    if (combo > 0) {
      setComboCount(combo)
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 800)
    }

    // ── Scan for specials in current board (before clearing) ──────────
    const bombPositions: { r: number; c: number }[] = []
    let   rainbowFound = false
    let   cascadeRainbowTarget = rainbowTarget

    for (const match of matches) {
      for (const { row, col } of match) {
        const cell = currentBoard[row][col]
        if (cell.type === 'bomb')    bombPositions.push({ r: row, c: col })
        if (cell.type === 'rainbow') rainbowFound = true
      }
    }

    // ── Apply regular matches ─────────────────────────────────────────
    const { board: afterMatch, score: pts, collectedEmoji } =
      applyMatches(currentBoard, matches, swapPos)

    // Detect if a special was just created at swapPos
    const createdCell = afterMatch[swapPos.r]?.[swapPos.c]
    if (createdCell?.type === 'bomb') {
      addSpecialText('💣 BOMB!', 'text-orange-400')
    } else if (createdCell?.type === 'rainbow') {
      addSpecialText('🌈 RAINBOW!', 'text-yellow-300')
    }

    let workingBoard = afterMatch
    let totalPts = pts
    const allCollected = [...collectedEmoji]

    // ── Activate bombs ────────────────────────────────────────────────
    for (const { r, c } of bombPositions) {
      showBombExplosion(r, c)
      const result = activateBomb(workingBoard, r, c)
      workingBoard = result.board
      totalPts    += result.score
      allCollected.push(...result.collected)
    }

    // ── Activate rainbows ──────────────────────────────────────────────
    if (rainbowFound) {
      // Determine target: explicit swap partner > first collected emoji in match
      if (!cascadeRainbowTarget && allCollected.length > 0) {
        cascadeRainbowTarget = allCollected[0]
      }
      if (cascadeRainbowTarget) {
        const result = activateRainbow(workingBoard, cascadeRainbowTarget)
        workingBoard = result.board
        totalPts    += result.score
        allCollected.push(...result.collected)
      }
    }

    scoreRef.current += totalPts
    setScore(scoreRef.current)
    updateTargets(allCollected)
    setBoard(workingBoard)
    await delay(300)

    const theme = EMOJI_THEMES[currentLevelRef.current.theme]
    const afterGravity = applyGravity(workingBoard, theme)
    setBoard(afterGravity)
    await delay(400)

    const newMatches = findMatches(afterGravity)
    await processMatchesCascade(afterGravity, newMatches, swapPos, combo + 1, null)
  }

  // ── Swap handler ──────────────────────────────────────────────────────

  async function handleSwap(r1: number, c1: number, r2: number, c2: number) {
    isAnimatingRef.current = true
    setIsAnimating(true)

    const capturedBoard = board
    const cell1 = capturedBoard[r1][c1]
    const cell2 = capturedBoard[r2][c2]

    // Detect rainbow target before the swap
    let rainbowTarget: string | null = null
    if (cell1.type === 'rainbow' && cell2.type !== 'rainbow') {
      rainbowTarget = cell2.emoji
    } else if (cell2.type === 'rainbow' && cell1.type !== 'rainbow') {
      rainbowTarget = cell1.emoji
    }

    const swapped = swapCells(capturedBoard, r1, c1, r2, c2)
    const matches = findMatches(swapped)

    if (matches.length === 0 && !rainbowTarget) {
      // Invalid swap — animate back
      setBoard(swapped)
      await delay(300)
      setBoard(capturedBoard)
      isAnimatingRef.current = false
      setIsAnimating(false)
      return
    }

    setBoard(swapped)
    movesLeftRef.current -= 1
    setMovesLeft(movesLeftRef.current)
    await delay(200)

    await processMatchesCascade(swapped, matches, { r: r2, c: c2 }, 0, rainbowTarget)
  }

  // ── Cell click handler (stable ref pattern for React.memo) ───────────

  const handleCellClickRef = useRef<(r: number, c: number) => void>(() => {})

  function handleCellClick(r: number, c: number) {
    if (isAnimatingRef.current) return
    if (gameResultRef.current !== 'playing') return

    const cell = board[r]?.[c]
    if (!cell || cell.obstacle === 'stone' || cell.obstacle === 'locked') return

    if (!selectedCell) {
      setSelectedCell({ r, c })
      return
    }

    if (selectedCell.r === r && selectedCell.c === c) {
      setSelectedCell(null)
      return
    }

    if (isValidSwap(selectedCell.r, selectedCell.c, r, c)) {
      const { r: sr, c: sc } = selectedCell
      setSelectedCell(null)
      handleSwap(sr, sc, r, c)
    } else {
      setSelectedCell({ r, c })
    }
  }

  // Always points to the latest handleCellClick — stable reference for GameCell
  handleCellClickRef.current = handleCellClick
  const stableCellClick = useCallback((r: number, c: number) => {
    handleCellClickRef.current(r, c)
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="flex flex-col rounded-2xl emoji-crush-card overflow-hidden bg-gradient-to-b from-sky-900 to-violet-900"
      style={{
        height: 'calc(100vh - 100px)',
        minHeight: '580px',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.12), ' +
          '0 0 40px rgba(147,197,253,0.1), ' +
          '0 25px 50px rgba(0,0,0,0.5)',
      }}
    >

      {/* ── Title Row ──────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-300" />
          <span className="text-2xl font-bold text-white">✨ Emoji Crush</span>
        </div>
        <div className="flex items-center gap-2">
          {stage === 'playing' && (
            <button
              onClick={() => setStage('setup')}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" /> Quit
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen
              ? <Minimize2 className="h-4 w-4" />
              : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="h-px shrink-0 bg-white/10" />

      {/* ── Setup Screen ───────────────────────────────────────────────────── */}
      {stage === 'setup' && (
        <div className="flex flex-1 flex-col justify-center overflow-y-auto px-5 py-4">

          <p className="mb-3 text-center text-xs uppercase tracking-[0.4em] text-white/40">
            Story Mode
          </p>

          {/* 10 × 5 level grid */}
          <div className="grid grid-cols-10 gap-1.5">
            {LEVELS.map(lv => {
              const unlocked  = isLevelUnlocked(lv)
              const stars     = starsFor(lv)
              const completed = stars > 0
              const isSel     = selectedLevel.id === lv.id

              let cls = 'w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all '
              if (completed) {
                cls += 'bg-yellow-400 text-yellow-900 '
                cls += isSel ? 'ring-2 ring-white/80 scale-110 ' : 'hover:scale-105 '
              } else if (unlocked) {
                cls += 'bg-white/20 text-white hover:bg-white/30 '
                cls += isSel ? 'ring-2 ring-sky-300 scale-110 ' : 'hover:scale-105 '
              } else {
                cls += 'bg-black/20 text-white/20 cursor-not-allowed '
              }

              return (
                <button
                  key={lv.id}
                  className={cls}
                  onClick={() => unlocked && setSelectedLevel(lv)}
                  disabled={!unlocked}
                  aria-label={`Level ${lv.id}`}
                >
                  {completed
                    ? <span className="text-[9px] leading-none">{'⭐'.repeat(stars)}</span>
                    : unlocked ? lv.id : '🔒'}
                </button>
              )
            })}
          </div>

          {/* Level preview */}
          <div className="mt-4 rounded-2xl bg-black/20 p-4">
            <p className="text-base font-bold text-white">
              Level {selectedLevel.id} — {selectedLevel.description}
            </p>
            <div className="mt-2 flex items-center gap-1">
              {EMOJI_THEMES[selectedLevel.theme].slice(0, 4).map((em, i) => (
                <span key={i} className="text-2xl leading-none">{em}</span>
              ))}
              <span className="ml-2 text-xs capitalize text-white/40">{selectedLevel.theme}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {selectedLevel.targets.map((t, i) => (
                <span key={i} className="text-sm text-white">{t.emoji} × {t.count}</span>
              ))}
              <span className="text-sm text-sky-200">💫 {selectedLevel.moves} moves</span>
            </div>
            {starsFor(selectedLevel) > 0 && (
              <p className="mt-1 text-sm text-yellow-400">
                {'⭐'.repeat(starsFor(selectedLevel))} earned
              </p>
            )}
            <button
              onClick={handleStartLevel}
              className="mt-3 w-full rounded-xl bg-yellow-400 py-3 text-sm font-bold text-yellow-900 shadow-lg shadow-yellow-400/30 transition-colors hover:bg-yellow-300"
            >
              {starsFor(selectedLevel) > 0 ? '▶ Play Again' : '▶ Start Level'}
            </button>
            <div className="mt-2 text-center">
              <a href="#how-to-play" className="text-xs text-white/30 underline">How to Play</a>
            </div>
          </div>

        </div>
      )}

      {/* ── Playing Screen ─────────────────────────────────────────────────── */}
      {stage === 'playing' && (
        <div className="relative flex flex-1 flex-col overflow-hidden">

          {/* Top bar */}
          <div className="flex shrink-0 items-center justify-between px-4 py-2">
            <div className="rounded-xl bg-black/20 px-3 py-1">
              <span className="font-mono text-sm font-bold text-white">💫 {movesLeft}</span>
            </div>
            <span className="text-sm font-bold text-white">{score.toLocaleString()}</span>
            <span className="text-xs text-white/60">LVL {currentLevel.id}</span>
          </div>

          {/* Targets row */}
          <div className="flex shrink-0 items-center justify-center gap-2 px-4 pb-2">
            {targets.map((t, i) => {
              const done = t.collected >= t.count
              return (
                <div
                  key={i}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    done
                      ? 'border border-green-400 bg-green-500/40 text-green-200'
                      : 'bg-black/20 text-white'
                  }`}
                >
                  {t.emoji} {t.collected}/{t.count}{done ? ' ✓' : ''}
                </div>
              )
            })}
          </div>

          {/* Grid area */}
          <div className="relative flex flex-1 items-center justify-center p-2">

            {/* Combo banner */}
            {showCombo && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <span className="animate-ping text-2xl font-bold text-yellow-300">
                  COMBO ×{comboCount}!
                </span>
              </div>
            )}

            {/* Special creation texts */}
            {specialTexts.map(st => (
              <div
                key={st.key}
                className={`special-text pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-xl font-bold ${st.color}`}
              >
                {st.text}
              </div>
            ))}

            {/* Board */}
            <div
              className="rounded-2xl bg-black/10 p-2"
              style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
                gap: '2px',
                touchAction: 'none',
              }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <GameCell
                    key={`cell-${r}-${c}-${cell.id}`}
                    cell={cell}
                    r={r}
                    c={c}
                    cellSize={cellSize}
                    isSelected={selectedCell?.r === r && selectedCell?.c === c}
                    isExploding={bombedCells.has(`${r},${c}`)}
                    onClick={stableCellClick}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── WIN OVERLAY ─────────────────────────────────────────────────── */}
          {gameResult === 'won' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-yellow-500/90 to-amber-600/90">

              {/* Confetti canvas */}
              <Confetti active={confettiActive} />

              <p className="text-center text-6xl">
                {'⭐'.repeat(computeStars(finalScore, currentLevel))}
              </p>

              <p className="mt-3 text-3xl font-bold text-white">LEVEL COMPLETE!</p>
              <p className="mt-1 text-xl text-yellow-100">
                Score: {finalScore.toLocaleString()}
              </p>

              {/* Target summary */}
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {targets.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-green-500/30 px-3 py-1 text-sm font-bold text-green-100"
                  >
                    {t.emoji} {t.count}/{t.count} ✓
                  </span>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStage('setup')}
                  className="rounded-xl bg-yellow-600/50 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-yellow-600/70"
                >
                  Levels
                </button>
                {currentLevel.id < LEVELS.length && (
                  <button
                    onClick={() => {
                      const next = LEVELS[currentLevel.id]
                      if (next) { setSelectedLevel(next); initLevel(next) }
                    }}
                    className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-yellow-600 transition-colors hover:bg-yellow-50"
                  >
                    Next Level →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── LOSE OVERLAY ────────────────────────────────────────────────── */}
          {gameResult === 'lost' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-slate-900/95 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">OUT OF MOVES</p>
              <p className="mt-1 text-base text-zinc-400">
                Score: {score.toLocaleString()}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStage('setup')}
                  className="rounded-xl bg-zinc-700 px-8 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-zinc-600"
                >
                  Levels
                </button>
                <button
                  onClick={() => initLevel(currentLevel)}
                  className="rounded-xl bg-sky-500 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-400"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
