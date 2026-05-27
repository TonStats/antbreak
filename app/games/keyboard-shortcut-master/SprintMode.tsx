'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Shortcut } from '@/types/keyboard'
import { getRandomShortcuts, SHORTCUT_CATEGORIES } from '@/data/keyboardShortcuts'
import OnScreenKeyboard from '@/components/keyboard/OnScreenKeyboard'

interface Props {
  software: string
  difficulty: 'easy' | 'medium' | 'hard'
  os: 'windows' | 'mac'
  showKeyboard: boolean
  onQuit: () => void
  onFinish: (score: number, correct: number, total: number, wrongIds: string[]) => void
  onTimeChange?: (t: number) => void
  gauntlet?: boolean
}

const Q_TOTAL             = 10
const ANSWER_TIME_SECONDS = 13
const POINTS_PER_CORRECT  = 5
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 }

function normalizeEventKey(e: KeyboardEvent): string {
  if (/^Key[A-Z]$/.test(e.code))  return e.code.slice(3)
  if (/^Digit\d$/.test(e.code))   return e.code.slice(5)
  if (/^F\d+$/.test(e.key))       return e.key
  const MAP: Record<string, string> = {
    'Escape': 'Esc', 'ArrowLeft': 'Left', 'ArrowRight': 'Right',
    'ArrowUp': 'Up', 'ArrowDown': 'Down', ' ': 'Space',
  }
  return MAP[e.key] ?? e.key
}

function keysMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const s = new Set(a.map(k => k.toLowerCase()))
  return b.every(k => s.has(k.toLowerCase()))
}

type Feedback = { type: 'correct' | 'wrong' | null; msg: string }

