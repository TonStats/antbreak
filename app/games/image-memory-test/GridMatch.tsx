'use client'

import { useState, useEffect, useRef } from 'react'
import { getGridCards } from '@/data/memoryContent'
import type { MemoryCard, Difficulty } from '@/types/memory'
import Confetti from './Confetti'
import { downloadShareBadge } from './shareUtils'

const PEEK_SECS    = 3
const FLIP_BACK_MS = 1000

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const TOTAL_PAIRS: Record<Difficulty, number> = { easy: 8, medium: 12, hard: 15, expert: 18 }
const GRID_COLS:   Record<Difficulty, string>  = {
  easy:   'grid-cols-4',
  medium: 'grid-cols-4 sm:grid-cols-6',
  hard:   'grid-cols-6',
  expert: 'grid-cols-6',
}

function efficiencyLabel(eff: number): { label: string; cls: string } {
  if (eff >= 85) return { label: 'Excellent',      cls: 'text-green-400'  }
  if (eff >= 65) return { label: 'Great',          cls: 'text-teal-400'   }
  if (eff >= 50) return { label: 'Good',           cls: 'text-yellow-400' }
  return               { label: 'Keep Practising', cls: 'text-purple-300' }
}

interface Props { difficulty: Difficulty; theme: string; onQuit: () => void }

