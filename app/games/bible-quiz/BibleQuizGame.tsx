'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { BookOpen, Maximize2, Minimize2, X } from 'lucide-react'
import type {
  BibleMode, BibleDifficulty, Testament,
  BibleQuestion, VerseQuestion,
  TimelineEvent, TimelineQuestion, DailyChallenge,
} from '@/types/bible'
import {
  getRandomQuestions,
  VERSE_QUESTIONS,
  TIMELINE_QUESTIONS,
  getDailyChallenge,
  shuffleArray,
} from '@/data/bibleQuestions'

type Stage = 'setup' | 'playing' | 'results'

const ANSWER_TIME_SECONDS  = 15
const ADVANCE_DELAY_MS     = 2000
const POINTS_PER_CORRECT   = 5
const TOTAL_QUESTIONS      = 10
const TIMELINE_QS_PER_GAME = 5
const TL_EVENTS            = 4

const MODES: { id: BibleMode; icon: string; name: string; tagline: string }[] = [
  { id: 'quickfire', icon: '⚡', name: 'Quick Fire',      tagline: '10 questions. Race the clock.'    },
  { id: 'verse',     icon: '📖', name: 'Fill the Verse',  tagline: 'Complete the missing scripture.'  },
  { id: 'timeline',  icon: '📅', name: 'Bible Timeline',  tagline: 'Order events chronologically.'    },
  { id: 'daily',     icon: '🌅', name: 'Daily Challenge', tagline: "Today's themed set of questions." },
]

const TESTAMENTS: { id: Testament; label: string }[] = [
  { id: 'old',  label: 'Old Testament' },
  { id: 'both', label: 'Both'          },
  { id: 'new',  label: 'New Testament' },
]

const DIFFICULTIES: { id: BibleDifficulty; label: string; active: string }[] = [
  { id: 'easy',   label: 'Beginner',   active: 'bg-emerald-900/40 border-emerald-500 text-emerald-200' },
  { id: 'medium', label: 'Scholar',    active: 'bg-amber-800/40 border-amber-500 text-amber-200'       },
  { id: 'hard',   label: 'Theologian', active: 'bg-rose-900/40 border-rose-500 text-rose-200'          },
]

