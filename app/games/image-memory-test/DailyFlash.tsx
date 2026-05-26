'use client'

import { useState, useEffect, useRef } from 'react'
import { getDailySet } from '@/data/memoryContent'
import type { DailyImage } from '@/types/memory'
import Confetti from './Confetti'
import { downloadShareBadge } from './shareUtils'

type Stage = 'countdown' | 'flash' | 'questions' | 'done'

const FLASH_MS       = 600
const GAP_MS         = 200
const CORRECT_ADV_MS = 800
const WRONG_ADV_MS   = 1200

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function todayKey() {
  return `memory_daily_${new Date().toISOString().split('T')[0]}`
}

interface Props { onQuit: () => void }

export default function DailyFlash({ onQuit }: Props) {
  const [stage,           setStage]           = useState<Stage>('countdown')
  const [countdown,       setCountdown]       = useState(3)
  const [flashIndex,      setFlashIndex]      = useState(-1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer,  setSelectedAnswer]  = useState<string | null>(null)
  const [score,           setScore]           = useState(0)
  const [alreadyDone,     setAlreadyDone]     = useState(false)
  const [prevScore,       setPrevScore]       = useState(0)
  const [isNewBest,       setIsNewBest]       = useState(false)
  const [prevBestDaily,   setPrevBestDaily]   = useState(0)
  const [streakCount,     setStreakCount]     = useState(0)
  const [midnight,        setMidnight]        = useState('')
  const [data,            setData]            = useState<DailyImage | null>(null)

  const scoreRef = useRef(0)
  const dataRef  = useRef<DailyImage | null>(null)

  useEffect(() => {
    const d   = getDailySet()
    const key = todayKey()
    dataRef.current = d
    setData(d)

    setPrevBestDaily(Number(localStorage.getItem('memory_best_daily') ?? 0))

    const stored = localStorage.getItem(key)
    if (stored) {
      try { setPrevScore(JSON.parse(stored).score ?? 0) } catch {}
      setAlreadyDone(true)
      setStage('done')
      return
    }

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
  }, [])

  // Midnight countdown
  useEffect(() => {
    if (stage !== 'done') return
    function tick() {
      const now  = new Date()
      const next = new Date()
      next.setHours(24, 0, 0, 0)
      const diff = next.getTime() - now.getTime()
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setMidnight(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [stage])

  async function handleAnswer(selected: string) {
    if (selectedAnswer !== null || !dataRef.current) return

    const q         = dataRef.current.questions[currentQuestion]
    const isCorrect = selected === q.answer
    setSelectedAnswer(selected)

    let newScore = scoreRef.current
    if (isCorrect) {
      newScore += 100
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
    const key       = todayKey()
    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

    localStorage.setItem(key, JSON.stringify({ score: finalScore, completed: true, date: today }))

    const hadYesterday   = !!localStorage.getItem(`memory_daily_${yesterday}`)
    const currentStreak  = Number(localStorage.getItem('memory_streak') ?? 0)
    const newStreak      = hadYesterday ? currentStreak + 1 : 1
    localStorage.setItem('memory_streak', String(newStreak))
    setStreakCount(newStreak)

    const best    = Number(localStorage.getItem('memory_best_daily') ?? 0)
    const newBest = finalScore > best
    if (newBest) localStorage.setItem('memory_best_daily', String(finalScore))
    setIsNewBest(newBest)
    setPrevBestDaily(newBest ? finalScore : best)
  }

  // ── Countdown ─────────────────────────────────────────────────────────
  if (stage === 'countdown') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6">
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
      <div className="flex h-full flex-col items-center justify-center">
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
    const answered = selectedAnswer !== null

    return (
      <div className="flex h-full flex-col justify-center gap-5 px-2">

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

        <p className="text-right text-sm font-semibold text-pink-300">{score} pts</p>

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
  const displayScore = alreadyDone ? prevScore : score
  const maxScore     = data ? data.questions.length * 100 : 400
  const pct          = Math.round((displayScore / maxScore) * 100)
  const showConfetti = !alreadyDone && displayScore >= 300

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4">
      <Confetti active={showConfetti} />

      {alreadyDone ? (
        <>
          <div className="text-5xl">✅</div>
          <h3 className="text-2xl font-bold text-white">Already Completed Today!</h3>
          <p className="text-sm text-purple-200/70">Come back tomorrow for a new challenge</p>
        </>
      ) : (
        <>
          <div className="text-5xl">⚡</div>
          <h3 className="text-2xl font-bold text-white">Daily Complete!</h3>
          {streakCount > 0 && (
            <p className="text-sm font-semibold text-orange-300">🔥 {streakCount} day streak</p>
          )}
        </>
      )}

      <div className="text-center">
        <p className="text-3xl font-bold text-pink-300">{displayScore}/{maxScore}</p>
        <p className="mt-0.5 text-xs text-purple-300/50">{pct}% correct</p>
      </div>

      {!alreadyDone && (
        <p className={`text-xs ${isNewBest ? 'animate-sparkle text-amber-400' : 'text-purple-300/50'}`}>
          {isNewBest ? `★ New Personal Best! ${prevBestDaily} pts` : `Your best: ${prevBestDaily} pts`}
        </p>
      )}

      {midnight && (
        <p className="text-xs text-purple-300/60">Next challenge in {midnight}</p>
      )}

      {!alreadyDone && (
        <button
          onClick={() =>
            downloadShareBadge({
              mode:     'Daily Flash',
              mainStat: `${pct}%`,
              subLabel: `${displayScore}/${maxScore} correct`,
              score:    displayScore,
            })
          }
          className="text-xs text-purple-400/50 underline transition-colors hover:text-purple-300/70"
        >
          ↓ Share result
        </button>
      )}

      <button
        onClick={onQuit}
        className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-white/60 transition-all hover:text-white/80"
      >
        Back
      </button>
    </div>
  )
}
