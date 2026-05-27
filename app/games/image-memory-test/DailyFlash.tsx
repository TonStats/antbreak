'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { getRandomFlashSet } from '@/data/memoryContent'
import type { DailyImage } from '@/types/memory'
import Confetti from './Confetti'
import { downloadShareBadge } from './shareUtils'

type Stage = 'countdown' | 'flash' | 'questions' | 'done'

const FLASH_MS       = 600
const GAP_MS         = 200
const CORRECT_ADV_MS = 800
const WRONG_ADV_MS   = 1200

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function updateStreak() {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  const lastPlay  = localStorage.getItem('memory_last_play') ?? ''
  if (lastPlay !== today) {
    const streak    = Number(localStorage.getItem('memory_streak') ?? 0)
    const newStreak = lastPlay === yesterday ? streak + 1 : 1
    localStorage.setItem('memory_streak', String(newStreak))
    localStorage.setItem('memory_last_play', today)
  }
}

interface Props { onQuit: () => void }

export default function DailyFlash({ onQuit }: Props) {
  const [stage,           setStage]           = useState<Stage>('countdown')
  const [gameKey,         setGameKey]         = useState(0)
  const [countdown,       setCountdown]       = useState(3)
  const [flashIndex,      setFlashIndex]      = useState(-1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer,  setSelectedAnswer]  = useState<string | null>(null)
  const [score,           setScore]           = useState(0)
  const [isNewBest,       setIsNewBest]       = useState(false)
  const [prevBestDaily,   setPrevBestDaily]   = useState(0)
  const [streakCount,     setStreakCount]     = useState(0)
  const [data,            setData]            = useState<DailyImage | null>(null)

  const scoreRef = useRef(0)
  const dataRef  = useRef<DailyImage | null>(null)

  useEffect(() => {
    const d = getRandomFlashSet()
    dataRef.current = d
    setData(d)
    scoreRef.current = 0
    setScore(0)
    setStage('countdown')
    setCountdown(3)
    setFlashIndex(-1)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsNewBest(false)
    setPrevBestDaily(Number(localStorage.getItem('memory_best_daily') ?? 0))

    async function run() {
      for (let i = 3; i >= 1; i--) {
        setCountdown(i)
        await delay(1000)
      }
      setStage('flash')
      await delay(400)
      for (let i = 0; i < d.emojis.length; i++) {
        setFlashIndex(i)
        await delay(FLASH_MS)
        setFlashIndex(-1)
        await delay(GAP_MS)
      }
      setFlashIndex(-2)
      await delay(500)
      setFlashIndex(-1)
      setStage('questions')
    }
    run()
  }, [gameKey])

  async function handleAnswer(selected: string) {
    if (selectedAnswer !== null || !dataRef.current) return

    const q         = dataRef.current.questions[currentQuestion]
    const isCorrect = selected === q.answer
    setSelectedAnswer(selected)

    let newScore = scoreRef.current
    if (isCorrect) {
      newScore += 5
      scoreRef.current = newScore
      setScore(newScore)
      await delay(CORRECT_ADV_MS)
    } else {
      await delay(WRONG_ADV_MS)
    }

    setSelectedAnswer(null)

    const isLast = currentQuestion + 1 >= dataRef.current.questions.length
    if (isLast) {
      saveResult(newScore)
      setStage('done')
    } else {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  function saveResult(finalScore: number) {
    updateStreak()
    setStreakCount(Number(localStorage.getItem('memory_streak') ?? 1))

    const best    = Number(localStorage.getItem('memory_best_daily') ?? 0)
    const newBest = finalScore > best
    if (newBest) localStorage.setItem('memory_best_daily', String(finalScore))
    setIsNewBest(newBest)
    setPrevBestDaily(newBest ? finalScore : best)
  }

  const QUIT_BTN = (
    <button
      onClick={onQuit}
      title="Quit to menu"
      className="bg-rose-950/40 border border-rose-700/60 text-rose-400 hover:bg-rose-900/60 hover:border-rose-500 hover:text-rose-300 rounded-lg p-2 w-9 h-9 flex items-center justify-center transition-all duration-150"
    >
      <X size={18} />
    </button>
  )

  // ── Countdown ─────────────────────────────────────────────────────────
  if (stage === 'countdown') {
    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-6">
        <div className="absolute top-0 right-0">{QUIT_BTN}</div>
        <div className="text-6xl">👁️</div>
        <h3 className="text-2xl font-bold text-white">Get Ready!</h3>
        <p className="text-sm text-purple-200">5 images will flash on screen</p>
        <p className="font-mono text-4xl text-purple-300">{countdown}</p>
      </div>
    )
  }

  // ── Flash ─────────────────────────────────────────────────────────────
  if (stage === 'flash') {
    return (
      <div className="relative flex h-full flex-col items-center justify-center">
        <div className="absolute top-0 right-0">{QUIT_BTN}</div>
        {flashIndex === -2 ? (
          <span className="text-6xl text-white">?</span>
        ) : flashIndex >= 0 && data ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center rounded-2xl bg-purple-500/10 p-8 ring-8 ring-purple-500/30">
              <span className="text-8xl">{data.emojis[flashIndex]}</span>
            </div>
            <div className="flex gap-1.5">
              {data.emojis.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i === flashIndex ? 'bg-purple-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <span className="text-6xl opacity-0">·</span>
        )}
      </div>
    )
  }

  // ── Questions ─────────────────────────────────────────────────────────
  if (stage === 'questions' && data) {
    const q        = data.questions[currentQuestion]
    const totalQ   = data.questions.length
    const maxScore = totalQ * 5
    const answered = selectedAnswer !== null

    return (
      <div className="flex h-full flex-col justify-center gap-5 px-2">

        {/* Header with quit */}
        <div className="flex items-center justify-between">
          <span className="text-purple-200/70 text-sm font-semibold">⚡ Flash Cards</span>
          {QUIT_BTN}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {Array.from({ length: totalQ }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < currentQuestion
                    ? 'bg-purple-400'
                    : i === currentQuestion
                    ? 'bg-purple-400/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="shrink-0 text-xs text-purple-300">
            {currentQuestion + 1}/{totalQ}
          </span>
        </div>

        <p className="text-right text-sm font-semibold text-pink-300">{score}/{maxScore} pts</p>

        <p className="text-center text-lg font-semibold text-white">{q.question}</p>

        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt) => {
            const isSelected  = answered && selectedAnswer === opt
            const isCorrect   = opt === q.answer
            const showCorrect = answered && isCorrect
            const showWrong   = isSelected && !isCorrect

            return (
              <button
                key={opt}
                type="button"
                disabled={answered}
                onClick={() => handleAnswer(opt)}
                className={[
                  'rounded-xl px-4 py-3 text-sm text-white transition-colors',
                  showCorrect ? 'border border-green-400 bg-green-500/30'
                    : showWrong   ? 'border border-red-400 bg-red-500/30'
                    : answered    ? 'border border-white/10 bg-white/5 opacity-50'
                    : 'cursor-pointer border border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/20',
                ].join(' ')}
              >
                <span className="text-2xl">{opt}</span>
                {showCorrect && <span className="ml-2 text-green-400">✓</span>}
                {showWrong   && <span className="ml-2 text-red-400">✗</span>}
              </button>
            )
          })}
        </div>

      </div>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────
  const maxScore  = data ? data.questions.length * 5 : 20
  const pct       = Math.round((score / maxScore) * 100)
  const showConfetti = pct >= 75

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4">
      <Confetti active={showConfetti} />

      <div className="text-5xl">⚡</div>
      <h3 className="text-2xl font-bold text-white">Flash Cards Complete!</h3>
      {streakCount > 0 && (
        <p className="text-sm font-semibold text-orange-300">🔥 {streakCount} day streak</p>
      )}

      <div className="text-center">
        <p className="text-3xl font-bold text-pink-300">{score}/{maxScore}</p>
        <p className="mt-0.5 text-xs text-purple-300/50">{pct}% correct</p>
      </div>

      <p className={`text-xs ${isNewBest ? 'animate-sparkle text-amber-400' : 'text-purple-300/50'}`}>
        {isNewBest ? `★ New Personal Best! ${prevBestDaily} pts` : `Your best: ${prevBestDaily} pts`}
      </p>

      <button
        onClick={() =>
          downloadShareBadge({
            mode:     'Flash Cards',
            mainStat: `${pct}%`,
            subLabel: `${score}/${maxScore} correct`,
            score,
          })
        }
        className="text-xs text-purple-400/50 underline transition-colors hover:text-purple-300/70"
      >
        ↓ Share result
      </button>

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
    </div>
  )
}
