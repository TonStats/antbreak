'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { Shortcut } from '@/types/keyboard'
import { getRandomShortcuts, SHORTCUT_CATEGORIES } from '@/data/keyboardShortcuts'

interface Props {
  software: string
  difficulty: 'easy' | 'medium' | 'hard'
  os: 'windows' | 'mac'
  onQuit: () => void
  onFinish: (score: number, correct: number, total: number, wrongIds: string[]) => void
}

const Q_TOTAL = 10
const Q_TIME  = 5
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }

type Feedback = { chosen: string | null; correct: string }

function generateOptions(question: Shortcut, allShortcuts: Shortcut[]): string[] {
  const correct = question.action
  const wrong = allShortcuts
    .filter(s => s.action !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(s => s.action)
  return [...wrong, correct].sort(() => Math.random() - 0.5)
}

export default function ReverseMode({ software, difficulty, os, onQuit, onFinish }: Props) {
  const allShortcuts = useMemo(
    () => SHORTCUT_CATEGORIES.find(c => c.id === software)?.shortcuts ?? [],
    [software],
  )

  const [questions]   = useState<Shortcut[]>(() => {
    const qs = getRandomShortcuts(software, Q_TOTAL, difficulty)
    return [...qs].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
  })
  const [allOptions]  = useState<string[][]>(() => questions.map(q => generateOptions(q, allShortcuts)))

  const [currentQ, setCurrentQ]         = useState(0)
  const [score, setScore]               = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft]         = useState(Q_TIME)
  const [feedback, setFeedback]         = useState<Feedback | null>(null)
  const [totalTime, setTotalTime]       = useState(0)

  const answeredRef       = useRef(false)
  const scoreRef          = useRef(0)
  const correctRef        = useRef(0)
  const wrongIdsRef       = useRef<string[]>([])
  const questionStartRef  = useRef(Date.now())
  const timerRef          = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const currentQRef       = useRef(0)
  const questionsRef      = useRef(questions)

  const total   = questions.length
  const catInfo = SHORTCUT_CATEGORIES.find(c => c.id === software)

  useEffect(() => {
    const iv = setInterval(() => setTotalTime(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  const submitAnswer = useCallback((chosen: string | null) => {
    if (answeredRef.current) return
    answeredRef.current = true
    clearInterval(timerRef.current)

    const q = questionsRef.current[currentQRef.current]
    if (!q) return
    const isCorrect  = chosen === q.action
    const timeTaken  = (Date.now() - questionStartRef.current) / 1000
    const bonus      = isCorrect && timeTaken < 2

    if (isCorrect) {
      const pts = bonus ? 150 : 100
      scoreRef.current   += pts
      correctRef.current += 1
      setScore(scoreRef.current)
      setCorrectCount(correctRef.current)
    } else {
      wrongIdsRef.current.push(q.id)
    }
    setFeedback({ chosen, correct: q.action })

    setTimeout(() => {
      const next = currentQRef.current + 1
      if (next >= questionsRef.current.length) {
        onFinish(scoreRef.current, correctRef.current, questionsRef.current.length, wrongIdsRef.current)
        return
      }
      currentQRef.current    = next
      answeredRef.current    = false
      questionStartRef.current = Date.now()
      setCurrentQ(next)
      setFeedback(null)
      setTimeLeft(Q_TIME)
    }, 1500)
  }, [onFinish])

  useEffect(() => {
    answeredRef.current      = false
    questionStartRef.current = Date.now()
    setTimeLeft(Q_TIME)

    const start = Date.now()
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Q_TIME - (Date.now() - start) / 1000)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        submitAnswer(null)
      }
    }, 100)

    return () => clearInterval(timerRef.current)
  }, [currentQ, submitAnswer])

  const question    = questions[currentQ]
  const correctKeys = question?.keys[os] ?? []
  const options     = allOptions[currentQ] ?? []

  const timerPct   = (timeLeft / Q_TIME) * 100
  const timerColor = timeLeft > 3 ? 'bg-green-500' : timeLeft > 1 ? 'bg-yellow-500' : 'bg-red-500'
  const progressPct = (currentQ / total) * 100

  if (!question) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-rose-400 font-mono">No shortcuts found for this selection.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-10">
        <span className="text-green-400 font-mono text-sm">
          {currentQ + 1} / {total}
        </span>
        <span className="text-zinc-400 font-mono text-sm">
          {catInfo?.icon} {catInfo?.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm">
            score: {score} | {totalTime}s
          </span>
          <button
            type="button"
            onClick={onQuit}
            className="text-xs font-mono text-zinc-600 hover:text-rose-400 transition-colors ml-2"
          >
            ⬛ quit
          </button>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Question area ───────────────────────────────────── */}
      <div className="bg-zinc-900 rounded-xl p-5">
        <p className="text-zinc-600 text-xs font-mono mb-3">{'// what does this shortcut do:'}</p>

        {/* Key badges */}
        <div className="flex items-center justify-center flex-wrap gap-0 mb-3">
          {correctKeys.map((k, i) => (
            <span key={i} className="inline-flex items-center">
              <span className="inline-flex items-center bg-zinc-700 border border-zinc-500 text-green-300 font-mono font-bold text-lg px-3 py-2 rounded-lg mx-1 shadow-sm shadow-black">
                {k}
              </span>
              {i < correctKeys.length - 1 && (
                <span className="text-zinc-500 text-xl mx-1">+</span>
              )}
            </span>
          ))}
        </div>

        <p className="text-zinc-400 text-sm text-center font-mono mb-4">
          What does this shortcut do?
        </p>

        {/* Timer bar */}
        {!feedback && (
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full ${timerColor} rounded-full transition-all duration-100`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}

        {/* Answer options */}
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            let cls = 'bg-zinc-800 border border-zinc-600 text-zinc-200 hover:border-green-600 hover:bg-zinc-800'
            if (feedback) {
              if (opt === feedback.correct)
                cls = 'bg-green-900 border border-green-500 text-green-300'
              else if (opt === feedback.chosen && opt !== feedback.correct)
                cls = 'bg-rose-950 border border-rose-700 text-rose-400'
              else
                cls = 'bg-zinc-900 border border-zinc-700 text-zinc-600'
            }
            return (
              <button
                key={i}
                type="button"
                disabled={!!feedback}
                onClick={() => submitAnswer(opt)}
                className={`w-full font-mono text-sm rounded-xl py-3 px-4 text-left transition-all ${cls}`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {/* Hint after answer */}
        {feedback && question.hint && (
          <p className="text-xs text-zinc-600 font-mono mt-3">{question.hint}</p>
        )}

        {/* Timeout message */}
        {feedback && feedback.chosen === null && (
          <p className="text-rose-400 font-mono text-sm mt-2">✗ Time out!</p>
        )}
      </div>

    </div>
  )
}
