'use client'

import { useState, useEffect, useRef } from 'react'
import { Trophy, Maximize2, Minimize2, X, Download } from 'lucide-react'
import type {
  KnowledgeCategory, KnowledgeMode, KnowledgeDifficulty, KnowledgeQuestion,
} from '@/types/knowledge'
import { CATEGORIES } from '@/types/knowledge'
import { getQuestions, getArenaQuestions, getDailyQuestions } from '@/data/knowledgeQuestions'

// ─── Constants ────────────────────────────────────────────────────────────────

type Stage = 'setup' | 'playing' | 'badge' | 'results'

const POINTS_CORRECT    = 5
const TIME_PER_QUESTION = 15
const ADVANCE_DELAY     = 2000
const BADGE_DISPLAY     = 2500

const MODES: { id: KnowledgeMode; icon: string; name: string; tagline: string }[] = [
  { id: 'blitz',       icon: '🎯', name: 'Category Blitz',   tagline: 'Master one category at a time'        },
  { id: 'arena',       icon: '🏟️', name: 'Arena Mode',       tagline: '14 questions across all 7 topics'     },
  { id: 'suddendeath', icon: '⚡', name: 'Sudden Death',     tagline: 'One wrong answer ends it all'         },
  { id: 'daily',       icon: '📅', name: 'Daily Grand Quiz', tagline: '7 questions. One from each category.' },
]

const DIFFICULTIES: { id: KnowledgeDifficulty; label: string; active: string }[] = [
  { id: 'easy',   label: 'Easy',   active: 'bg-emerald-900/40 border-emerald-500 text-emerald-300' },
  { id: 'medium', label: 'Medium', active: 'bg-zinc-700 border-zinc-400 text-white'                },
  { id: 'hard',   label: 'Hard',   active: 'bg-rose-900/40 border-rose-500 text-rose-300'          },
]

const CAT_SHORT: Record<KnowledgeCategory, string> = {
  science:       'Science',
  history:       'History',
  sports:        'Sports',
  entertainment: 'Pop Culture',
  finance:       'Finance',
  health:        'Health',
  arts:          'Arts',
}

const CAT_PILL_SEL: Record<KnowledgeCategory, string> = {
  science:       'border-emerald-500 bg-emerald-950/50 text-emerald-300',
  history:       'border-amber-500 bg-amber-950/50 text-amber-300',
  sports:        'border-sky-500 bg-sky-950/50 text-sky-300',
  entertainment: 'border-pink-500 bg-pink-950/50 text-pink-300',
  finance:       'border-violet-500 bg-violet-950/50 text-violet-300',
  health:        'border-rose-500 bg-rose-950/50 text-rose-300',
  arts:          'border-indigo-500 bg-indigo-950/50 text-indigo-300',
}

const CAT_BADGE_SEL: Record<KnowledgeCategory, string> = {
  science:       'text-emerald-400',
  history:       'text-amber-400',
  sports:        'text-sky-400',
  entertainment: 'text-pink-400',
  finance:       'text-violet-400',
  health:        'text-rose-400',
  arts:          'text-indigo-400',
}

const CAT_PROGRESS: Record<KnowledgeCategory, string> = {
  science:       'bg-emerald-500',
  history:       'bg-amber-500',
  sports:        'bg-sky-500',
  entertainment: 'bg-pink-500',
  finance:       'bg-violet-500',
  health:        'bg-rose-500',
  arts:          'bg-indigo-500',
}

const CAT_INDICATOR: Record<KnowledgeCategory, string> = {
  science:       'bg-emerald-950/50 border-emerald-700/50 text-emerald-300',
  history:       'bg-amber-950/50 border-amber-700/50 text-amber-300',
  sports:        'bg-sky-950/50 border-sky-700/50 text-sky-300',
  entertainment: 'bg-pink-950/50 border-pink-700/50 text-pink-300',
  finance:       'bg-violet-950/50 border-violet-700/50 text-violet-300',
  health:        'bg-rose-950/50 border-rose-700/50 text-rose-300',
  arts:          'bg-indigo-950/50 border-indigo-700/50 text-indigo-300',
}

const CAT_TEXT: Record<KnowledgeCategory, string> = {
  science:       'text-emerald-400',
  history:       'text-amber-400',
  sports:        'text-sky-400',
  entertainment: 'text-pink-400',
  finance:       'text-violet-400',
  health:        'text-rose-400',
  arts:          'text-indigo-400',
}