const HOW_TO_TIPS = [
  'Quick Fire: answer 10 trivia questions before the timer runs out.',
  'Fill the Verse: select the word or phrase that completes the Bible verse.',
  'Bible Timeline: tap events to select, then tap a slot to place them in order.',
  'Daily Challenge: a fresh themed set of 10 questions resets at midnight.',
  'Difficulty only applies to Quick Fire and Daily Challenge modes.',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeToMidnight(): string {
  const now      = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h    = Math.floor(diff / 3_600_000)
  const m    = Math.floor((diff % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function timerCls(t: number): string {
  if (t > 8) return 'bg-amber-900/40 border border-amber-700 text-amber-300'
  if (t > 4) return 'bg-yellow-900/40 border border-yellow-600 text-yellow-300'
  return 'bg-rose-900/40 border border-rose-700 text-rose-400 animate-pulse'
}

function optionCls(opt: string, correct: string, answered: boolean, selected: string | null): string {
  if (!answered) return 'bg-white/5 border border-amber-800/30 text-amber-200 hover:bg-amber-900/20 hover:border-amber-600/50 cursor-pointer'
  if (opt === correct)  return 'bg-green-900/40 border-2 border-green-500 text-green-200 cursor-default'
  if (opt === selected) return 'bg-red-900/40 border-2 border-red-500 text-red-300 cursor-default'
  return 'bg-white/5 border border-amber-900/20 text-amber-600/50 cursor-default'
}

function getGrade(score: number, max: number): { emoji: string; title: string; color: string } {
  const pct = max > 0 ? score / max : 0
  if (pct >= 0.9) return { emoji: '🏆', title: 'Theologian', color: 'text-yellow-300' }
  if (pct >= 0.7) return { emoji: '📖', title: 'Scholar',    color: 'text-amber-300'  }
  if (pct >= 0.5) return { emoji: '✨', title: 'Disciple',   color: 'text-blue-300'   }
  if (pct >= 0.3) return { emoji: '🌱', title: 'Seeker',     color: 'text-green-300'  }
  return                  { emoji: '🕊', title: 'Beginner',  color: 'text-stone-300'  }
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id:     i,
      x:      Math.random() * 100,
      delay:  Math.random() * 2.5,
      dur:    3 + Math.random() * 2,
      color:  (['#f59e0b','#fbbf24','#ef4444','#10b981','#3b82f6','#8b5cf6','#ec4899'] as string[])[i % 7],
      size:   5 + Math.floor(Math.random() * 7),
      circle: Math.random() > 0.5,
    })),
  [])
  return (
    <>
      <style>{`@keyframes cf-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(540deg);opacity:0}}.cf{animation:cf-fall linear forwards}`}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {pieces.map(p => (
          <div
            key={`cf-${p.id}`}
            className="cf absolute"
            style={{
              left: `${p.x}%`, top: 0,
              width: p.size, height: p.size,
              backgroundColor: p.color,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              borderRadius: p.circle ? '50%' : '2px',
            }}
          />
        ))}
      </div>
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibleQuizGame() {

  // ── Setup state ────────────────────────────────────────────────
  const [stage,          setStage]          = useState<Stage>('setup')
  const [mode,           setMode]           = useState<BibleMode | null>(null)
  const [testament,      setTestament]      = useState<Testament>('both')
  const [difficulty,     setDifficulty]     = useState<BibleDifficulty>('medium')
  const [streak,         setStreak]         = useState(0)
  const [dailyCompleted, setDailyCompleted] = useState(false)
  const [countdown,      setCountdown]      = useState('')
  const [bestScore,      setBestScore]      = useState<string | null>(null)
  const [showHowTo,      setShowHowTo]      = useState(false)
  const [isFullscreen,   setIsFullscreen]   = useState(false)

  // ── QF / Verse / Daily game state ─────────────────────────────
  const [questions,      setQuestions]      = useState<BibleQuestion[]>([])
  const [verseQs,        setVerseQs]        = useState<VerseQuestion[]>([])
  const [currentQ,       setCurrentQ]       = useState(0)
  const [score,          setScore]          = useState(0)
  const [hasAnswered,    setHasAnswered]     = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft,       setTimeLeft]       = useState(ANSWER_TIME_SECONDS)

  // ── Timeline state ─────────────────────────────────────────────
  const [tlQuestions,  setTlQuestions]  = useState<TimelineQuestion[]>([])
  const [tlQIdx,       setTlQIdx]       = useState(0)
  const [tlPool,       setTlPool]       = useState<TimelineEvent[]>([])
  const [tlSlots,      setTlSlots]      = useState<(TimelineEvent | null)[]>([null, null, null, null])
  const [tlSubmitted,  setTlSubmitted]  = useState(false)
  const [tlSelected,   setTlSelected]   = useState<string | null>(null)
  const [tlDragId,     setTlDragId]     = useState<string | null>(null)
  const [tlDragOver,   setTlDragOver]   = useState<number | null>(null)

  // ── Daily data ─────────────────────────────────────────────────
  const [dailyChalData,   setDailyChalData]   = useState<DailyChallenge | null>(null)
  const [dailySavedScore, setDailySavedScore] = useState<number | null>(null)

  // ── Results state ──────────────────────────────────────────────
  const [finalScore,    setFinalScore]    = useState(0)
  const [newPB,         setNewPB]         = useState(false)
  const [correctCount,  setCorrectCount]  = useState(0)
  const [totalPossible, setTotalPossible] = useState(TOTAL_QUESTIONS)
  const [wrongAnswers,  setWrongAnswers]  = useState<{ question: string; correct: string; explanation: string }[]>([])

  const cardRef  = useRef<HTMLDivElement>(null)
  const scoreRef = useRef(0)

  // ── Init effects ───────────────────────────────────────────────
  useEffect(() => {
    setStreak(Number(localStorage.getItem('bible_streak') ?? '0'))
    const today    = new Date().toISOString().split('T')[0]
    const savedDay = localStorage.getItem(`bible_daily_${today}`)
    if (savedDay) {
      try {
        const p = JSON.parse(savedDay)
        setDailyCompleted(p.completed === true)
        if (typeof p.score === 'number') setDailySavedScore(p.score)
      } catch {
        setDailyCompleted(savedDay === '1')
      }
    }
    setCountdown(timeToMidnight())
    const t = setInterval(() => setCountdown(timeToMidnight()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setBestScore(mode ? localStorage.getItem(`bible_best_${mode}`) : null)
  }, [mode])

  // Fix 2: fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Fix 2: Esc to exit fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await cardRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }

  // ── Start ──────────────────────────────────────────────────────
  function handleStart() {
    if (!mode || (mode === 'daily' && dailyCompleted)) return

    scoreRef.current = 0
    setScore(0)
    setFinalScore(0)
    setCurrentQ(0)
    setHasAnswered(false)
    setSelectedAnswer(null)
    setTimeLeft(ANSWER_TIME_SECONDS)
    setNewPB(false)
    setCorrectCount(0)
    setWrongAnswers([])

    if (mode === 'verse') {
      setVerseQs(shuffleArray([...VERSE_QUESTIONS]).slice(0, TOTAL_QUESTIONS))
      setTotalPossible(TOTAL_QUESTIONS)
    } else if (mode === 'daily') {
      const dc = getDailyChallenge()
      setDailyChalData(dc)
      setQuestions(dc.questions.slice(0, TOTAL_QUESTIONS))
      setTotalPossible(TOTAL_QUESTIONS)
    } else if (mode === 'timeline') {
      const tqs = shuffleArray([...TIMELINE_QUESTIONS]).slice(0, TIMELINE_QS_PER_GAME)
      setTlQuestions(tqs)
      setTlQIdx(0)
      setTlPool(shuffleArray([...tqs[0].events]))
      setTlSlots([null, null, null, null])
      setTlSubmitted(false)
      setTlSelected(null)
      setTlDragId(null)
      setTotalPossible(TIMELINE_QS_PER_GAME * TL_EVENTS)
    } else {
      setQuestions(getRandomQuestions(TOTAL_QUESTIONS, difficulty, testament))
      setTotalPossible(TOTAL_QUESTIONS)
    }

    setStage('playing')
  }

  // Fix 3: consolidated timer — deps include currentQ to restart cleanly per question
  useEffect(() => {
    if (stage !== 'playing' || mode !== 'quickfire' || hasAnswered) return
    const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [stage, mode, hasAnswered, currentQ])

  useEffect(() => {
    if (timeLeft === 0 && stage === 'playing' && mode === 'quickfire' && !hasAnswered) {
      setHasAnswered(true)
    }
  }, [timeLeft, stage, mode, hasAnswered])

  // ── Auto-advance (QF / Verse / Daily) ─────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing' || mode === 'timeline') return
    const next = currentQ + 1
    const t = setTimeout(() => {
      if (next >= TOTAL_QUESTIONS) {
        finishGame()
      } else {
        setCurrentQ(next)
        setHasAnswered(false)
        setSelectedAnswer(null)
        setTimeLeft(ANSWER_TIME_SECONDS)
      }
    }, ADVANCE_DELAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnswered, stage, currentQ, mode])

  // ── Answer handler ─────────────────────────────────────────────
  function handleAnswer(answer: string) {
    if (hasAnswered) return
    const q = mode === 'verse' ? verseQs[currentQ] : questions[currentQ]
    if (!q) return
    const isCorrect = answer === q.correctAnswer
    if (isCorrect) {
      scoreRef.current += POINTS_PER_CORRECT
      setScore(scoreRef.current)
      setCorrectCount(c => c + 1)
    } else {
      const questionText = mode === 'verse'
        ? `${(q as VerseQuestion).verseBefore}...`
        : (q as BibleQuestion).question
      setWrongAnswers(prev => [...prev, {
        question: questionText, correct: q.correctAnswer, explanation: q.explanation,
      }])
    }
    setSelectedAnswer(answer)
    setHasAnswered(true)
  }

  // ── Timeline handlers ──────────────────────────────────────────
  function handleTlPoolClick(event: TimelineEvent) {
    if (tlSubmitted) return
    setTlSelected(prev => prev === event.id ? null : event.id)
  }

  function handleTlSlotClick(slotIdx: number) {
    if (tlSubmitted) return
    const slotEvent = tlSlots[slotIdx]
    const newSlots  = [...tlSlots]
    if (slotEvent) {
      const selectedEvent = tlSelected ? tlPool.find(e => e.id === tlSelected) : null
      if (selectedEvent) {
        newSlots[slotIdx] = selectedEvent
        setTlPool(prev => [...prev.filter(e => e.id !== tlSelected), slotEvent])
        setTlSelected(null)
      } else {
        newSlots[slotIdx] = null
        setTlPool(prev => [...prev, slotEvent])
      }
      setTlSlots(newSlots)
    } else if (tlSelected) {
      const selectedEvent = tlPool.find(e => e.id === tlSelected)
      if (!selectedEvent) return
      newSlots[slotIdx] = selectedEvent
      setTlSlots(newSlots)
      setTlPool(prev => prev.filter(e => e.id !== tlSelected))
      setTlSelected(null)
    }
  }

  function handleTlDragStart(eventId: string) { setTlDragId(eventId); setTlSelected(null) }
  function handleTlSlotDragStart(eventId: string) { setTlDragId(eventId); setTlSelected(null) }

  function handleTlDrop(slotIdx: number) {
    setTlDragOver(null)
    if (!tlDragId || tlSubmitted) { setTlDragId(null); return }
    const fromPool    = tlPool.find(e => e.id === tlDragId)
    const fromSlotIdx = tlSlots.findIndex(e => e?.id === tlDragId)
    const dragged     = fromPool ?? tlSlots[fromSlotIdx]
    if (!dragged) { setTlDragId(null); return }
    const target   = tlSlots[slotIdx]
    const newSlots = [...tlSlots]
    if (fromPool) {
      newSlots[slotIdx] = dragged
      setTlPool(prev => {
        const without = prev.filter(e => e.id !== tlDragId)
        return target ? [...without, target] : without
      })
    } else {
      newSlots[fromSlotIdx] = target
      newSlots[slotIdx]     = dragged
    }
    setTlSlots(newSlots)
    setTlDragId(null)
  }

  function handleTlSubmit() {
    let roundScore = 0; let roundCorrect = 0
    tlSlots.forEach((event, i) => {
      if (event && event.order === i + 1) {
        roundScore += POINTS_PER_CORRECT; roundCorrect++
      } else if (event) {
        setWrongAnswers(prev => [...prev, {
          question: event.event, correct: `Position ${event.order}`, explanation: event.description,
        }])
      }
    })
    scoreRef.current += roundScore
    setScore(scoreRef.current)
    setCorrectCount(c => c + roundCorrect)
    setTlSubmitted(true)
    if (roundScore === TL_EVENTS * POINTS_PER_CORRECT) setTimeout(() => handleTlNext(), ADVANCE_DELAY_MS)
  }

  function handleTlNext() {
    const nextIdx = tlQIdx + 1
    if (nextIdx >= TIMELINE_QS_PER_GAME) {
      const normalized = Math.round(scoreRef.current / 2)
      scoreRef.current = normalized
      setScore(normalized)
      finishGame()
    } else {
      setTlQIdx(nextIdx)
      const q = tlQuestions[nextIdx]
      setTlPool(shuffleArray([...q.events]))
      setTlSlots([null, null, null, null])
      setTlSubmitted(false)
      setTlSelected(null)
      setTlDragId(null)
    }
  }

  // ── Finish ─────────────────────────────────────────────────────
  function finishGame() {
    const fs = scoreRef.current
    setFinalScore(fs)
    if (mode) {
      const key   = `bible_best_${mode}`
      const rawPB = localStorage.getItem(key)
      const prev  = rawPB ? parseInt(rawPB.split('/')[0]) : -1
      if (fs > prev) {
        const s = `${fs}/50`
        localStorage.setItem(key, s)
        setBestScore(s)
        setNewPB(true)
      }
    }
    if (mode === 'daily') {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(`bible_daily_${today}`, JSON.stringify({ score: fs, completed: true }))
      setDailyCompleted(true)
      setDailySavedScore(fs)
      const last      = localStorage.getItem('bible_streak_last')
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const newStreak = last === yesterday.toISOString().split('T')[0] ? streak + 1 : 1
      setStreak(newStreak)
      localStorage.setItem('bible_streak', String(newStreak))
      localStorage.setItem('bible_streak_last', today)
    }
    setStage('results')
  }

  // ── Derived ────────────────────────────────────────────────────
  const canStart      = !!mode && !(mode === 'daily' && dailyCompleted)
  const showTestament = mode !== 'timeline'
  const showDiff      = mode !== 'daily' && mode !== 'timeline'
  const activeMode    = MODES.find(m => m.id === mode)
  const canPlayAgain  = mode !== 'daily' || !dailyCompleted

  const progressPct = mode === 'timeline'
    ? ((tlSubmitted ? tlQIdx + 1 : tlQIdx) / TIMELINE_QS_PER_GAME) * 100
    : ((currentQ + (hasAnswered ? 1 : 0)) / TOTAL_QUESTIONS) * 100

  const bibleQ  = (mode === 'quickfire' || mode === 'daily') ? questions[currentQ] : undefined
  const verseQ  = mode === 'verse' ? verseQs[currentQ] : undefined
  const correct = (bibleQ ?? verseQ)?.correctAnswer ?? ''

  const tlAllFilled  = tlSlots.every(s => s !== null)
  const tlAllCorrect = tlSlots.every((s, i) => s?.order === i + 1)

  const maxScore     = 50
  const grade        = getGrade(finalScore, maxScore)
  const showConfetti = finalScore / maxScore >= 0.7
  const firstWrong   = wrongAnswers[0]

  // Fix 5: composite key helpers
  const qKey  = `q${currentQ}`
  const tlKey = `tl${tlQIdx}`

  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="bible-quiz-card h-full flex flex-col rounded-2xl bg-gradient-to-br from-red-950 to-stone-900"
      style={{
        border:    '2px solid rgba(234,179,8,0.35)',
        boxShadow: '0 0 0 1px rgba(234,179,8,0.35), 0 0 40px rgba(234,179,8,0.08), 0 25px 50px rgba(0,0,0,0.6)',
      }}
    >

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 shrink-0">
        <BookOpen className="h-6 w-6 text-amber-400 shrink-0" />
        <span className="text-amber-600/30 text-lg select-none leading-none">✝</span>
        {/* Fix 2: title scales in fullscreen */}
        <h1 className={`text-amber-100 font-bold flex-1 leading-none ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
          Bible Quiz
        </h1>

        {stage === 'playing' && mode === 'quickfire' && (
          <div className={`rounded-xl w-11 h-11 flex items-center justify-center font-mono font-bold text-base shrink-0 ${timerCls(timeLeft)}`}>
            {timeLeft}
          </div>
        )}

        {stage === 'playing' && (
          <button
            type="button"
            onClick={() => setStage('setup')}
            className="text-amber-900/60 hover:text-rose-400 transition-colors p-1"
            aria-label="Quit"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-amber-900/60 hover:text-amber-400 transition-colors p-1"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Progress bar or HR ────────────────────────────────────── */}
      {stage === 'playing' ? (
        <div className="h-1 bg-amber-900/30 shrink-0 relative">
          <div
            className="absolute inset-y-0 left-0 bg-amber-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : (
        <hr className="border-amber-900/50 mx-5 shrink-0" />
      )}

      {/* ── Setup ─────────────────────────────────────────────────── */}
      {/* Fix 1: justify-center to vertically center content when space allows */}
      {stage === 'setup' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-center">

          <p className="text-amber-200/70 text-xs font-serif italic text-center mb-4">
            Welcome to Bible Quiz
          </p>

          <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-widest text-center mb-2">
            Choose Mode
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {MODES.map(m => (
              <button
                key={`mode-${m.id}`}
                type="button"
                onClick={() => setMode(m.id)}
                className={[
                  'rounded-2xl p-3 text-left transition-all duration-200',
                  mode === m.id
                    ? 'bg-amber-900/30 border-2 border-amber-500 shadow-lg shadow-amber-500/15'
                    : 'bg-white/5 border border-amber-900/30 hover:border-amber-500/40 hover:bg-amber-900/10',
                ].join(' ')}
              >
                <div className="text-3xl text-center mb-1">{m.icon}</div>
                <div className="text-amber-100 font-semibold text-sm text-center">{m.name}</div>
                <div className="text-amber-400/60 text-xs text-center mt-0.5">{m.tagline}</div>
              </button>
            ))}
          </div>

          {showTestament && (
            <div className="mb-1">
              <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-widest text-center mb-2 mt-3">
                Testament
              </p>
              <div className="flex justify-center gap-2">
                {TESTAMENTS.map(t => (
                  <button
                    key={`testament-${t.id}`}
                    type="button"
                    onClick={() => setTestament(t.id)}
                    className={[
                      'rounded-full px-3 py-1 text-xs transition-all border',
                      testament === t.id
                        ? 'bg-amber-700/40 border-amber-500 text-amber-200'
                        : 'bg-white/5 border-amber-900/30 text-amber-300/60 hover:border-amber-700/50 hover:text-amber-300/80',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showDiff && (
            <div className="mb-1">
              <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-widest text-center mb-2 mt-3">
                Difficulty
              </p>
              <div className="flex justify-center gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={`diff-${d.id}`}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={[
                      'rounded-full px-3 py-1 text-xs transition-all border',
                      difficulty === d.id
                        ? d.active
                        : 'bg-white/5 border-amber-900/30 text-amber-300/60 hover:border-amber-700/50 hover:text-amber-300/80',
                    ].join(' ')}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {streak > 0 && (
            <p className="text-amber-300 text-sm text-center mt-3">🔥 {streak} day streak</p>
          )}

          {bestScore && activeMode && (
            <p className="text-amber-600/60 text-xs text-center mt-1">
              Your best: {bestScore} on {activeMode.name}
            </p>
          )}

          {mode === 'daily' && dailyCompleted ? (
            <div className="mt-4 text-center space-y-1">
              <p className="text-amber-400 text-sm">
                ✓ Completed Today{dailySavedScore !== null ? ` — Score: ${dailySavedScore}/50` : ''}
              </p>
              <p className="text-amber-600/50 text-xs">New challenge in {countdown}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className={[
                'mt-4 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all',
                'border border-amber-500/30 shadow-lg shadow-amber-700/30',
                canStart
                  ? 'bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 cursor-pointer'
                  : 'bg-amber-950/40 text-amber-700/50 cursor-not-allowed',
              ].join(' ')}
            >
              ✝ Start Quiz
            </button>
          )}

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-amber-700/50 text-xs underline hover:text-amber-500/70 transition-colors"
            >
              {showHowTo ? 'Hide guide' : 'How to play'}
            </button>
            {showHowTo && (
              <div className="mt-2 text-left bg-amber-950/30 rounded-xl p-3 border border-amber-900/30 space-y-1.5">
                {HOW_TO_TIPS.map((tip, i) => (
                  <p key={`tip-${i}`} className="text-amber-400/60 text-xs leading-relaxed">
                    <span className="text-amber-700/50 mr-1.5">✝</span>{tip}
                  </p>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Quick Fire + Daily ────────────────────────────────────── */}
      {stage === 'playing' && (mode === 'quickfire' || mode === 'daily') && bibleQ && (
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">

          {mode === 'daily' && dailyChalData && (
            <div className="bg-amber-900/40 rounded-xl p-3 mb-4 border border-amber-700/30 shrink-0">
              <p className="text-amber-200 font-bold text-base">📅 Today's Theme: {dailyChalData.theme}</p>
              <p className="text-amber-400/70 text-xs mt-0.5">{dailyChalData.description}</p>
            </div>
          )}

          {/* Fix 4: composite key includes question index */}
          <p key={`cat-${qKey}`} className="text-amber-500/70 text-xs uppercase tracking-widest font-semibold text-center mb-3 shrink-0">
            {bibleQ.category} — {bibleQ.book}
          </p>

          <div className="relative bg-white/5 border border-amber-900/30 rounded-2xl p-5 mb-4 shrink-0">
            {bibleQ.category === 'verses' && (
              <span
                className="absolute inset-0 flex items-center justify-center text-[120px] text-amber-900/10 select-none pointer-events-none"
                style={{ fontFamily: 'Georgia, serif' }}
              >✝</span>
            )}
            {/* Fix 2: text scales in fullscreen */}
            <p
              className={`relative z-10 text-amber-100 font-semibold leading-relaxed text-center ${isFullscreen ? 'text-xl' : 'text-lg'}`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {bibleQ.question}
            </p>
          </div>

          {/* Fix 2 + 4 + 5: composite keys, responsive grid, fullscreen padding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
            {bibleQ.options.map((opt, i) => (
              <button
                key={`${qKey}-opt-${i}`}
                type="button"
                onClick={() => handleAnswer(opt)}
                className={[
                  'rounded-xl font-medium text-left transition-all duration-150',
                  isFullscreen ? 'py-4 px-5 text-base' : 'py-3 px-4 text-sm',
                  optionCls(opt, correct, hasAnswered, selectedAnswer),
                ].join(' ')}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {opt}
              </button>
            ))}
          </div>

          {hasAnswered && (
            <div className="bg-amber-950/60 border border-amber-800/40 rounded-xl p-3 mt-3 shrink-0">
              <p className="text-amber-400 text-xs font-semibold mb-1">📖 {bibleQ.book}</p>
              <p className="text-amber-200/80 text-xs leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                {bibleQ.explanation}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ── Fill the Verse ────────────────────────────────────────── */}
      {stage === 'playing' && mode === 'verse' && verseQ && (
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col items-center">

          <p className="text-amber-500/60 text-xs mb-3">
            Question {currentQ + 1} of {TOTAL_QUESTIONS}
          </p>

          <span className="text-amber-400 text-sm font-semibold bg-amber-900/30 rounded-full px-3 py-1 mb-4">
            📖 {verseQ.reference}
          </span>

          <div className="bg-white/5 border border-amber-900/30 rounded-2xl p-5 w-full mb-4">
            <p
              className={`text-amber-100 leading-loose text-center ${isFullscreen ? 'text-xl' : 'text-lg'}`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {verseQ.verseBefore}{' '}
              <span
                className="inline-block min-w-[80px] border-b-2 border-amber-500 text-amber-500 mx-1 text-center font-bold"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {hasAnswered ? correct : '___'}
              </span>
            </p>
          </div>

          {/* Fix 4: composite keys for verse options */}
          <div className="flex flex-wrap justify-center gap-2 w-full mb-4">
            {verseQ.options.map((opt, i) => (
              <button
                key={`${qKey}-vopt-${i}`}
                type="button"
                onClick={() => handleAnswer(opt)}
                className={[
                  'rounded-lg font-semibold transition-all border',
                  isFullscreen ? 'px-5 py-3 text-lg' : 'px-4 py-2 text-base',
                  !hasAnswered
                    ? 'bg-amber-900/20 border-amber-700/40 text-amber-200 hover:bg-amber-800/40 hover:border-amber-500 cursor-pointer'
                    : opt === correct
                      ? 'bg-green-900/40 border-2 border-green-500 text-green-200 cursor-default'
                      : opt === selectedAnswer
                        ? 'bg-red-900/40 border-2 border-red-500 text-red-300 cursor-default'
                        : 'bg-white/5 border-amber-900/20 text-amber-600/50 cursor-default',
                ].join(' ')}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {opt}
              </button>
            ))}
          </div>

          {hasAnswered && (
            <div className="bg-black/20 rounded-xl p-3 w-full">
              <p className="text-amber-200/70 text-xs italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                {verseQ.fullVerse}
              </p>
              <p className="text-amber-400/70 text-xs mt-2">{verseQ.explanation}</p>
            </div>
          )}

        </div>
      )}

      {/* ── Bible Timeline ────────────────────────────────────────── */}
      {stage === 'playing' && mode === 'timeline' && tlQuestions[tlQIdx] && (
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">

          <div className="text-center shrink-0">
            <p className="text-amber-500/60 text-xs">
              Timeline {tlQIdx + 1} of {TIMELINE_QS_PER_GAME}
            </p>
            <p className="text-amber-200 text-sm mt-0.5">Arrange these events in biblical order</p>
            <p className="text-amber-600/50 text-xs">
              {tlSelected ? 'Now tap a slot to place it' : 'Tap an event to select it'}
            </p>
          </div>

          {/* Pool */}
          {tlPool.length > 0 && (
            <div className="flex flex-col gap-2 shrink-0">
              <p className="text-amber-500/60 text-xs uppercase tracking-widest text-center">Available Events</p>
              {/* Fix 4: composite key for timeline pool events */}
              {tlPool.map(event => (
                <div
                  key={`${tlKey}-pool-${event.id}`}
                  draggable
                  onDragStart={() => handleTlDragStart(event.id)}
                  onDragEnd={() => { setTlDragId(null); setTlDragOver(null) }}
                  onClick={() => handleTlPoolClick(event)}
                  className={[
                    'border rounded-xl p-3 cursor-grab select-none transition-all',
                    tlSelected === event.id
                      ? 'bg-amber-900/40 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/30'
                      : 'bg-white/5 border-amber-800/30 hover:border-amber-700/50 hover:bg-amber-900/10',
                  ].join(' ')}
                >
                  <p className="text-amber-100 font-semibold text-sm">{event.event}</p>
                  <p className="text-amber-400/70 text-xs mt-0.5 leading-relaxed">{event.description}</p>
                  <span className="text-amber-600/50 text-xs">{event.period}</span>
                </div>
              ))}
            </div>
          )}

          {/* Slots */}
          <div className="flex flex-col gap-2 shrink-0">
            <p className="text-amber-500/60 text-xs uppercase tracking-widest text-center">
              Your Order — Earliest to Latest
            </p>
            {(['1st', '2nd', '3rd', '4th'] as const).map((label, i) => {
              const slotEvent    = tlSlots[i]
              const isCorrect    = tlSubmitted && slotEvent !== null && slotEvent.order === i + 1
              const isWrong      = tlSubmitted && slotEvent !== null && slotEvent.order !== i + 1
              const isDragTarget = tlDragOver === i && !tlSubmitted

              return (
                <div
                  key={`${tlKey}-slot-${i}`}
                  onDragOver={e => { e.preventDefault(); setTlDragOver(i) }}
                  onDragLeave={() => setTlDragOver(null)}
                  onDrop={() => handleTlDrop(i)}
                  onClick={() => handleTlSlotClick(i)}
                  className={[
                    'min-h-[60px] border-2 border-dashed rounded-xl p-3 transition-all cursor-pointer select-none',
                    isCorrect    ? 'bg-green-900/30 border-green-500' :
                    isWrong      ? 'bg-red-900/30 border-red-500' :
                    isDragTarget ? 'bg-amber-900/30 border-amber-500' :
                    slotEvent    ? 'bg-amber-900/20 border-amber-700/40' :
                                   'bg-black/20 border-amber-800/30 hover:border-amber-700/50',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-2">
                    <span className={[
                      'text-xs font-bold shrink-0 mt-0.5 w-6',
                      isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-amber-600/50',
                    ].join(' ')}>
                      {label}
                    </span>
                    {slotEvent ? (
                      <div
                        className="flex-1"
                        draggable={!tlSubmitted}
                        onDragStart={!tlSubmitted ? e => { e.stopPropagation(); handleTlSlotDragStart(slotEvent.id) } : undefined}
                        onDragEnd={() => { setTlDragId(null); setTlDragOver(null) }}
                      >
                        <p className="text-amber-100 font-semibold text-sm">{slotEvent.event}</p>
                        <p className="text-amber-400/70 text-xs">{slotEvent.period}</p>
                        {tlSubmitted && (
                          <p className={`text-xs mt-0.5 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✓ Correct' : `✗ Should be position ${slotEvent.order}`}
                          </p>
                        )}
                        {tlSubmitted && (
                          <p className="text-amber-500/50 text-xs">📖 {slotEvent.reference}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-amber-700/30 text-xs italic">
                        {isDragTarget ? 'Drop here' : tlSelected ? 'Tap to place' : 'Empty'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {!tlSubmitted && tlAllFilled && (
            <button
              type="button"
              onClick={handleTlSubmit}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-amber-700 hover:bg-amber-600 transition-all border border-amber-500/30 shrink-0"
            >
              Check Order →
            </button>
          )}

          {tlSubmitted && !tlAllCorrect && (
            <button
              type="button"
              onClick={handleTlNext}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-amber-700 hover:bg-amber-600 transition-all border border-amber-500/30 shrink-0"
            >
              Next →
            </button>
          )}

        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────── */}
      {stage === 'results' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col items-center relative">

          {showConfetti && <Confetti />}

          <p className="text-amber-600/40 text-sm mb-3 select-none">✦ ─────── ✝ ─────── ✦</p>

          <p className="text-5xl mb-1">{grade.emoji}</p>
          <p
            className={`text-2xl font-bold mb-3 ${grade.color}`}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {grade.title}
          </p>

          <div className="text-center mb-3">
            <span className="text-amber-100 text-6xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              {finalScore}
            </span>
            <span className="text-amber-500/70 text-xl"> / {maxScore}</span>
          </div>

          <div className="flex gap-4 text-sm mb-3 flex-wrap justify-center">
            <span className="text-green-400">✓ {correctCount} correct</span>
            <span className="text-rose-400">✗ {totalPossible - correctCount} wrong</span>
            <span className="text-amber-400">{activeMode?.name}</span>
          </div>

          {newPB && <p className="text-amber-300 font-bold text-sm mb-2">✨ New Personal Best!</p>}
          {bestScore && !newPB && <p className="text-amber-600/70 text-sm mb-2">Your Best: {bestScore}</p>}

          {mode === 'daily' && streak > 0 && (
            <p className="text-amber-300 font-semibold text-base mb-3">🔥 {streak} day streak!</p>
          )}

          {firstWrong && (
            <div className="bg-black/20 rounded-xl p-3 w-full mb-3">
              <p className="text-amber-400/70 text-xs font-semibold uppercase mb-2">📖 Review</p>
              <p className="text-amber-200/80 text-sm mb-1 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                {firstWrong.question}
              </p>
              <p className="text-green-400 text-sm font-bold mb-1">{firstWrong.correct}</p>
              <p className="text-amber-400/60 text-xs leading-relaxed">{firstWrong.explanation}</p>
            </div>
          )}

          <div className="w-full flex gap-2 mt-auto pt-2">
            {canPlayAgain && (
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 transition-all border border-amber-500/30"
              >
                ✝ Play Again
              </button>
            )}
            <button
              type="button"
              onClick={() => setStage('setup')}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-amber-300/80 bg-white/5 border border-amber-800/30 hover:bg-amber-900/20 transition-all"
            >
              Change Mode
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