export default function GridMatch({ difficulty, theme, onQuit }: Props) {
  const [cards,         setCards]         = useState<MemoryCard[]>([])
  const [flippedCards,  setFlippedCards]  = useState<string[]>([])
  const [matchedPairs,  setMatchedPairs]  = useState(0)
  const [flips,         setFlips]         = useState(0)
  const [peekPhase,     setPeekPhase]     = useState(true)
  const [peekCountdown, setPeekCountdown] = useState(PEEK_SECS)
  const [gameWon,       setGameWon]       = useState(false)
  const [finalScore,    setFinalScore]    = useState(0)
  const [isNewBest,     setIsNewBest]     = useState(false)
  const [savedBest,     setSavedBest]     = useState(0)
  const [gameKey,       setGameKey]       = useState(0)

  const processingRef = useRef(false)
  const emojiMapRef   = useRef<Map<string, string>>(new Map())
  const matchedRef    = useRef(0)
  const flipsRef      = useRef(0)
  const peekTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalPairs = TOTAL_PAIRS[difficulty]

  useEffect(() => {
    if (peekTimerRef.current) clearInterval(peekTimerRef.current)

    const initial = getGridCards(difficulty, theme)
    emojiMapRef.current   = new Map(initial.map((c) => [c.id, c.emoji]))
    matchedRef.current    = 0
    flipsRef.current      = 0
    processingRef.current = false

    setCards(initial)
    setFlippedCards([])
    setMatchedPairs(0)
    setFlips(0)
    setPeekPhase(true)
    setPeekCountdown(PEEK_SECS)
    setGameWon(false)
    setFinalScore(0)
    setIsNewBest(false)

    let count = PEEK_SECS
    peekTimerRef.current = setInterval(() => {
      count--
      setPeekCountdown(count)
      if (count <= 0) {
        clearInterval(peekTimerRef.current!)
        peekTimerRef.current = null
        setPeekPhase(false)
      }
    }, 1000)

    return () => {
      if (peekTimerRef.current) clearInterval(peekTimerRef.current)
    }
  }, [difficulty, theme, gameKey])

  async function handleCardFlip(cardId: string) {
    if (processingRef.current || peekPhase || gameWon) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    if (flippedCards.length >= 2) return

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))
    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    if (newFlipped.length < 2) return

    processingRef.current = true
    const newFlips = flipsRef.current + 1
    flipsRef.current = newFlips
    setFlips(newFlips)

    const [id1, id2] = newFlipped
    const emoji1 = emojiMapRef.current.get(id1)
    const emoji2 = emojiMapRef.current.get(id2)

    if (emoji1 === emoji2) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === id1 || c.id === id2 ? { ...c, isFlipped: true, isMatched: true } : c,
        ),
      )
      setFlippedCards([])

      const newMatched = matchedRef.current + 1
      matchedRef.current = newMatched
      setMatchedPairs(newMatched)

      if (newMatched === totalPairs) {
        const score   = Math.max(totalPairs * 1000 - newFlips * 50, totalPairs * 100)
        const key     = `memory_best_grid_${difficulty}`
        const best    = Number(localStorage.getItem(key) ?? 0)
        const newBest = score > best
        if (newBest) localStorage.setItem(key, String(score))
        setFinalScore(score)
        setIsNewBest(newBest)
        setSavedBest(newBest ? score : best)
        setGameWon(true)
      }

      processingRef.current = false
    } else {
      await delay(FLIP_BACK_MS)
      setCards((prev) =>
        prev.map((c) => (c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c)),
      )
      setFlippedCards([])
      processingRef.current = false
    }
  }

  // ── Win screen ─────────────────────────────────────────────────────────
  if (gameWon) {
    const efficiency   = Math.round((totalPairs / flipsRef.current) * 100)
    const effInfo      = efficiencyLabel(efficiency)
    const showConfetti = efficiency >= 70

    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-4">
        <Confetti active={showConfetti} />

        <div className="text-5xl">🃏</div>
        <h3 className="text-2xl font-bold text-white">All Pairs Found!</h3>

        <div className="flex gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-pink-300">{finalScore}</p>
            <p className="mt-0.5 text-xs text-purple-300/50">score</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-200">{flipsRef.current}</p>
            <p className="mt-0.5 text-xs text-purple-300/50">flips</p>
          </div>
          <div>
            <p className={`text-3xl font-bold ${effInfo.cls}`}>{efficiency}%</p>
            <p className="mt-0.5 text-xs text-purple-300/50">{effInfo.label}</p>
          </div>
        </div>

        <p className={`text-xs ${isNewBest ? 'animate-sparkle text-amber-400' : 'text-purple-300/50'}`}>
          {isNewBest ? `★ New Personal Best! ${savedBest} pts` : `Your best: ${savedBest} pts`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setGameKey((k) => k + 1)}
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
              mode:     'Grid Match',
              mainStat: `${efficiency}%`,
              subLabel: `${effInfo.label} — ${flipsRef.current} flips`,
              score:    finalScore,
            })
          }
          className="text-xs text-purple-400/50 underline transition-colors hover:text-purple-300/70"
        >
          ↓ Share result
        </button>
      </div>
    )
  }

  // ── Game screen ────────────────────────────────────────────────────────
  const efficiency =
    flips === 0 ? '—' : Math.round((matchedPairs / flips) * 100) + '%'

  return (
    <div className="flex h-full flex-col gap-3">

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm text-purple-200">
          <span>Pairs: <span className="font-semibold text-white">{matchedPairs}/{totalPairs}</span></span>
          <span>Flips: <span className="font-semibold text-white">{flips}</span></span>
          <span>Eff: <span className="font-semibold text-pink-300">{efficiency}</span></span>
        </div>
        <button
          onClick={onQuit}
          className="text-xs text-white/20 transition-colors hover:text-red-400"
        >
          ⬛ quit
        </button>
      </div>

      {/* Peek countdown */}
      {peekPhase && (
        <div className="rounded-xl bg-black/30 py-2 text-center text-2xl font-bold text-white">
          {peekCountdown > 0 ? `Memorise! ${peekCountdown}s` : 'Remember!'}
        </div>
      )}

      {/* Card grid */}
      <div className="flex flex-1 items-center justify-center overflow-auto">
        <div className={`grid ${GRID_COLS[difficulty]} gap-2`}>
          {cards.map((card) => {
            const isRevealed = peekPhase || card.isFlipped || card.isMatched
            return (
              <div
                key={card.id}
                className="memory-card aspect-square cursor-pointer"
                onClick={() => handleCardFlip(card.id)}
              >
                <div className={`memory-card-inner${isRevealed ? ' flipped' : ''}`}>

                  {/* Face-down */}
                  <div className="memory-card-face flex items-center justify-center border border-purple-600/30 bg-gradient-to-br from-indigo-800 to-purple-900 transition hover:border-purple-400/60 hover:shadow-md hover:shadow-purple-500/20">
                    <span className="text-2xl text-purple-500/30">✦</span>
                  </div>

                  {/* Face-up */}
                  <div
                    className={[
                      'memory-card-face memory-card-back flex items-center justify-center',
                      card.isMatched
                        ? 'border-2 border-green-400/50 bg-gradient-to-br from-green-800/40 to-emerald-800/40 opacity-70'
                        : 'border-2 border-purple-400/50 bg-gradient-to-br from-purple-700/50 to-pink-700/50',
                    ].join(' ')}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <span className="text-3xl">{card.emoji}</span>
                      {card.isMatched && (
                        <span className="text-xs text-green-400/70">✓</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
