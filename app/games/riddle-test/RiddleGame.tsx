'use client'

import { useState, useEffect, useRef } from 'react'
import { HelpCircle, Maximize2, Minimize2, X, Download } from 'lucide-react'
import type { Riddle, RiddleMode, RiddleDifficulty, RiddleResult } from '@/types/riddle'
import { getRiddles, getDailyRiddle, checkAnswer } from '@/data/riddles'

type Stage = 'setup' | 'playing' | 'results'

const POINTS_PER_CORRECT  = 5
const SPEED_TIME_SECONDS  = 30
const ADVANCE_DELAY_MS    = 2000
const EXPLAIN_DELAY_MS    = 500
const MAX_DAILY_ATTEMPTS  = 3

const MODES: { id: RiddleMode; icon: string; name: string; tagline: string }[] = [
  { id: 'classic', icon: '🔍', name: 'Classic',      tagline: '20 riddles. No pressure. Think deep.'   },
  { id: 'speed',   icon: '⚡', name: 'Speed Round',  tagline: '10 riddles. 30 seconds each.'           },
  { id: 'daily',   icon: '📅', name: 'Daily Riddle', tagline: 'One riddle. Three attempts. New daily.' },
]

const DIFFICULTIES: { id: RiddleDifficulty; label: string; active: string }[] = [
  { id: 'easy',   label: 'Easy',   active: 'bg-emerald-900/40 border-emerald-500 text-emerald-300' },
  { id: 'medium', label: 'Medium', active: 'bg-cyan-900/40 border-cyan-500 text-cyan-200'          },
  { id: 'hard',   label: 'Hard',   active: 'bg-rose-900/40 border-rose-500 text-rose-300'           },
]

const CATEGORY_ICONS: Record<string, string> = {
  wordplay: '🔤',
  logic:    '🧠',
  math:     '🔢',
  nature:   '🌿',
  whatami:  '❓',
}

const HOW_TO_GUIDE = [
  { label: 'Classic',      body: 'Work through 20 riddles with no time limit. Type your answer freely and use the hint if stuck.' },
  { label: 'Speed Round',  body: '10 riddles, 30 seconds each. Answer before the clock runs out for full points.' },
  { label: 'Daily',        body: 'One new riddle every day. Three attempts before the answer is revealed. Solve it to keep your streak alive.' },
  { label: 'Tips',         body: 'Read every word carefully. Riddles use wordplay and double meanings. The hint points you in the right direction without giving away the answer.' },
]

interface DailyRecord {
  solved:   boolean
  attempts: number
  score:    number
  date:     string
}

// Pre-compute confetti particles once at module load
const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => ({
  left:  (i * 37 + 11) % 100,
  delay: ((i * 0.13) % 1.8),
  dur:   1.6 + (i * 0.07) % 1.4,
  color: ['#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'][i % 6],
  w:     4 + (i % 3) * 2,
  h:     6 + (i % 4) * 2,
}))