const HOW_TO_GUIDE = [
  { label: 'Category Blitz',   body: 'Answer questions from your chosen category. Score 80%+ to earn that category\'s badge.' },
  { label: 'Arena Mode',       body: '14 questions across all 7 knowledge categories in two rounds. Breadth wins here.' },
  { label: 'Sudden Death',     body: 'Answer correctly to keep going. One wrong answer and the game ends immediately.' },
  { label: 'Daily Grand Quiz', body: '7 questions — one per category — every day. Return tomorrow for a new set.' },
  { label: 'Badges',           body: 'Score 80% or more in Category Blitz to earn that category\'s badge. Collect all 7!' },
]

// Pre-computed confetti particles
const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => ({
  left:  (i * 37 + 11) % 100,
  delay: (i * 0.13) % 1.8,
  dur:   1.6 + (i * 0.07) % 1.4,
  color: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c'][i % 6],
  w:     4 + (i % 3) * 2,
  h:     6 + (i % 4) * 2,
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (t > 9) return 'bg-zinc-800 text-white border-zinc-600'
  if (t > 4) return 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
  return 'bg-rose-900/50 text-rose-400 border-rose-700 animate-pulse'
}

function getGrade(acc: number): { emoji: string; title: string } {
  if (acc >= 1.0) return { emoji: '🏆', title: 'Grand Champion' }
  if (acc >= 0.8) return { emoji: '⭐', title: 'Expert'         }
  if (acc >= 0.6) return { emoji: '🎯', title: 'Contender'     }
  if (acc >= 0.4) return { emoji: '📚', title: 'Student'       }
  return               { emoji: '🌱', title: 'Trainee'        }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KnowledgeGame() {

  // ── Setup state ────────────────────────────────────────────────
  const [stage,            setStage]            = useState<Stage>('setup')
  const [mode,             setMode]             = useState<KnowledgeMode | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | null>(null)
  const [difficulty,       setDifficulty]       = useState<KnowledgeDifficulty>('medium')
  const [streak,           setStreak]           = useState(0)
  const [dailyCompleted,   setDailyCompleted]   = useState(false)
  const [dailyCorrect,     setDailyCorrect]     = useState(0)
  const [countdown,        setCountdown]        = useState('')
  const [badges,           setBadges]           = useState<KnowledgeCategory[]>([])
  const [bestScore,        setBestScore]        = useState<string | null>(null)
  const [showHowTo,        setShowHowTo]        = useState(false)
  const [isFullscreen,     setIsFullscreen]     = useState(false)
  const [newBadgeEarned,   setNewBadgeEarned]   = useState(false)
  const [isNewBest,        setIsNewBest]        = useState(false)
  const [showConfetti,     setShowConfetti]     = useState(false)

  // ── Game state ─────────────────────────────────────────────────
  const [questions,       setQuestions]       = useState<KnowledgeQuestion[]>([])
  const [currentIdx,      setCurrentIdx]      = useState(0)
  const [selected,        setSelected]        = useState<string | null>(null)
  const [hasAnswered,     setHasAnswered]     = useState(false)
  const [gameScore,       setGameScore]       = useState(0)
  const [gameStreak,      setGameStreak]      = useState(0)
  const [timeLeft,        setTimeLeft]        = useState(TIME_PER_QUESTION)
  const [qResults,        setQResults]        = useState<{ correct: boolean; category: KnowledgeCategory }[]>([])
  const [showExplanation, setShowExplanation] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  // ── Init: streak, daily save, badges ──────────────────────────
  useEffect(() => {
    setStreak(Number(localStorage.getItem('gk_streak') ?? '0'))
    const today    = new Date().toISOString().split('T')[0]
    const todayKey = `gk_daily_${today}`
    const saved    = localStorage.getItem(todayKey)
    if (saved) {
      setDailyCompleted(true)
      try {
        const parsed = JSON.parse(saved)
        setDailyCorrect(parsed.correct ?? 0)
      } catch { /* */ }
    }
    try {
      const raw = localStorage.getItem('gk_badges')
      if (raw) setBadges(JSON.parse(raw) as KnowledgeCategory[])
    } catch { /* */ }
  }, [])

  // ── Countdown — only ticks once daily is completed ─────────────
  useEffect(() => {
    if (!dailyCompleted) return
    const tick = () => setCountdown(timeToMidnight())
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [dailyCompleted])

  // ── Update best score when selection changes ───────────────────
  useEffect(() => {
    if (!mode) { setBestScore(null); return }
    let key = ''
    if (mode === 'blitz' && selectedCategory) {
      key = `gk_best_blitz_${selectedCategory}_${difficulty}`
    } else if (mode === 'arena') {
      key = `gk_best_arena_${difficulty}`
    } else if (mode === 'suddendeath') {
      key = 'gk_best_sudden'
    }
    setBestScore(key ? localStorage.getItem(key) : null)
  }, [mode, selectedCategory, difficulty])

  // ── Fullscreen sync ────────────────────────────────────────────
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // ── ESC exits fullscreen ───────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  // ── Timer countdown (not Daily) ────────────────────────────────
  useEffect(() => {
    if (stage !== 'playing' || hasAnswered || mode === 'daily') return
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [stage, hasAnswered, currentIdx, mode])

  // ── Detect timeout ─────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft !== 0 || stage !== 'playing' || hasAnswered || mode === 'daily') return
    const q = questions[currentIdx]
    if (!q) return
    setSelected('__timeout__')
    setHasAnswered(true)
    setQResults(prev => [...prev, { correct: false, category: q.category }])
  }, [timeLeft, stage, hasAnswered, mode, questions, currentIdx])

  // ── Explanation delay ──────────────────────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing') return
    const t = setTimeout(() => setShowExplanation(true), 400)
    return () => clearTimeout(t)
  }, [hasAnswered, stage])

  // ── Badge award stage: auto-advance to results after 2.5 s ────
  useEffect(() => {
    if (stage !== 'badge') return
    const t = setTimeout(() => setStage('results'), BADGE_DISPLAY)
    return () => clearTimeout(t)
  }, [stage])

  // ── Save best score + trigger confetti when results reached ────
  useEffect(() => {
    if (stage !== 'results') return
    const correct = qResults.filter(r => r.correct).length
    const total   = qResults.length
    const acc     = total > 0 ? correct / total : 0

    let key    = ''
    let newVal = 0
    if (mode === 'blitz' && selectedCategory) {
      key    = `gk_best_blitz_${selectedCategory}_${difficulty}`
      newVal = correct
    } else if (mode === 'arena') {
      key    = `gk_best_arena_${difficulty}`
      newVal = correct
    } else if (mode === 'suddendeath') {
      key    = 'gk_best_sudden'
      newVal = gameStreak
    }

    if (key) {
      const prev = parseInt(localStorage.getItem(key) || '0')
      if (newVal > prev) {
        localStorage.setItem(key, String(newVal))
        setBestScore(String(newVal))
        setIsNewBest(true)
      }
    }

    if (mode !== 'suddendeath' && acc >= 0.8) setShowConfetti(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // ── Auto-hide confetti ─────────────────────────────────────────
  useEffect(() => {
    if (!showConfetti) return
    const t = setTimeout(() => setShowConfetti(false), 4_000)
    return () => clearTimeout(t)
  }, [showConfetti])

  // ── Auto-advance ───────────────────────────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing') return
    const lastResult = qResults[qResults.length - 1]
    const wasWrong   = lastResult ? !lastResult.correct : false

    const t = setTimeout(() => {
      if (mode === 'suddendeath' && wasWrong) {
        setStage('results')
        return
      }

      const next = currentIdx + 1
      if (next >= questions.length) {

        if (mode === 'daily') {
          const today        = new Date().toISOString().split('T')[0]
          const todayKey     = `gk_daily_${today}`
          const correctCount = qResults.filter(r => r.correct).length
          localStorage.setItem(todayKey, JSON.stringify({
            score:      gameScore,
            completed:  true,
            categories: questions.map(q => q.category),
            correct:    correctCount,
          }))
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yKey      = `gk_daily_${yesterday.toISOString().split('T')[0]}`
          const yData     = localStorage.getItem(yKey)
          const current   = parseInt(localStorage.getItem('gk_streak') || '0')
          const newStreak = yData ? current + 1 : 1
          localStorage.setItem('gk_streak', String(newStreak))
          setStreak(newStreak)
          setDailyCorrect(correctCount)
          setDailyCompleted(true)
          setStage('results')
          return
        }

        if (mode === 'blitz' && selectedCategory) {
          const correctCount = qResults.filter(r => r.correct).length
          const accuracy     = correctCount / questions.length
          if (accuracy >= 0.8) {
            const stored: KnowledgeCategory[] = JSON.parse(
              localStorage.getItem('gk_badges') || '[]'
            )
            if (!stored.includes(selectedCategory)) {
              stored.push(selectedCategory)
              localStorage.setItem('gk_badges', JSON.stringify(stored))
              setBadges(stored)
              setNewBadgeEarned(true)
              setStage('badge')
              return
            }
          }
        }

        setStage('results')
      } else {
        setCurrentIdx(next)
        setSelected(null)
        setHasAnswered(false)
        setShowExplanation(false)
        setTimeLeft(TIME_PER_QUESTION)
      }
    }, ADVANCE_DELAY)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnswered, stage, currentIdx])

  // ── Actions ────────────────────────────────────────────────────

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await cardRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }

  function handleStart() {
    if (!canStart) return
    let qs: KnowledgeQuestion[] = []
    if (mode === 'blitz' && selectedCategory) {
      qs = getQuestions(selectedCategory, 20, difficulty)
    } else if (mode === 'arena') {
      qs = getArenaQuestions()
    } else if (mode === 'suddendeath') {
      qs = getQuestions('all', 140, 'all')
    } else if (mode === 'daily') {
      qs = getDailyQuestions()
    }
    setQuestions(qs)
    setCurrentIdx(0)
    setSelected(null)
    setHasAnswered(false)
    setGameScore(0)
    setGameStreak(0)
    setTimeLeft(TIME_PER_QUESTION)
    setQResults([])
    setShowExplanation(false)
    setNewBadgeEarned(false)
    setIsNewBest(false)
    setShowConfetti(false)
    setShowHowTo(false)
    setStage('playing')
  }

  function handleQuit() {
    setStage('setup')
    setQuestions([])
    setCurrentIdx(0)
    setSelected(null)
    setHasAnswered(false)
    setGameScore(0)
    setGameStreak(0)
    setTimeLeft(TIME_PER_QUESTION)
    setQResults([])
    setShowExplanation(false)
    setNewBadgeEarned(false)
    setIsNewBest(false)
    setShowConfetti(false)
  }

  function handleSelect(opt: string) {
    if (hasAnswered) return
    const q = questions[currentIdx]
    if (!q) return
    const correct = opt === q.correctAnswer
    setSelected(opt)
    setHasAnswered(true)
    if (correct) {
      setGameScore(prev => prev + POINTS_CORRECT)
      setGameStreak(prev => prev + 1)
    }
    setQResults(prev => [...prev, { correct, category: q.category }])
  }

  function handleShare() {
    const correct  = qResults.filter(r => r.correct).length
    const total    = qResults.length
    const acc      = total > 0 ? correct / total : 0
    const g        = getGrade(acc)
    const modeMax  = mode === 'blitz' ? questions.length * POINTS_CORRECT
                   : mode === 'arena' ? 14 * POINTS_CORRECT
                   : mode === 'daily' ? 7 * POINTS_CORRECT
                   : 0
    const modeName = MODES.find(m => m.id === mode)?.name ?? ''

    const canvas  = document.createElement('canvas')
    canvas.width  = 600
    canvas.height = 300
    const ctx     = canvas.getContext('2d')!

    ctx.fillStyle = '#18181b'
    ctx.fillRect(0, 0, 600, 300)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth   = 1
    ctx.strokeRect(0.5, 0.5, 599, 299)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#52525b'
    ctx.font      = 'bold 11px sans-serif'
    ctx.fillText('ANTBREAK GENERAL KNOWLEDGE ARENA', 300, 38)

    if (mode === 'suddendeath') {
      ctx.fillStyle = '#ffffff'
      ctx.font      = 'bold 68px Georgia, serif'
      ctx.fillText(String(gameStreak), 300, 148)
      ctx.fillStyle = '#3f3f46'
      ctx.font      = '15px sans-serif'
      ctx.fillText('correct in a row', 300, 173)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.font      = 'bold 80px Georgia, serif'
      ctx.fillText(String(gameScore), 300, 148)
      ctx.fillStyle = '#3f3f46'
      ctx.font      = '16px sans-serif'
      ctx.fillText(`/ ${modeMax}`, 300, 173)
    }

    ctx.fillStyle = '#e4e4e7'
    ctx.font      = 'bold 20px sans-serif'
    ctx.fillText(`${g.emoji} ${g.title}`, 300, 208)

    ctx.fillStyle = '#52525b'
    ctx.font      = '11px sans-serif'
    ctx.fillText(modeName, 300, 228)

    // 7 category dots
    const dotR     = 7
    const dotGap   = 22
    const startX   = 300 - (3 * dotGap)
    const dotY     = 258
    CATEGORIES.forEach((cat, i) => {
      const catRes     = qResults.filter(r => r.category === cat.id)
      const catCorrect = catRes.filter(r => r.correct).length
      ctx.beginPath()
      ctx.arc(startX + i * dotGap, dotY, dotR, 0, Math.PI * 2)
      if (catRes.length === 0)                  ctx.fillStyle = '#27272a'
      else if (catCorrect === catRes.length)    ctx.fillStyle = '#22c55e'
      else if (catCorrect > 0)                  ctx.fillStyle = '#f97316'
      else                                      ctx.fillStyle = '#ef4444'
      ctx.fill()
    })

    ctx.fillStyle = '#3f3f46'
    ctx.font      = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('antbreak.com', 588, 290)

    const link    = document.createElement('a')
    link.download = `antbreak-gk-${gameScore}.png`
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  // ── Derived ────────────────────────────────────────────────────

  const correctCount = qResults.filter(r => r.correct).length
  const accuracy     = qResults.length > 0 ? correctCount / qResults.length : 0
  const maxScore     = mode === 'blitz' ? questions.length * POINTS_CORRECT
                     : mode === 'arena' ? 14 * POINTS_CORRECT
                     : mode === 'daily' ? 7 * POINTS_CORRECT
                     : 0
  const grade        = getGrade(accuracy)

  const showCategorySelector = mode === 'blitz'
  const showDifficulty       = mode === 'blitz' || mode === 'arena'
  const canStart             =
    mode !== null &&
    !(mode === 'blitz' && selectedCategory === null) &&
    !(mode === 'daily' && dailyCompleted)

  const question     = questions[currentIdx] ?? null
  const catInfo      = question ? CATEGORIES.find(c => c.id === question.category) : null
  const progressPct  = questions.length ? (currentIdx / questions.length) * 100 : 0
  const lastResult   = qResults[qResults.length - 1]
  const suddenDeath0 = mode === 'suddendeath' && hasAnswered && !!lastResult && !lastResult.correct
  const showTimer    = mode !== 'daily' && stage === 'playing'

  const badgeCatInfo = selectedCategory
    ? CATEGORIES.find(c => c.id === selectedCategory)
    : null

  function optionCls(opt: string, correct: string): string {
    const base = 'rounded-xl py-3 px-4 text-sm font-medium transition-all duration-150 text-left w-full'
    if (!hasAnswered) {
      return `${base} bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 cursor-pointer`
    }
    if (opt === selected && opt === correct) {
      return `${base} bg-green-900/50 border-2 border-green-500 text-green-200 cursor-default`
    }
    if (opt === selected && opt !== correct) {
      return `${base} bg-rose-900/50 border-2 border-rose-500 text-rose-300 cursor-default`
    }
    if (opt === correct && selected !== correct) {
      return `${base} bg-green-900/30 border border-green-600 text-green-300 cursor-default`
    }
    return `${base} bg-zinc-800 border border-zinc-700 text-zinc-200 opacity-40 cursor-default`
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="relative h-full flex flex-col rounded-2xl knowledge-game-card bg-zinc-900 overflow-hidden"
      style={{
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.08), 0 0 40px rgba(255,255,255,0.03), 0 25px 50px rgba(0,0,0,0.7)',
      }}
    >

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
        <Trophy className="h-5 w-5 text-yellow-400 shrink-0" />
        <h1 className={`text-white font-bold flex-1 leading-none truncate ${isFullscreen ? 'text-2xl' : 'text-xl'}`}>
          {stage === 'playing' ? 'Arena' : 'General Knowledge Arena'}
        </h1>

        {showTimer && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-base shrink-0 border ${timerCls(timeLeft)}`}>
            {timeLeft}
          </div>
        )}

        {(stage === 'playing') && (
          <button
            type="button"
            onClick={handleQuit}
            className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
            aria-label="Quit"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Progress bar during playing, divider otherwise */}
      {stage === 'playing' && question ? (
        <div className="h-1 bg-zinc-800 shrink-0 relative">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-300 ${CAT_PROGRESS[question.category]}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : (
        <hr className="border-zinc-700/50 mx-5 shrink-0" />
      )}

      {/* ── Setup ───────────────────────────────────────────────── */}
      {stage === 'setup' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-center">

          <p className="text-white/40 text-xs uppercase tracking-[0.3em] text-center mb-4">
            🏆 General Knowledge Arena
          </p>

          <p className="text-zinc-500 text-xs uppercase tracking-widest text-center mb-3">
            Choose Mode
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {MODES.map(m => (
              <button
                key={`mode-${m.id}`}
                type="button"
                onClick={() => {
                  setMode(m.id)
                  if (m.id !== 'blitz') setSelectedCategory(null)
                }}
                className={[
                  'flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition-all duration-150',
                  mode === m.id
                    ? 'bg-zinc-700 border-2 border-white/30 shadow-lg'
                    : 'bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-500 hover:bg-zinc-800',
                ].join(' ')}
              >
                <span className="text-3xl leading-none">{m.icon}</span>
                <span className="text-white font-bold text-sm mt-1">{m.name}</span>
                <span className="text-zinc-500 text-xs leading-tight">{m.tagline}</span>
              </button>
            ))}
          </div>

          {showCategorySelector && (
            <div className="mb-3">
              <p className="text-zinc-500 text-xs uppercase tracking-widest text-center mb-2">
                Choose Category
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id
                  return (
                    <button
                      key={`cat-${cat.id}`}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={[
                        'rounded-full px-3 py-1.5 text-xs border transition-all duration-150',
                        isSelected
                          ? `border-2 ${CAT_PILL_SEL[cat.id]}`
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500',
                      ].join(' ')}
                    >
                      {cat.icon} {CAT_SHORT[cat.id]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {showDifficulty && (
            <div className="mb-3">
              <p className="text-zinc-500 text-xs uppercase tracking-widest text-center mb-2">
                Difficulty
              </p>
              <div className="flex justify-center gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={`diff-${d.id}`}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={[
                      'rounded-full px-4 py-1 text-xs border transition-all',
                      difficulty === d.id
                        ? d.active
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300',
                    ].join(' ')}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'blitz' && (
            <div className="mb-3 text-center">
              <p className="text-zinc-600 text-xs mb-2">Category Badges</p>
              <div className="flex justify-center gap-2">
                {CATEGORIES.map(cat => {
                  const earned = badges.includes(cat.id)
                  return (
                    <div
                      key={`badge-${cat.id}`}
                      title={earned ? `${cat.name} — Earned` : cat.name}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className={earned ? 'text-xl' : 'text-xl grayscale opacity-30'}>
                        {cat.icon}
                      </span>
                      {earned && (
                        <span className={`text-[9px] font-bold ${CAT_BADGE_SEL[cat.id]}`}>✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {streak > 0 && (
            <p className="text-yellow-400 text-xs text-center mt-1">🔥 {streak} day streak</p>
          )}

          {bestScore !== null && (
            <p className="text-zinc-600 text-xs text-center mt-1">
              Best: {bestScore}
              {mode === 'blitz' && ` / ${questions.length || 20}`}
              {mode === 'arena' && ' / 14'}
            </p>
          )}

          {mode === 'daily' && dailyCompleted ? (
            <div className="mt-5 text-center space-y-1">
              <p className="text-white/70 text-sm font-semibold">
                ✓ Daily Complete — {dailyCorrect}/7 correct
              </p>
              <p className="text-zinc-600 text-xs">Next quiz in {countdown}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className={[
                'mt-5 w-full py-3 rounded-xl font-bold text-sm transition-all',
                'border border-white/20 shadow-lg shadow-white/10',
                canStart
                  ? 'bg-white text-zinc-900 hover:bg-zinc-100 cursor-pointer'
                  : 'bg-white/20 text-white/30 cursor-not-allowed',
              ].join(' ')}
            >
              ▶ Enter the Arena
            </button>
          )}

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-zinc-700 text-xs underline hover:text-zinc-500 transition-colors"
            >
              {showHowTo ? 'Hide guide' : 'How to play'}
            </button>
            {showHowTo && (
              <div className="mt-2 text-left bg-white/[0.03] border border-zinc-700/50 rounded-xl p-4 space-y-3">
                {HOW_TO_GUIDE.map((section, i) => (
                  <div key={i}>
                    <span className="text-zinc-400 text-xs font-semibold">{section.label}: </span>
                    <span className="text-zinc-500 text-xs leading-relaxed">{section.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Playing ─────────────────────────────────────────────── */}
      {stage === 'playing' && question && (
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col">

          {/* Category indicator pill — keyed so it re-mounts (fade-in) on each question */}
          <span
            key={`cat-ind-${currentIdx}`}
            className={`geo-question-enter block w-fit mx-auto mt-2 rounded-full px-3 py-1 text-xs border shrink-0 ${CAT_INDICATOR[question.category]}`}
          >
            {catInfo?.icon} {catInfo?.name}
          </span>

          {/* Score row */}
          {mode === 'suddendeath' ? (
            <div className="flex items-center justify-between mt-2 px-1 shrink-0">
              <p className="text-white font-bold text-sm">Score: {gameScore}</p>
              <p className="text-yellow-400 text-sm">🔥 Streak: {gameStreak}</p>
            </div>
          ) : (
            <p className="text-zinc-600 text-xs text-right mt-1 px-1 shrink-0 font-mono">
              Q{currentIdx + 1}/{questions.length} · {gameScore} pts
            </p>
          )}

          {/* Question card */}
          <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-2xl p-6 mt-3 flex flex-col">

            {mode === 'daily' ? (
              <p className="text-zinc-500 text-xs font-mono mb-2">
                📅 Daily Grand Quiz — Question {currentIdx + 1} of 7
              </p>
            ) : (
              <p className="text-zinc-600 text-xs font-mono mb-2">Q{currentIdx + 1}</p>
            )}

            <p
              className="text-white font-semibold text-lg leading-relaxed mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {question.question}
            </p>

            {/* 2×2 options grid */}
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt, i) => (
                <button
                  key={`opt-${currentIdx}-${i}-${opt}`}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelect(opt)}
                  className={optionCls(opt, question.correctAnswer)}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Sudden Death game over */}
            {suddenDeath0 && (
              <div className="mt-4 text-center">
                <p className="text-rose-400 text-xl font-bold">💀 Game Over!</p>
                <p className="text-zinc-400 text-sm mt-1">Your streak ended at {gameStreak}</p>
              </div>
            )}

            {/* Standard feedback */}
            {hasAnswered && !suddenDeath0 && (
              <p className={`font-bold text-sm mt-3 ${
                selected === question.correctAnswer ? 'text-green-400' : 'text-rose-400'
              }`}>
                {selected === '__timeout__'
                  ? '⏱ Time\'s up!'
                  : selected === question.correctAnswer
                    ? `✓ Correct! +${POINTS_CORRECT} pts`
                    : '✗ Incorrect'}
              </p>
            )}

            {/* Explanation */}
            {showExplanation && (
              <div className="bg-black/20 rounded-xl p-3 mt-2">
                <p
                  className="text-zinc-400 text-xs leading-relaxed"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  💡 {question.explanation}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Badge Award ─────────────────────────────────────────── */}
      {stage === 'badge' && badgeCatInfo && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-6">
          <span className="text-6xl animate-bounce">{badgeCatInfo.icon}</span>
          <p className="text-white text-2xl font-bold text-center">🏆 Badge Earned!</p>
          <p className={`text-xl text-center font-semibold ${CAT_TEXT[badgeCatInfo.id]}`}>
            {badgeCatInfo.icon} {badgeCatInfo.name}
          </p>
          <p className="text-zinc-500 text-sm text-center">
            Score 80%+ to earn more badges
          </p>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {stage === 'results' && (
        <div className="flex-1 overflow-y-auto scrollbar-hidden px-5 py-4 flex flex-col gap-4">

          {/* Decoration */}
          <p className="text-zinc-700 text-xs tracking-[0.5em] text-center select-none shrink-0">
            ▬▬▬ RESULTS ▬▬▬
          </p>

          {/* Score hero */}
          {mode === 'suddendeath' ? (
            <div className="text-center shrink-0">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] mb-2">💀 Game Over</p>
              <p className="text-white text-5xl font-bold leading-none">
                Streak: {gameStreak} correct
              </p>
              {isNewBest ? (
                <p className="text-yellow-400 font-bold text-sm mt-2">🏆 New Best!</p>
              ) : bestScore !== null ? (
                <p className="text-zinc-600 text-sm mt-2">Best streak: {bestScore}</p>
              ) : null}
            </div>
          ) : (
            <div className="text-center shrink-0">
              {mode === 'daily' && (
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-2">
                  📅 Daily Grand Quiz Complete
                </p>
              )}
              <div className="flex items-end justify-center gap-1.5">
                <p className="text-white text-7xl font-bold font-mono leading-none tabular-nums">
                  {gameScore}
                </p>
                <p className="text-zinc-600 text-xl leading-none mb-2">/ {maxScore}</p>
              </div>
              <p className="text-white text-2xl font-bold mt-2">
                {grade.emoji} {grade.title}
              </p>
              {isNewBest && (
                <p className="text-yellow-400 font-bold text-sm mt-1">🏆 New Best!</p>
              )}
            </div>
          )}

          {/* Daily streak + countdown */}
          {mode === 'daily' && (
            <div className="text-center shrink-0 space-y-0.5 -mt-1">
              {streak > 0 && (
                <p className="text-yellow-400 font-semibold text-sm">🔥 {streak} day streak</p>
              )}
              <p className="text-zinc-600 text-xs">Next quiz in {countdown}</p>
            </div>
          )}

          {/* Category breakdown */}
          <div className="bg-zinc-800/50 rounded-2xl p-4 shrink-0">
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest text-center mb-3">
              Category Breakdown
            </p>
            <div className="space-y-2.5">
              {CATEGORIES.map(cat => {
                const catResults = qResults.filter(r => r.category === cat.id)
                if (catResults.length === 0) return null
                if (mode === 'blitz' && cat.id !== selectedCategory) return null
                const catCorrect = catResults.filter(r => r.correct).length
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span className="text-sm w-5 text-center shrink-0">{cat.icon}</span>
                    <span className={`text-xs w-[68px] shrink-0 ${CAT_TEXT[cat.id]}`}>
                      {CAT_SHORT[cat.id]}
                    </span>
                    <div className="flex-1 flex gap-1 flex-wrap items-center min-w-0">
                      {catResults.map((r, i) => (
                        <span
                          key={i}
                          className={`block w-2.5 h-2.5 rounded-full shrink-0 ${
                            r.correct ? 'bg-green-500' : 'bg-rose-500'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-zinc-500 text-xs font-mono w-7 text-right shrink-0">
                      {catCorrect}/{catResults.length}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Badge status */}
          <div className="shrink-0">
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest text-center mb-2">
              Your Badges
            </p>
            <div className="flex justify-center gap-3">
              {CATEGORIES.map(cat => {
                const earned     = badges.includes(cat.id)
                const justEarned = newBadgeEarned && selectedCategory === cat.id
                return (
                  <div key={`res-badge-${cat.id}`} className="flex flex-col items-center gap-0.5">
                    <span className={[
                      'text-xl',
                      !earned ? 'grayscale opacity-30' : '',
                      justEarned ? 'animate-bounce' : '',
                    ].filter(Boolean).join(' ')}>
                      {cat.icon}
                    </span>
                    {earned && (
                      <span className={`text-[9px] font-bold ${CAT_BADGE_SEL[cat.id]}`}>✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-zinc-500 text-xs border border-zinc-700/30 bg-white/[0.02] hover:bg-zinc-800/50 transition-all shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Share result
          </button>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0 pb-1">
            {mode !== 'daily' ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={!canStart}
                className="flex-1 py-2 px-6 rounded-xl font-bold text-sm bg-white text-zinc-900 hover:bg-zinc-100 transition-all border border-white/20 shadow-lg shadow-white/10 cursor-pointer"
              >
                ▶ Play Again
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 py-2 px-6 rounded-xl font-bold text-sm bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
              >
                Come Back Tomorrow
              </button>
            )}
            <button
              type="button"
              onClick={handleQuit}
              className="flex-1 py-2 px-6 rounded-xl font-bold text-sm bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all cursor-pointer"
            >
              Change Mode
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