export default function SprintMode({ software, difficulty, os, showKeyboard, onQuit, onFinish, onTimeChange, gauntlet }: Props) {
  const [questions] = useState<Shortcut[]>(() => {
    const qs = gauntlet
      ? getRandomShortcuts(software, Q_TOTAL)
      : getRandomShortcuts(software, Q_TOTAL, difficulty)
    return [...qs].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
  })

  const [currentQ, setCurrentQ]         = useState(0)
  const [score, setScore]               = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [pressedKeys, setPressedKeys]   = useState<string[]>([])
  const [highlightKeys, setHighlightKeys] = useState<string[]>([])
  const [wrongKeys, setWrongKeys]       = useState<string[]>([])
  const [hintKeys, setHintKeys]         = useState<string[]>([])
  const [feedback, setFeedback]         = useState<Feedback>({ type: null, msg: '' })
  const [totalTime, setTotalTime]       = useState(0)

  const answeredRef       = useRef(false)
  const scoreRef          = useRef(0)
  const correctRef        = useRef(0)
  const wrongAttemptsRef  = useRef(0)
  const wrongIdsRef       = useRef<string[]>([])
  const questionStartRef  = useRef(Date.now())
  const timerRef          = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const currentQRef       = useRef(0)
  const questionsRef      = useRef(questions)

  const total   = questions.length
  const catInfo = SHORTCUT_CATEGORIES.find(c => c.id === software)
  const progressPct = (currentQ / total) * 100

  useEffect(() => {
    const iv = setInterval(() => setTotalTime(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  // ── Submit answer ─────────────────────────────────────────────────────────
  const submitAnswer = useCallback((keys: string[]) => {
    if (answeredRef.current) return

    const q = questionsRef.current[currentQRef.current]
    if (!q) return
    const correct   = q.keys[os]
    const isTimeout = keys.length === 0
    const isCorrect = !isTimeout && keysMatch(keys, correct)

    if (isCorrect) {
      answeredRef.current = true
      clearInterval(timerRef.current)
      scoreRef.current   += POINTS_PER_CORRECT
      correctRef.current += 1
      setScore(scoreRef.current)
      setCorrectCount(correctRef.current)
      setFeedback({ type: 'correct', msg: '✓ Correct!' })
      setHighlightKeys(correct)
      setTimeout(advance, 1500)
      return
    }

    if (isTimeout) {
      answeredRef.current = true
      clearInterval(timerRef.current)
      if (!wrongIdsRef.current.includes(q.id)) wrongIdsRef.current.push(q.id)
      setFeedback({ type: 'wrong', msg: '✗ Time out!' })
      setHighlightKeys(correct)
      setTimeout(advance, 1500)
      return
    }

    // Wrong attempt — allow retry
    wrongAttemptsRef.current += 1
    setWrongKeys(keys)
    setTimeout(() => setWrongKeys([]), 300)
    if (wrongAttemptsRef.current >= 2 && correct.length > 0) {
      setHintKeys([correct[0]])
    }
    if (!wrongIdsRef.current.includes(q.id)) {
      wrongIdsRef.current.push(q.id)
    }
  }, [os]) // eslint-disable-line react-hooks/exhaustive-deps

  function advance() {
    const next = currentQRef.current + 1
    if (next >= questionsRef.current.length) {
      onFinish(scoreRef.current, correctRef.current, questionsRef.current.length, wrongIdsRef.current)
      return
    }
    currentQRef.current = next
    answeredRef.current = false
    questionStartRef.current = Date.now()
    setCurrentQ(next)
    setFeedback({ type: null, msg: '' })
    setHighlightKeys([])
    setWrongKeys([])
    setPressedKeys([])
  }

  // ── Per-question countdown ─────────────────────────────────────────────────
  useEffect(() => {
    answeredRef.current      = false
    wrongAttemptsRef.current = 0
    questionStartRef.current = Date.now()
    setHintKeys([])
    onTimeChange?.(ANSWER_TIME_SECONDS)

    const start = Date.now()
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, ANSWER_TIME_SECONDS - (Date.now() - start) / 1000)
      onTimeChange?.(Math.ceil(remaining))
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        submitAnswer([])
      }
    }, 100)

    return () => clearInterval(timerRef.current)
  }, [currentQ, submitAnswer, onTimeChange])

  // ── Physical keyboard listener (capture phase) ─────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const allowedKeys = ['Escape', 'F11', 'F5']
      if (allowedKeys.includes(e.key)) return
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J'].includes(e.key.toUpperCase())) return

      e.preventDefault()
      e.stopPropagation()

      if (answeredRef.current) return

      const keys: string[] = []
      if (e.ctrlKey)  keys.push('Ctrl')
      if (e.metaKey)  keys.push(os === 'mac' ? 'Cmd' : 'Win')
      if (e.altKey)   keys.push(os === 'mac' ? 'Opt' : 'Alt')
      if (e.shiftKey) keys.push('Shift')

      const isModifier = ['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)
      if (!isModifier) {
        keys.push(normalizeEventKey(e))
        setPressedKeys(keys)
        submitAnswer(keys)
      } else {
        setPressedKeys(keys)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      if (!answeredRef.current) setPressedKeys([])
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup',   handleKeyUp,   { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup',   handleKeyUp,   { capture: true })
    }
  }, [os, submitAnswer])

  // ── Mobile on-screen keyboard ──────────────────────────────────────────────
  const [mobileMods, setMobileMods] = useState<string[]>([])
  const MODIFIERS = ['Ctrl', 'Cmd', 'Win', 'Alt', 'Opt', 'Shift']

  function handleMobileKey(key: string) {
    if (answeredRef.current) return
    if (MODIFIERS.includes(key)) {
      setMobileMods(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      )
    } else {
      const keys = [...mobileMods, key]
      setPressedKeys(keys)
      setMobileMods([])
      submitAnswer(keys)
    }
  }

  const question    = questions[currentQ]
  const correctKeys = question?.keys[os] ?? []

  const showKbd = showKeyboard || (typeof window !== 'undefined' && window.innerWidth < 768)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (!question) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-rose-400 font-mono">No shortcuts found for this selection.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Top bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between h-8">
        {gauntlet ? (
          <span className="text-green-400 font-mono text-sm">
            Shortcut {currentQ + 1}/{total} | {catInfo?.name}
          </span>
        ) : (
          <>
            <span className="text-green-400 font-mono text-sm">{currentQ + 1} / {total}</span>
            <span className="text-zinc-400 font-mono text-sm">{catInfo?.icon} {catInfo?.name}</span>
          </>
        )}
        <span className="text-green-400 font-mono text-sm">score: {score} | {totalTime}s</span>
      </div>

      {/* ── Progress bar ──────────────────────────────────── */}
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Question area ─────────────────────────────────── */}
      <div
        className={[
          'bg-zinc-900 rounded-xl p-5 transition-all duration-150',
          feedback.type === 'correct' ? 'ring-2 ring-green-500' : '',
          feedback.type === 'wrong'   ? 'ring-2 ring-rose-500'  : '',
        ].join(' ')}
      >
        <p className="text-zinc-600 text-xs font-mono mb-2">{'// what is the shortcut for:'}</p>
        <p className="text-white font-bold text-2xl text-center mb-1">{question.action}</p>
        <p className="text-zinc-500 text-sm text-center mb-4">in {catInfo?.name}</p>

        {/* Hint notice */}
        {feedback.type === null && hintKeys.length > 0 && (
          <p className="text-amber-400 text-xs font-mono mt-2">
            {'// hint: start with '}<span className="font-bold">{hintKeys[0]}</span>
          </p>
        )}

        {/* Feedback */}
        {feedback.type !== null && (
          <div className="mt-3 space-y-2">
            <p className={`font-mono text-lg ${feedback.type === 'correct' ? 'text-green-400' : 'text-rose-400'}`}>
              {feedback.msg}
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              {correctKeys.map((k, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <span className="bg-zinc-800 border border-green-500 text-green-300 font-mono text-xs px-2 py-0.5 rounded">
                    {k}
                  </span>
                  {i < correctKeys.length - 1 && <span className="text-zinc-500 text-xs">+</span>}
                </span>
              ))}
            </div>
            {question.hint && (
              <p className="text-xs text-zinc-600 font-mono">{question.hint}</p>
            )}
          </div>
        )}
      </div>

      {/* ── On-screen keyboard ────────────────────────────── */}
      {showKbd && (
        <OnScreenKeyboard
          pressedKeys={[...pressedKeys, ...mobileMods]}
          highlightKeys={highlightKeys}
          wrongKeys={wrongKeys}
          hintKeys={hintKeys}
          onKeyPress={handleMobileKey}
          interactive={isMobile}
          os={os}
        />
      )}

    </div>
  )
}