function timeToMidnight(): string {
  const now      = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h    = Math.floor(diff / 3_600_000)
  const m    = Math.floor((diff % 3_600_000) / 60_000)
  const s    = Math.floor((diff % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function timerCls(t: number): string {
  if (t > 15) return 'bg-cyan-900/40 border border-cyan-700 text-cyan-300'
  if (t > 8)  return 'bg-yellow-900/40 border border-yellow-700 text-yellow-300'
  return 'bg-rose-900/40 border border-rose-700 text-rose-400 animate-pulse'
}

function getGrade(pct: number): { emoji: string; title: string } {
  if (pct >= 100) return { emoji: '🕵️', title: 'Master Detective'   }
  if (pct >= 75)  return { emoji: '🔍', title: 'Sharp Investigator' }
  if (pct >= 50)  return { emoji: '💡', title: 'Clever Thinker'     }
  if (pct >= 25)  return { emoji: '🧩', title: 'Puzzle Apprentice'  }
  return                 { emoji: '🌱', title: 'Curious Beginner'   }
}

export default function RiddleGame() {

  // ── Setup state ────────────────────────────────────────────────
  const [stage,          setStage]          = useState<Stage>('setup')
  const [mode,           setMode]           = useState<RiddleMode | null>(null)
  const [difficulty,     setDifficulty]     = useState<RiddleDifficulty>('medium')
  const [streak,         setStreak]         = useState(0)
  const [dailyCompleted, setDailyCompleted] = useState(false)
  const [dailyRecord,    setDailyRecord]    = useState<DailyRecord | null>(null)
  const [countdown,      setCountdown]      = useState('')
  const [bestScore,      setBestScore]      = useState<string | null>(null)
  const [showHowTo,      setShowHowTo]      = useState(false)
  const [isFullscreen,   setIsFullscreen]   = useState(false)

  // ── Game state ─────────────────────────────────────────────────
  const [riddles,         setRiddles]         = useState<Riddle[]>([])
  const [currentIdx,      setCurrentIdx]      = useState(0)
  const [userInput,       setUserInput]       = useState('')
  const [hasAnswered,     setHasAnswered]     = useState(false)
  const [wasCorrect,      setWasCorrect]      = useState(false)
  const [timedOut,        setTimedOut]        = useState(false)
  const [score,           setScore]           = useState(0)
  const [hintUsed,        setHintUsed]        = useState(false)
  const [showHint,        setShowHint]        = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [results,         setResults]         = useState<RiddleResult[]>([])
  const [timeLeft,        setTimeLeft]        = useState(SPEED_TIME_SECONDS)

  // ── Daily-specific state ───────────────────────────────────────
  const [dailyAttempts,       setDailyAttempts]       = useState(0)
  const [dailyAttemptResults, setDailyAttemptResults] = useState<boolean[]>([])
  const [tryAgain,            setTryAgain]            = useState(false)

  // ── Results state ──────────────────────────────────────────────
  const [isNewPB,      setIsNewPB]      = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const cardRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreRef = useRef(0)
  const hintsRef = useRef(0)

  // ── Init effects ───────────────────────────────────────────────
  useEffect(() => {
    setStreak(Number(localStorage.getItem('riddle_streak') ?? '0'))
    const today    = new Date().toISOString().split('T')[0]
    const todayKey = `riddle_daily_${today}`
    const raw      = localStorage.getItem(todayKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DailyRecord
        setDailyCompleted(true)
        setDailyRecord(parsed)
      } catch {
        setDailyCompleted(raw === '1')
      }
    }
    setCountdown(timeToMidnight())
    const t = setInterval(() => setCountdown(timeToMidnight()), 1_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!mode) { setBestScore(null); return }
    const key = mode === 'daily' ? 'riddle_best_daily' : `riddle_best_${mode}_${difficulty}`
    setBestScore(localStorage.getItem(key))
  }, [mode, difficulty])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Auto-focus input on each new question
  useEffect(() => {
    if (stage !== 'playing') return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [currentIdx, stage])

  // Auto-hide confetti
  useEffect(() => {
    if (!showConfetti) return
    const t = setTimeout(() => setShowConfetti(false), 4_000)
    return () => clearTimeout(t)
  }, [showConfetti])

  // ── Speed timer ────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'speed' || stage !== 'playing' || hasAnswered) return
    const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [mode, stage, hasAnswered, currentIdx])

  useEffect(() => {
    if (timeLeft !== 0 || mode !== 'speed' || stage !== 'playing' || hasAnswered) return
    const riddle = riddles[currentIdx]
    if (!riddle) return
    setHasAnswered(true)
    setWasCorrect(false)
    setTimedOut(true)
    setResults(prev => [...prev, {
      riddleId: riddle.id, correct: false, attempts: 1, timeSeconds: 0, pointsEarned: 0,
    }])
  }, [timeLeft, mode, stage, hasAnswered, riddles, currentIdx])

  // ── Explanation delay ──────────────────────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing') return
    const t = setTimeout(() => setShowExplanation(true), EXPLAIN_DELAY_MS)
    return () => clearTimeout(t)
  }, [hasAnswered, stage])

  // ── Auto-advance ───────────────────────────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing') return
    const t = setTimeout(() => {
      const next = currentIdx + 1
      if (next >= riddles.length) {
        finishGame()
      } else {
        setCurrentIdx(next)
        setUserInput('')
        setHasAnswered(false)
        setWasCorrect(false)
        setTimedOut(false)
        setShowHint(false)
        setHintUsed(false)
        setShowExplanation(false)
        setTimeLeft(SPEED_TIME_SECONDS)
      }
    }, ADVANCE_DELAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnswered, stage, currentIdx])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await cardRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }

  // ── Daily helpers ──────────────────────────────────────────────
  function saveDailyResult(solved: boolean, attemptsUsed: number, pts: number) {
    const today    = new Date().toISOString().split('T')[0]
    const todayKey = `riddle_daily_${today}`
    const record: DailyRecord = { solved, attempts: attemptsUsed, score: pts, date: today }
    localStorage.setItem(todayKey, JSON.stringify(record))
    setDailyCompleted(true)
    setDailyRecord(record)

    const yDate = new Date()
    yDate.setDate(yDate.getDate() - 1)
    const yKey         = `riddle_daily_${yDate.toISOString().split('T')[0]}`
    const hadYesterday = !!localStorage.getItem(yKey)
    const newStreak    = hadYesterday ? streak + 1 : 1
    setStreak(newStreak)
    localStorage.setItem('riddle_streak', String(newStreak))
  }

  // ── Game functions ─────────────────────────────────────────────
  function handleStart() {
    if (!mode || (mode === 'daily' && dailyCompleted)) return

    const qs = mode === 'daily'
      ? [getDailyRiddle()]
      : getRiddles(mode === 'speed' ? 10 : 20, difficulty)

    scoreRef.current = 0
    hintsRef.current = 0
    setScore(0)
    setRiddles(qs)
    setCurrentIdx(0)
    setUserInput('')
    setHasAnswered(false)
    setWasCorrect(false)
    setTimedOut(false)
    setShowHint(false)
    setHintUsed(false)
    setShowExplanation(false)
    setResults([])
    setTimeLeft(SPEED_TIME_SECONDS)
    setDailyAttempts(0)
    setDailyAttemptResults([])
    setTryAgain(false)
    setIsNewPB(false)
    setShowConfetti(false)
    setStage('playing')
  }

  function handleQuit() {
    setStage('setup')
    setRiddles([])
    setCurrentIdx(0)
    setUserInput('')
    setHasAnswered(false)
    setWasCorrect(false)
    setTimedOut(false)
    setShowHint(false)
    setHintUsed(false)
    setShowExplanation(false)
    setResults([])
    setTimeLeft(SPEED_TIME_SECONDS)
    setDailyAttempts(0)
    setDailyAttemptResults([])
    setTryAgain(false)
    setIsNewPB(false)
    setShowConfetti(false)
    scoreRef.current = 0
    hintsRef.current = 0
    setScore(0)
  }

  function handleSubmit() {
    if (hasAnswered || !userInput.trim() || tryAgain) return
    const riddle = riddles[currentIdx]
    if (!riddle) return

    const correct = checkAnswer(userInput, riddle)

    if (mode === 'daily') {
      const newAttempts        = dailyAttempts + 1
      const newAttemptResults  = [...dailyAttemptResults, correct]
      setDailyAttempts(newAttempts)
      setDailyAttemptResults(newAttemptResults)

      if (correct || newAttempts >= MAX_DAILY_ATTEMPTS) {
        const pts = correct ? (4 - newAttempts) * 5 : 0
        scoreRef.current = pts
        setScore(pts)
        setWasCorrect(correct)
        setHasAnswered(true)
        setResults([{ riddleId: riddle.id, correct, attempts: newAttempts, timeSeconds: 0, pointsEarned: pts }])
        saveDailyResult(correct, newAttempts, pts)
      } else {
        setTryAgain(true)
        setUserInput('')
        setTimeout(() => {
          setTryAgain(false)
          setTimeout(() => inputRef.current?.focus(), 50)
        }, 1_500)
      }
      return
    }

    // Classic / Speed
    const pts = correct ? (hintUsed ? 3 : POINTS_PER_CORRECT) : 0
    scoreRef.current += pts
    setScore(scoreRef.current)
    setWasCorrect(correct)
    setHasAnswered(true)
    setResults(prev => [...prev, {
      riddleId:     riddle.id,
      correct,
      attempts:     1,
      timeSeconds:  mode === 'speed' ? timeLeft : 0,
      pointsEarned: pts,
    }])
  }

  function handleShowHint() {
    if (hintUsed || hasAnswered) return
    setShowHint(true)
    setHintUsed(true)
    hintsRef.current++
  }

  function finishGame() {
    if (!mode) return
    const maxScore = mode === 'daily' ? 15 : riddles.length * POINTS_PER_CORRECT
    const fs       = scoreRef.current
    const key      = mode === 'daily' ? 'riddle_best_daily' : `riddle_best_${mode}_${difficulty}`
    const rawPB    = localStorage.getItem(key)
    const prev     = rawPB ? parseInt(rawPB.split('/')[0]) : -1
    if (fs > prev) {
      localStorage.setItem(key, `${fs}/${maxScore}`)
      setBestScore(`${fs}/${maxScore}`)
      setIsNewPB(true)
    }
    const pct = maxScore > 0 ? (fs / maxScore) * 100 : 0
    if (pct >= 75) setShowConfetti(true)
    setStage('results')
  }

  function handleShare() {
    const maxScore = mode === 'daily' ? 15 : riddles.length * POINTS_PER_CORRECT
    const pct      = maxScore > 0 ? (score / maxScore) * 100 : 0
    const g        = getGrade(pct)
    const canvas   = document.createElement('canvas')
    canvas.width   = 600
    canvas.height  = 300
    const ctx      = canvas.getContext('2d')!
    ctx.fillStyle  = '#050d1a'
    ctx.fillRect(0, 0, 600, 300)
    ctx.strokeStyle = 'rgba(34,211,238,0.25)'
    ctx.lineWidth   = 2
    ctx.strokeRect(1, 1, 598, 298)
    ctx.fillStyle = '#22d3ee'
    ctx.font      = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ANTBREAK RIDDLE TEST', 300, 44)
    ctx.fillStyle = '#ffffff'
    ctx.font      = 'bold 86px Georgia, serif'
    ctx.fillText(String(score), 300, 165)
    ctx.fillStyle = '#164e63'
    ctx.font      = '18px sans-serif'
    ctx.fillText(`/ ${maxScore}`, 300, 193)
    ctx.fillStyle = '#e2e8f0'
    ctx.font      = 'bold 22px sans-serif'
    ctx.fillText(`${g.emoji} ${g.title}`, 300, 237)
    ctx.fillStyle = '#164e63'
    ctx.font      = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('antbreak.com', 584, 284)
    const link    = document.createElement('a')
    link.download = `antbreak-riddle-${score}.png`
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  // ── Derived ────────────────────────────────────────────────────
  const canStart       = !!mode && !(mode === 'daily' && dailyCompleted)
  const showDifficulty = mode === 'classic' || mode === 'speed'
  const activeMode     = MODES.find(m => m.id === mode)
  const riddle         = riddles[currentIdx]
  const total          = riddles.length
  const progressPct    = total > 0 ? (currentIdx / total) * 100 : 0
  const correctCount   = results.filter(r => r.correct).length
  const maxScore       = mode === 'daily' ? 15 : total * POINTS_PER_CORRECT
  const scorePct       = maxScore > 0 ? (score / maxScore) * 100 : 0
  const grade          = getGrade(scorePct)
  const missedRiddle   = (() => {
    const first = results.find(r => !r.correct)
    return first ? riddles.find(r => r.id === first.riddleId) ?? null : null
  })()

  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="riddle-game-card h-full flex flex-col rounded-2xl relative overflow-hidden"
      style={{
        background:  '#050d1a',
        boxShadow:   '0 0 0 1px rgba(34,211,238,0.25), 0 0 30px rgba(34,211,238,0.06), 0 25px 50px rgba(0,0,0,0.7)',
      }}
    >
      {/* Decorative watermarks */}
      <span aria-hidden="true" className="pointer-events-none select-none absolute top-4 right-5 text-[120px] leading-none text-cyan-500/[0.03] font-black">?</span>
      <span aria-hidden="true" className="pointer-events-none select-none absolute bottom-16 left-4 text-[80px] leading-none text-cyan-500/[0.025] font-black">?</span>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
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

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 shrink-0">
        <HelpCircle className="h-6 w-6 text-cyan-400 shrink-0" />
        <h1 className={`text-cyan-100 font-bold flex-1 leading-none ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
          Riddle Test
        </h1>

        {stage === 'playing' && mode === 'speed' && (
          <div className={`rounded-xl w-11 h-11 flex items-center justify-center font-mono font-bold text-base shrink-0 ${timerCls(timeLeft)}`}>
            {timeLeft}
          </div>
        )}

        {stage === 'playing' && (
          <button
            type="button"
            onClick={handleQuit}
            className="text-cyan-900/60 hover:text-rose-400 transition-colors p-1"
            aria-label="Quit"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-cyan-900/60 hover:text-cyan-400 transition-colors p-1"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Progress bar — Classic / Speed only */}
      {stage === 'playing' && mode !== 'daily' ? (
        <div className="h-1 bg-cyan-900/20 shrink-0 relative">
          <div
            className="absolute inset-y-0 left-0 bg-cyan-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : (
        <hr className="border-cyan-900/30 mx-5 shrink-0" />
      )}

      {/* ── Setup ───────────────────────────────────────────────── */}
      {stage === 'setup' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center">

          <p className="text-cyan-400/60 text-xs text-center tracking-widest uppercase mb-5">
            🔍 Can you solve them all?
          </p>

          <p className="text-cyan-500/70 text-xs uppercase tracking-widest text-center mb-3">
            Choose Mode
          </p>

          <div className="flex flex-col gap-2 mb-4">
            {MODES.map(m => (
              <button
                key={`mode-${m.id}`}
                type="button"
                onClick={() => setMode(m.id)}
                className={[
                  'flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200',
                  mode === m.id
                    ? 'bg-cyan-950/60 border-2 border-cyan-400 shadow-lg shadow-cyan-500/15'
                    : 'bg-white/[0.03] border border-cyan-900/30 hover:border-cyan-500/40 hover:bg-cyan-950/30',
                ].join(' ')}
              >
                <span className="text-3xl shrink-0 leading-none">{m.icon}</span>
                <span className="min-w-0">
                  <span className="block text-cyan-100 font-bold text-sm">{m.name}</span>
                  <span className="block text-cyan-600/60 text-xs mt-0.5">{m.tagline}</span>
                </span>
              </button>
            ))}
          </div>

          {showDifficulty && (
            <div className="mb-3">
              <p className="text-cyan-500/70 text-xs uppercase tracking-widest text-center mb-2">
                Difficulty
              </p>
              <div className="flex justify-center gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={`diff-${d.id}`}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={[
                      'rounded-full px-4 py-1 text-xs transition-all border',
                      difficulty === d.id
                        ? d.active
                        : 'bg-white/5 border-cyan-900/30 text-cyan-600/60 hover:border-cyan-700/50 hover:text-cyan-500/80',
                    ].join(' ')}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {streak > 0 && (
            <p className="text-cyan-400 text-xs text-center mt-2">🔥 {streak} day streak</p>
          )}

          {bestScore && activeMode && (
            <p className="text-cyan-800 text-xs text-center mt-1">
              Best: {bestScore} · {activeMode.name}
            </p>
          )}

          {mode === 'daily' && dailyCompleted ? (
            <div className="mt-5 text-center space-y-1">
              <p className="text-cyan-400 text-sm font-semibold">✓ Today's riddle solved!</p>
              {dailyRecord && (
                <p className="text-cyan-600/70 text-xs">
                  Score: {dailyRecord.score} · {dailyRecord.attempts} attempt{dailyRecord.attempts !== 1 ? 's' : ''} used
                </p>
              )}
              <p className="text-cyan-800 text-xs">New riddle in {countdown}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className={[
                'mt-5 w-full py-3 rounded-xl font-bold text-sm text-white transition-all',
                'border border-cyan-500/20 shadow-lg shadow-cyan-700/25',
                canStart
                  ? 'bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed',
              ].join(' ')}
            >
              🔍 Start
            </button>
          )}

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-cyan-800/60 text-xs underline hover:text-cyan-600/80 transition-colors"
            >
              {showHowTo ? 'Hide guide' : 'How to play'}
            </button>
            {showHowTo && (
              <div
                className="mt-2 text-left bg-black/20 border border-cyan-900/30 rounded-xl p-4 space-y-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {HOW_TO_GUIDE.map((section, i) => (
                  <div key={i}>
                    <span className="text-cyan-400/80 text-xs font-semibold not-italic">{section.label}: </span>
                    <span className="text-cyan-400/70 text-xs leading-relaxed">{section.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Playing ─────────────────────────────────────────────── */}
      {stage === 'playing' && riddle && (
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col">

          {/* Classic / Speed counter */}
          {mode !== 'daily' && (
            <p className="text-cyan-600/70 text-xs text-center mt-2 shrink-0">
              Riddle {currentIdx + 1} of {total}
            </p>
          )}

          {/* Daily attempt indicator */}
          {mode === 'daily' && (
            <div className="text-center mt-2 shrink-0">
              <p className="text-cyan-600/60 text-xs mb-2">
                Attempt {Math.min(dailyAttempts + (hasAnswered ? 0 : 1), MAX_DAILY_ATTEMPTS)} of {MAX_DAILY_ATTEMPTS}
              </p>
              <div className="flex justify-center gap-2">
                {Array.from({ length: MAX_DAILY_ATTEMPTS }, (_, i) => {
                  const res = dailyAttemptResults[i]
                  return (
                    <div
                      key={i}
                      className={[
                        'w-3 h-3 rounded-full transition-colors duration-300',
                        res === undefined ? 'bg-white/10' :
                        res ? 'bg-green-500' : 'bg-rose-500',
                      ].join(' ')}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Riddle card */}
          <div className="bg-white/[0.03] border border-cyan-900/20 rounded-2xl p-6 mt-3 flex flex-col justify-between flex-1">

            {/* Category badge */}
            <p className="text-cyan-600/60 text-xs uppercase tracking-widest font-semibold shrink-0">
              {CATEGORY_ICONS[riddle.category] ?? '?'} {riddle.category}
            </p>

            {/* Riddle text */}
            <div className="flex-1 flex items-center justify-center gap-2 min-h-[80px]">
              <span aria-hidden="true" className="text-cyan-800 text-4xl leading-none select-none shrink-0">&ldquo;</span>
              <p
                className="text-cyan-50 font-semibold text-xl leading-relaxed text-center"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {riddle.question}
              </p>
              <span aria-hidden="true" className="text-cyan-800 text-4xl leading-none select-none shrink-0">&rdquo;</span>
            </div>

            {/* Input area */}
            {!hasAnswered && !tryAgain && (
              <div className="shrink-0">
                <label className="block text-cyan-600/60 text-xs mb-2">Your answer:</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && userInput.trim()) handleSubmit()
                  }}
                  placeholder="Type your answer..."
                  className="w-full bg-transparent border-b-2 border-cyan-700/50 focus:border-cyan-400 outline-none text-cyan-100 text-lg font-mono py-2 px-0 transition-colors duration-150 placeholder:text-cyan-800/50"
                  style={{ caretColor: '#22d3ee' }}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />

                {/* Hint */}
                <div className="mt-3">
                  {!showHint ? (
                    <button
                      type="button"
                      onClick={handleShowHint}
                      className="text-cyan-700/60 text-xs underline cursor-pointer hover:text-cyan-500/80 transition-colors"
                    >
                      💡 Show hint
                    </button>
                  ) : (
                    <div className="bg-cyan-950/40 border border-cyan-800/30 rounded-lg p-2">
                      <p className="text-cyan-400/80 text-xs italic">Hint: {riddle.hint}</p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className={[
                    'mt-4 w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all',
                    userInput.trim()
                      ? 'bg-cyan-700 hover:bg-cyan-600 cursor-pointer'
                      : 'bg-cyan-900/30 text-cyan-700/50 cursor-not-allowed',
                  ].join(' ')}
                >
                  Submit Answer →
                </button>
              </div>
            )}

            {/* Daily: try again flash */}
            {tryAgain && (
              <div className="shrink-0 bg-rose-950/50 border border-rose-700/50 rounded-xl p-4">
                <p className="text-rose-400 font-bold text-lg">✗ Try again</p>
              </div>
            )}

            {/* Feedback after final answer */}
            {hasAnswered && (
              <div className="shrink-0">

                {wasCorrect && (
                  <div className="bg-green-950/50 border border-green-700/50 rounded-xl p-4">
                    <p className="text-green-400 font-bold text-lg">✓ Correct!</p>
                    <p className="text-green-300 text-sm mt-0.5">
                      +{results[results.length - 1]?.pointsEarned ?? 0} points
                      {hintUsed ? ' (hint used)' : ''}
                    </p>
                  </div>
                )}

                {!wasCorrect && !timedOut && (
                  <div className="bg-rose-950/50 border border-rose-700/50 rounded-xl p-4">
                    <p className="text-rose-400 font-bold text-lg">✗ Not quite</p>
                    <p className="text-white font-semibold text-base mt-1">
                      The answer was: {riddle.answer}
                    </p>
                  </div>
                )}

                {timedOut && (
                  <div className="bg-rose-950/50 border border-rose-700/50 rounded-xl p-4">
                    <p className="text-rose-400 font-bold text-lg">⏱ Time's up!</p>
                    <p className="text-white font-semibold text-base mt-1">
                      The answer was: {riddle.answer}
                    </p>
                  </div>
                )}

                {showExplanation && (
                  <div className="bg-black/20 rounded-xl p-3 mt-3">
                    <p
                      className="text-cyan-300/80 text-sm leading-relaxed"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      💭 {riddle.explanation}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {stage === 'results' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">

          {/* Decoration */}
          <p className="text-cyan-700/40 text-sm text-center select-none shrink-0">— ✦ —</p>

          {/* Score */}
          <div className="text-center shrink-0">
            <div className="flex items-end justify-center gap-1">
              <p
                className="text-cyan-100 text-6xl font-bold leading-none"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {score}
              </p>
              <p className="text-cyan-700 text-xl leading-none mb-1">/ {maxScore}</p>
            </div>

            {/* Grade */}
            <p className="text-cyan-200 text-xl font-bold mt-2">
              {grade.emoji} {grade.title}
            </p>

            {/* New PB */}
            {isNewPB && (
              <p className="text-cyan-300 font-bold text-sm mt-1">✨ New Personal Best!</p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-cyan-600/50 text-xs mb-0.5">Solved</p>
              <p className="text-green-400 font-bold text-lg">{correctCount}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-cyan-600/50 text-xs mb-0.5">Missed</p>
              <p className="text-rose-400 font-bold text-lg">{total - correctCount}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-cyan-600/50 text-xs mb-0.5">Hints used</p>
              <p className="text-cyan-400 font-bold text-lg">{hintsRef.current}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-cyan-600/50 text-xs mb-0.5">Mode</p>
              <p className="text-cyan-600/70 font-bold text-sm leading-tight mt-0.5">{activeMode?.name ?? '—'}</p>
            </div>
          </div>

          {/* Daily: streak + countdown */}
          {mode === 'daily' && (
            <div className="text-center shrink-0 space-y-0.5">
              {streak > 0 && (
                <p className="text-cyan-300 font-semibold text-sm">🔥 {streak} day streak!</p>
              )}
              <p className="text-cyan-800 text-xs">Next riddle in {countdown}</p>
            </div>
          )}

          {/* Review first missed riddle */}
          {missedRiddle && (
            <div className="bg-black/20 rounded-xl p-4 shrink-0">
              <p className="text-cyan-600/60 text-xs uppercase tracking-widest mb-2">📖 You missed:</p>
              <p
                className="text-cyan-200/80 text-sm italic leading-relaxed mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {missedRiddle.question}
              </p>
              <p className="text-white font-bold text-sm">{missedRiddle.answer}</p>
              <p className="text-cyan-600/70 text-xs mt-1 leading-relaxed">{missedRiddle.explanation}</p>
            </div>
          )}

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-cyan-400/70 text-xs border border-cyan-900/30 bg-white/[0.03] hover:bg-cyan-950/30 transition-all shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Share result
          </button>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">
            {mode === 'daily' ? (
              <button
                type="button"
                disabled
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-cyan-600/40 bg-white/[0.02] border border-cyan-900/20 cursor-not-allowed"
              >
                Come Back Tomorrow
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 transition-all border border-cyan-500/20"
              >
                🔍 Play Again
              </button>
            )}
            <button
              type="button"
              onClick={handleQuit}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-cyan-400/70 bg-white/[0.03] border border-cyan-800/30 hover:bg-cyan-950/30 transition-all"
            >
              Change Mode
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
