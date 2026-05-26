'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSequenceEmojis } from '@/data/memoryContent'
import Confetti from './Confetti'
import { downloadShareBadge } from './shareUtils'

type SeqMode = 'showing' | 'input' | 'feedback-correct' | 'feedback-wrong'

const SHOW_MS  = 600
const GAP_MS   = 300
const INIT_MS  = 500
const OK_MS    = 1200
const FAIL_MS  = 1500

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function levelBadge(lv: number): { label: string; cls: string } {
  if (lv >= 10) return { label: 'Master',     cls: 'text-amber-400 border-amber-400/50 bg-amber-400/10'   }
  if (lv >= 6)  return { label: 'Advanced',   cls: 'text-teal-400 border-teal-400/50 bg-teal-400/10'     }
  if (lv >= 3)  return { label: 'Developing', cls: 'text-blue-400 border-blue-400/50 bg-blue-400/10'     }
  return               { label: 'Beginner',   cls: 'text-purple-300 border-purple-300/50 bg-purple-300/10' }
}

interface Props { onQuit: () => void }

export default function SequenceRecall({ onQuit }: Props) {
  const [seqMode,       setSeqMode]       = useState<SeqMode>('showing')
  const [gridEmojis,    setGridEmojis]    = useState<string[]>([])
  const [sequence,      setSequence]      = useState<string[]>([])
  const [showPositions, setShowPositions] = useState<number[]>([])
  const [playerInput,   setPlayerInput]   = useState<string[]>([])
  const [activeIndex,   setActiveIndex]   = useState(-1)
  const [level,         setLevel]         = useState(1)
  const [score,         setScore]         = useState(0)
  const [wrongPos,      setWrongPos]      = useState(-1)
  const [gameOver,      setGameOver]      = useState(false)
  const [isNewBest,     setIsNewBest]     = useState(false)
  const [savedBest,     setSavedBest]     = useState(0)

  const showingRef    = useRef(false)
  const processingRef = useRef(false)

  const startLevel = useCallback(async (lv: number) => {
    if (showingRef.current) return
    showingRef.current    = true
    processingRef.current = false

    const rawEmojis = getSequenceEmojis(lv)
    const grid      = fisherYates(rawEmojis)
    const positions = fisherYates([...Array(rawEmojis.length).keys()])
    const seq       = positions.map((p) => grid[p])

    setGridEmojis(grid)
    setSequence(seq)
    setShowPositions(positions)
    setPlayerInput([])
    setWrongPos(-1)
    setActiveIndex(-1)
    setSeqMode('showing')

    await delay(INIT_MS)
    for (let i = 0; i < positions.length; i++) {
      setActiveIndex(positions[i])
      await delay(SHOW_MS)
      setActiveIndex(-1)
      await delay(GAP_MS)
    }

    setSeqMode('input')
    showingRef.current = false
  }, [])

  useEffect(() => {
    startLevel(1)
  }, [startLevel])

  async function handleTap(pos: number) {
    if (processingRef.current || seqMode !== 'input' || pos >= gridEmojis.length) return
    processingRef.current = true

    const emoji    = gridEmojis[pos]
    const newInput = [...playerInput, emoji]
    const idx      = newInput.length - 1

    setPlayerInput(newInput)

    if (emoji !== sequence[idx]) {
      setWrongPos(pos)
      setSeqMode('feedback-wrong')
      await delay(FAIL_MS)

      const achieved = level - 1
      const best     = Number(localStorage.getItem('memory_best_sequence') ?? 0)
      const newBest  = achieved > best
      if (newBest) localStorage.setItem('memory_best_sequence', String(achieved))
      setIsNewBest(newBest)
      setSavedBest(newBest ? achieved : best)
      setGameOver(true)
      processingRef.current = false
      return
    }

    if (newInput.length === sequence.length) {
      setScore((prev) => prev + level * 100)
      setSeqMode('feedback-correct')
      await delay(OK_MS)
      const next = level + 1
      setLevel(next)
      await startLevel(next)
      return
    }

    processingRef.current = false
  }

  async function handleReplay() {
    if (seqMode !== 'input' || showingRef.current) return
    setScore((prev) => Math.max(0, prev - 50))
    setPlayerInput([])
    await startLevel(level)
  }

  function restart() {
    setGameOver(false)
    setIsNewBest(false)
    setLevel(1)
    setScore(0)
    startLevel(1)
  }

  // ── Game over ──────────────────────────────────────────────────────────
  if (gameOver) {
    const reached      = level - 1
    const badge        = levelBadge(reached)
    const showConfetti = reached >= 5

    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-4">
        <Confetti active={showConfetti} />

        <div className="text-5xl">🧠</div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">Game Over!</h3>
          <p className="mt-1 text-purple-200/70">
            You reached <span className="font-bold text-white">Level {level}</span>
          </p>
        </div>

        <span className={`rounded-full border px-4 py-1 text-sm font-semibold ${badge.cls}`}>
          {badge.label}
        </span>

        <div className="text-center">
          <p className="text-3xl font-bold text-pink-300">{score}</p>
          <p className="mt-0.5 text-xs text-purple-300/50">points</p>
        </div>

        <p className={`text-xs ${isNewBest ? 'animate-sparkle text-amber-400' : 'text-purple-300/50'}`}>
          {isNewBest ? `★ New Personal Best! Level ${savedBest}` : `Your best: Level ${savedBest}`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-bold text-white transition-all hover:from-purple-500 hover:to-pink-500"
          >
            Play Again
          </button>
          <button
            onClick={onQuit}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-white/60 transition-all hover:text-white/80"
          >
            Change Mode
          </button>
        </div>

        <button
          onClick={() =>
            downloadShareBadge({
              mode:     'Sequence Recall',
              mainStat: `Lvl ${reached}`,
              subLabel: badge.label,
              score,
            })
          }
          className="text-xs text-purple-400/50 underline transition-colors hover:text-purple-300/70"
        >
          ↓ Share result
        </button>
      </div>
    )
  }

  // ── Status bar helpers ─────────────────────────────────────────────────
  const instrMap: Record<SeqMode, { text: string; cls: string }> = {
    'showing':          { text: 'Watch carefully…',       cls: 'animate-pulse text-purple-200' },
    'input':            { text: 'Now repeat the sequence', cls: 'font-semibold text-white'      },
    'feedback-correct': { text: '✓ Perfect! Get ready…',  cls: 'text-green-400'                },
    'feedback-wrong':   { text: '✗ Wrong sequence',        cls: 'text-red-400'                  },
  }
  const instr = instrMap[seqMode]

  const tappedSet = new Set(playerInput.map((e) => gridEmojis.indexOf(e)))

  return (
    <div className="flex h-full flex-col gap-3">

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-purple-500/30 px-3 py-1 text-sm text-purple-200">
          Level {level}
        </span>
        <span className="text-xs text-white/50">🧠 Sequence Recall</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-pink-300">{score} pts</span>
          <button
            onClick={onQuit}
            className="ml-2 text-xs text-white/20 transition-colors hover:text-red-400"
          >
            ⬛ quit
          </button>
        </div>
      </div>

      {/* Instruction */}
      <p className={`text-center text-base ${instr.cls}`}>{instr.text}</p>

      {/* 3×3 grid */}
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto grid w-full max-w-[360px] grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, pos) => {
            const emoji   = gridEmojis[pos]
            const isEmpty = emoji === undefined

            const isActive  = !isEmpty && activeIndex === pos && seqMode === 'showing'
            const isWrong   = !isEmpty && wrongPos === pos && seqMode === 'feedback-wrong'
            const isCorrect = !isEmpty && seqMode === 'feedback-correct'
            const isTapped  = !isEmpty && tappedSet.has(pos) && seqMode === 'input'

            const cls = isEmpty
              ? 'cursor-default border-white/5 bg-white/5 opacity-20'
              : isWrong
              ? 'border-2 border-red-400 bg-red-500/40 [animation:shake_0.3s_ease-in-out]'
              : isCorrect
              ? 'border-2 border-green-400 bg-green-500/40'
              : isActive
              ? 'scale-110 border-2 border-purple-300 bg-purple-500/60 shadow-lg shadow-purple-500/50'
              : isTapped
              ? 'scale-105 border-2 border-pink-300 bg-pink-500/40'
              : 'border border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/10 active:scale-95'

            return (
              <button
                key={pos}
                type="button"
                disabled={seqMode !== 'input' || isEmpty}
                onClick={() => handleTap(pos)}
                className={[
                  'flex aspect-square min-h-[60px] select-none items-center justify-center',
                  'rounded-2xl text-3xl sm:text-4xl transition-all duration-150 sm:min-h-[72px]',
                  cls,
                ].join(' ')}
              >
                {emoji ?? ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress dots + replay */}
      <div className="flex flex-col items-center gap-2 pb-1">
        <div className="flex gap-1.5">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i < playerInput.length ? 'bg-purple-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {seqMode === 'input' && (
          <button
            onClick={handleReplay}
            className="text-xs text-purple-400/60 underline transition-colors hover:text-purple-300/80"
          >
            ↩ Replay sequence (−50 pts)
          </button>
        )}
      </div>

    </div>
  )
}
