'use client'

import { useState, useEffect, useRef } from 'react'
import { Grid2x2, Maximize2, Minimize2, X } from 'lucide-react'
import type {
  AnyPuzzle, PuzzleMode, PuzzleDifficulty, PuzzleResult,
  SequencePuzzle, LogicPuzzle, OddOneOutPuzzle, RebusPuzzle, SpatialPuzzle,
} from '@/types/puzzle'
import { getPuzzles, getDailyPuzzles } from '@/data/puzzleData'

// ─── Constants ────────────────────────────────────────────────────────────────

type Stage = 'setup' | 'playing' | 'results'

const CLASSIC_COUNT    = 15
const SPEEDRUN_COUNT   = 10
const POINTS_CORRECT   = 5
const POINTS_WITH_HINT = 3
const SPEED_SECONDS    = 20
const ADVANCE_DELAY    = 2000

const MODES: { id: PuzzleMode; icon: string; name: string; tagline: string }[] = [
  { id: 'classic',  icon: '🧩', name: 'Classic',         tagline: '15 puzzles. No pressure.'        },
  { id: 'speedrun', icon: '⚡', name: 'Speed Run',       tagline: '10 puzzles. 20 seconds each.'    },
  { id: 'daily',    icon: '📅', name: 'Daily Challenge', tagline: '5 puzzles. One per type. Daily.' },
]

const DIFFICULTIES: { id: PuzzleDifficulty; label: string; active: string }[] = [
  { id: 'easy',   label: 'Easy',   active: 'bg-emerald-900/40 border-emerald-500 text-emerald-300' },
  { id: 'medium', label: 'Medium', active: 'bg-orange-900/40 border-orange-500 text-orange-300'   },
  { id: 'hard',   label: 'Hard',   active: 'bg-rose-900/40 border-rose-500 text-rose-300'          },
]

const PUZZLE_TYPE_BADGES = [
  { icon: '🔢', label: 'Seq'     },
  { icon: '🧠', label: 'Logic'   },
  { icon: '🎯', label: 'Odd'     },
  { icon: '🔤', label: 'Rebus'   },
  { icon: '🔷', label: 'Spatial' },
]

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  sequence:  { icon: '🔢', label: 'Number Sequence' },
  logic:     { icon: '🧠', label: 'Logic Grid'      },
  oddoneout: { icon: '🎯', label: 'Odd One Out'     },
  rebus:     { icon: '🔤', label: 'Rebus'           },
  spatial:   { icon: '🔷', label: 'Spatial'         },
}

const TYPE_HINTS: Record<string, string> = {
  sequence:  'Look at the differences or ratios between consecutive terms — does the gap grow, shrink, or stay fixed?',
  logic:     'Work through each clue one by one and cross off options that cannot be true.',
  oddoneout: 'Try different categories — function, origin, spelling, shape, or hidden property.',
  rebus:     'Say each image\'s name out loud and listen for the sounds, not the spelling.',
  spatial:   'Close your eyes and visualise rotating or transforming the shape step by step.',
}

const HOW_TO_GUIDE = [
  { label: 'Classic',        body: 'Work through 15 puzzles with no time limit. Five puzzle types rotate so every question feels fresh.' },
  { label: 'Speed Run',      body: '10 puzzles, 20 seconds each. Answer quickly — time out and the question auto-advances.' },
  { label: 'Daily Challenge',body: 'Five puzzles, one of each type, every day. Complete today\'s set to keep your streak alive.' },
  { label: 'Hints',          body: 'Each puzzle has a hint. Use it if stuck — it reduces your score from 5 to 3 points.' },
  { label: 'Types',          body: 'Sequence: find the pattern. Logic: deduce from clues. Odd One Out: spot the misfit. Rebus: decode the pictures. Spatial: visualise the shape.' },
]

const RESULTS_GUIDE = [
  { icon: '🔢', label: 'Sequences',  body: 'Find the pattern in numbers or letters to identify what comes next.' },
  { icon: '🧠', label: 'Logic',      body: 'Use the given clues to deduce the correct answer logically.' },
  { icon: '🎯', label: 'Odd One Out',body: 'Find the item that does not share the same connection as the others.' },
  { icon: '🔤', label: 'Rebus',      body: 'Decode the combination of images and symbols as words or phrases.' },
  { icon: '🔷', label: 'Spatial',    body: 'Visualise shapes, rotations and patterns in your mind to answer.' },
]

// Pre-computed confetti (orange-themed, deterministic — no Math.random in render)
const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => ({
  left:  (i * 37 + 11) % 100,
  delay: (i * 0.13) % 1.8,
  dur:   1.6 + (i * 0.07) % 1.4,
  color: ['#fb923c', '#fbbf24', '#f97316', '#f59e0b', '#d97706', '#ea580c'][i % 6],
  w:     4 + (i % 3) * 2,
  h:     6 + (i % 4) * 2,
}))

// ─── Module-level helpers ──────────────────────────────────────────────────────

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

function modeMax(m: PuzzleMode): number {
  return m === 'classic' ? CLASSIC_COUNT : m === 'speedrun' ? SPEEDRUN_COUNT : 5
}

function timerCls(t: number): string {
  if (t > 12) return 'bg-orange-900/40 border-orange-700 text-orange-300'
  if (t > 6)  return 'bg-yellow-900/40 border-yellow-700 text-yellow-300'
  return 'bg-rose-900/40 border-rose-700 text-rose-400 animate-pulse'
}

function getGrade(pct: number): { emoji: string; title: string } {
  if (pct >= 100) return { emoji: '🧠', title: 'Puzzle Master'   }
  if (pct >= 75)  return { emoji: '💡', title: 'Sharp Mind'      }
  if (pct >= 50)  return { emoji: '🔍', title: 'Logical Thinker' }
  if (pct >= 25)  return { emoji: '🧩', title: 'Puzzle Novice'   }
  return               { emoji: '🌱', title: 'Keep Practising' }
}

function generateSequenceOptions(answer: string): string[] {
  const n = Number(answer)
  if (!isNaN(n) && Number.isInteger(n)) {
    const abs = Math.abs(n)
    const d = abs <= 10 ? 1 : abs <= 50 ? 3 : Math.ceil(abs * 0.08)
    const candidates = [n - d * 2, n - d, n + d, n + d * 2].filter(v => v > 0 && v !== n)
    const wrong = [...new Set(candidates)].slice(0, 3).map(String)
    const all = [...wrong, answer]
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    return all.slice(0, 4)
  }
  const code = answer.charCodeAt(0)
  const opts: string[] = []
  for (const o of [-3, -2, -1, 1, 2, 3]) {
    const c = code + o
    if (c >= 65 && c <= 90) opts.push(String.fromCharCode(c))
    if (opts.length === 3) break
  }
  opts.push(answer)
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts.slice(0, 4)
}

function getQuestionText(p: AnyPuzzle): string {
  if (p.type === 'sequence')  return `Sequence: ${(p as SequencePuzzle).sequence.join(' → ')}`
  if (p.type === 'logic')     return (p as LogicPuzzle).question
  if (p.type === 'oddoneout') return `Odd one out: ${(p as OddOneOutPuzzle).items.join(', ')}`
  if (p.type === 'rebus')     return `Rebus: ${(p as RebusPuzzle).parts.map(pt => pt.content).join(' ')}`
  if (p.type === 'spatial')   return (p as SpatialPuzzle).question
  return ''
}

// ─── Spatial visual aid ────────────────────────────────────────────────────────

function SpatialVisual({ shapeDescription }: { shapeDescription: string }) {
  const d = shapeDescription.toLowerCase()
  if (d.includes('4×4') || d.includes('4x4')) {
    return (
      <div className="flex justify-center my-3">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-6 h-6 border border-orange-600/40 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    )
  }
  if (d.includes('3×3') || d.includes('3x3')) {
    return (
      <div className="flex justify-center my-3">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-8 h-8 border border-orange-600/40 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    )
  }
  if (d.includes('2×2') || d.includes('2x2')) {
    return (
      <div className="flex justify-center my-3">
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-10 h-10 border border-orange-600/40 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    )
  }
  if (d.includes('clock')) {
    return (
      <div className="flex justify-center my-3">
        <div className="relative w-16 h-16 rounded-full border-2 border-orange-500/50 bg-white/5">
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-orange-600/60 leading-none select-none">12</span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-orange-600/60 leading-none select-none">3</span>
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-6 h-0.5 bg-orange-400 origin-left" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full" />
        </div>
      </div>
    )
  }
  if (d.includes('l-shape') || d.includes('tromino')) {
    return (
      <div className="flex justify-center my-3">
        <div className="relative w-[76px] h-[76px]">
          <div className="absolute top-0 left-0 w-8 h-8 border border-orange-500/50 bg-orange-950/40 rounded" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border border-orange-500/50 bg-orange-950/40 rounded" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border border-orange-500/50 bg-orange-950/40 rounded" />
        </div>
      </div>
    )
  }
  return null
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function PuzzleGame() {

  // ── Setup state ────────────────────────────────────────────────
  const [stage,          setStage]          = useState<Stage>('setup')
  const [mode,           setMode]           = useState<PuzzleMode | null>(null)
  const [difficulty,     setDifficulty]     = useState<PuzzleDifficulty>('medium')
  const [streak,         setStreak]         = useState(0)
  const [dailyCompleted, setDailyCompleted] = useState(false)
  const [countdown,      setCountdown]      = useState('')
  const [bestScore,      setBestScore]      = useState<string | null>(null)
  const [showHowTo,      setShowHowTo]      = useState(false)
  const [isFullscreen,   setIsFullscreen]   = useState(false)
  const [dailyScore,     setDailyScore]     = useState<number | null>(null)

  // ── Game state ─────────────────────────────────────────────────
  const [puzzles,         setPuzzles]         = useState<AnyPuzzle[]>([])
  const [puzzleOptions,   setPuzzleOptions]   = useState<Record<string, string[]>>({})
  const [currentIdx,      setCurrentIdx]      = useState(0)
  const [selected,        setSelected]        = useState<string | null>(null)
  const [hasAnswered,     setHasAnswered]     = useState(false)
  const [timedOut,        setTimedOut]        = useState(false)
  const [score,           setScore]           = useState(0)
  const [hintUsed,        setHintUsed]        = useState(false)
  const [showHint,        setShowHint]        = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft,        setTimeLeft]        = useState(SPEED_SECONDS)
  const [results,         setResults]         = useState<PuzzleResult[]>([])

  // ── Results state ──────────────────────────────────────────────
  const [isNewPB,      setIsNewPB]      = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // ── Refs ───────────────────────────────────────────────────────
  const cardRef       = useRef<HTMLDivElement>(null)
  const dailySavedRef = useRef(false)
  const pbSavedRef    = useRef(false)

  // ── Init: streak, daily completion, countdown ──────────────────
  useEffect(() => {
    setStreak(Number(localStorage.getItem('puzzle_streak') ?? '0'))
    const today    = new Date().toISOString().split('T')[0]
    const todayKey = `puzzle_daily_${today}`
    const saved    = localStorage.getItem(todayKey)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setDailyCompleted(true)
        setDailyScore(data.score ?? null)
      } catch {
        setDailyCompleted(true)
      }
    }
    setCountdown(timeToMidnight())
    const t = setInterval(() => setCountdown(timeToMidnight()), 1_000)
    return () => clearInterval(t)
  }, [])

  // ── Best score updates with mode / difficulty ──────────────────
  useEffect(() => {
    if (!mode) { setBestScore(null); return }
    const key = mode === 'daily' ? 'puzzle_best_daily' : `puzzle_best_${mode}_${difficulty}`
    setBestScore(localStorage.getItem(key))
  }, [mode, difficulty])

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

  // ── Speed timer ────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'speedrun' || stage !== 'playing' || hasAnswered) return
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [mode, stage, hasAnswered, currentIdx])

  // ── Detect timeout ─────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft !== 0 || mode !== 'speedrun' || stage !== 'playing' || hasAnswered) return
    const puzzle = puzzles[currentIdx]
    if (!puzzle) return
    setTimedOut(true)
    setHasAnswered(true)
    setResults(prev => [...prev, {
      puzzleId: puzzle.id, correct: false,
      timeSeconds: SPEED_SECONDS, hintUsed, pointsEarned: 0,
    }])
  }, [timeLeft, mode, stage, hasAnswered, puzzles, currentIdx, hintUsed])

  // ── Explanation delay (400ms) ──────────────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing') return
    const t = setTimeout(() => setShowExplanation(true), 400)
    return () => clearTimeout(t)
  }, [hasAnswered, stage])

  // ── Auto-advance ───────────────────────────────────────────────
  useEffect(() => {
    if (!hasAnswered || stage !== 'playing') return
    const t = setTimeout(() => {
      const next = currentIdx + 1
      if (next >= puzzles.length) {
        setStage('results')
      } else {
        setCurrentIdx(next)
        setSelected(null)
        setHasAnswered(false)
        setTimedOut(false)
        setShowHint(false)
        setHintUsed(false)
        setShowExplanation(false)
        setTimeLeft(SPEED_SECONDS)
      }
    }, ADVANCE_DELAY)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnswered, stage, currentIdx])

  // ── Save daily completion (fires once on daily results) ────────
  useEffect(() => {
    if (stage === 'setup') { dailySavedRef.current = false; return }
    if (stage !== 'results' || mode !== 'daily' || dailySavedRef.current) return
    dailySavedRef.current = true

    const today    = new Date().toISOString().split('T')[0]
    const todayKey = `puzzle_daily_${today}`
    localStorage.setItem(todayKey, JSON.stringify({
      score, completed: true, date: today,
      puzzleTypes: puzzles.map(p => p.type),
    }))

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yKey      = `puzzle_daily_${yesterday.toISOString().split('T')[0]}`
    const ySaved    = localStorage.getItem(yKey)
    const current   = parseInt(localStorage.getItem('puzzle_streak') ?? '0')
    const newStreak = ySaved ? current + 1 : 1
    localStorage.setItem('puzzle_streak', String(newStreak))

    setDailyCompleted(true)
    setDailyScore(score)
    setStreak(newStreak)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, mode])

  // ── Save PB + trigger confetti (Classic / Speed Run) ──────────
  useEffect(() => {
    if (stage === 'setup') { pbSavedRef.current = false; return }
    if (stage !== 'results' || mode === 'daily' || !mode || pbSavedRef.current) return
    pbSavedRef.current = true

    const correctCount = results.filter(r => r.correct).length
    const key          = `puzzle_best_${mode}_${difficulty}`
    const prevBest     = parseInt(localStorage.getItem(key) ?? '0')
    if (correctCount > prevBest) {
      localStorage.setItem(key, String(correctCount))
      setIsNewPB(true)
      setBestScore(String(correctCount))
    }

    const maxScore = puzzles.length * POINTS_CORRECT
    const pct      = maxScore > 0 ? (score / maxScore) * 100 : 0
    if (pct >= 75) setShowConfetti(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, mode])

  // ── Auto-hide confetti after 4 s ───────────────────────────────
  useEffect(() => {
    if (!showConfetti) return
    const t = setTimeout(() => setShowConfetti(false), 4_000)
    return () => clearTimeout(t)
  }, [showConfetti])

  // ── Actions ────────────────────────────────────────────────────

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await cardRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }

  function handleStart() {
    if (!mode || (mode === 'daily' && dailyCompleted)) return
    const qs = mode === 'daily'
      ? getDailyPuzzles()
      : getPuzzles(mode === 'classic' ? CLASSIC_COUNT : SPEEDRUN_COUNT, difficulty)

    const opts: Record<string, string[]> = {}
    for (const q of qs) {
      if (q.type === 'sequence') opts[q.id] = generateSequenceOptions(q.answer)
    }

    setPuzzleOptions(opts)
    setPuzzles(qs)
    setCurrentIdx(0)
    setSelected(null)
    setHasAnswered(false)
    setTimedOut(false)
    setScore(0)
    setHintUsed(false)
    setShowHint(false)
    setShowExplanation(false)
    setTimeLeft(SPEED_SECONDS)
    setResults([])
    setIsNewPB(false)
    setShowConfetti(false)
    setShowHowTo(false)
    pbSavedRef.current = false
    setStage('playing')
  }

  function handleQuit() {
    setStage('setup')
    setPuzzles([])
    setPuzzleOptions({})
    setCurrentIdx(0)
    setSelected(null)
    setHasAnswered(false)
    setTimedOut(false)
    setScore(0)
    setHintUsed(false)
    setShowHint(false)
    setShowExplanation(false)
    setTimeLeft(SPEED_SECONDS)
    setResults([])
    setIsNewPB(false)
    setShowConfetti(false)
  }

  function handleSelect(opt: string) {
    if (hasAnswered) return
    const puzzle = puzzles[currentIdx]
    if (!puzzle) return
    const correct = opt === puzzle.answer
    const pts     = correct ? (hintUsed ? POINTS_WITH_HINT : POINTS_CORRECT) : 0
    setSelected(opt)
    setHasAnswered(true)
    setScore(prev => prev + pts)
    setResults(prev => [...prev, {
      puzzleId: puzzle.id, correct,
      timeSeconds: mode === 'speedrun' ? SPEED_SECONDS - timeLeft : 0,
      hintUsed, pointsEarned: pts,
    }])
  }

  function handleShowHint() {
    if (hasAnswered || hintUsed) return
    setHintUsed(true)
    setShowHint(true)
  }

  function handleShare() {
    const canvas  = document.createElement('canvas')
    canvas.width  = 600
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const maxScore = puzzles.length * POINTS_CORRECT
    const pct      = maxScore > 0 ? (score / maxScore) * 100 : 0
    const grade    = getGrade(pct)

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 600, 300)

    // Orange accent stripe
    ctx.fillStyle = '#f97316'
    ctx.fillRect(0, 0, 600, 4)

    // Title
    ctx.fillStyle = '#fb923c'
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ANTBREAK  PUZZLE TEST', 300, 40)

    // Grade emoji
    ctx.font = '52px system-ui, sans-serif'
    ctx.fillText(grade.emoji, 300, 110)

    // Grade title
    ctx.fillStyle = '#fdba74'
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillText(grade.title, 300, 148)

    // Score
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui, monospace'
    ctx.fillText(String(score), 300, 228)

    // Max
    ctx.fillStyle = '#7c2d12'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillText(`/ ${maxScore} pts`, 300, 258)

    // Watermark
    ctx.fillStyle = '#431407'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('antbreak.com', 300, 291)

    const link   = document.createElement('a')
    link.download = `antbreak-puzzle-${score}.png`
    link.href    = canvas.toDataURL('image/png')
    link.click()
  }

  // ── Derived ────────────────────────────────────────────────────

  const showDifficulty = mode === 'classic' || mode === 'speedrun'
  const canStart       = mode !== null && !(mode === 'daily' && dailyCompleted)
  const activeMode     = mode ? MODES.find(m => m.id === mode) : null
  const puzzle         = puzzles[currentIdx] ?? null

  function getOptions(p: AnyPuzzle): string[] {
    if (p.type === 'sequence')  return puzzleOptions[p.id] ?? []
    if (p.type === 'oddoneout') return p.items
    return (p as LogicPuzzle | RebusPuzzle | SpatialPuzzle).options
  }

  function optionCls(opt: string, correct: string): string {
    const base = 'rounded-xl py-3 px-4 text-sm font-medium transition-all duration-150 text-left w-full'
    if (!hasAnswered) {
      return `${base} bg-neutral-800/80 border border-neutral-600/50 text-orange-100 hover:bg-orange-950/40 hover:border-orange-600/50 cursor-pointer`
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
    return `${base} bg-neutral-800/80 border border-neutral-600/50 text-orange-100 opacity-40 cursor-default`
  }

  function oddItemCls(item: string, correct: string): string {
    const base = 'rounded-xl px-4 py-3 text-base font-semibold transition-all duration-150'
    if (!hasAnswered) {
      return `${base} bg-neutral-800 border border-neutral-600 text-orange-100 hover:border-orange-500/60 cursor-pointer`
    }
    if (item === selected && item === correct) {
      return `${base} bg-green-900/50 border-2 border-green-500 text-green-200 cursor-default`
    }
    if (item === selected && item !== correct) {
      return `${base} bg-rose-900/50 border-2 border-rose-500 text-rose-300 cursor-default`
    }
    if (item === correct && selected !== correct) {
      return `${base} bg-green-900/30 border border-green-600 text-green-300 cursor-default`
    }
    return `${base} bg-neutral-800 border border-neutral-600 text-orange-100 opacity-40 cursor-default`
  }

  // Results-screen derived values
  const maxScore    = puzzles.length * POINTS_CORRECT
  const pct         = maxScore > 0 ? (score / maxScore) * 100 : 0
  const grade       = getGrade(pct)
  const lastResult  = results[results.length - 1]
  const earnedPts   = lastResult?.pointsEarned ?? 0
  const progressWidth = puzzles.length ? (currentIdx / puzzles.length) * 100 : 0

  const typeOrder = ['sequence', 'logic', 'oddoneout', 'rebus', 'spatial']
  const typeBreakdown = typeOrder.map(type => ({
    type,
    correct: results.filter((r, i) => puzzles[i]?.type === type && r?.correct).length,
    total:   puzzles.filter(p => p.type === type).length,
  })).filter(b => b.total > 0)

  const firstWrongIdx    = results.findIndex(r => !r?.correct)
  const firstWrongPuzzle = firstWrongIdx >= 0 ? puzzles[firstWrongIdx] : null

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="relative h-full flex flex-col rounded-2xl puzzle-game-card bg-neutral-950 overflow-hidden"
      style={{
        boxShadow:
          '0 0 0 1px rgba(249,115,22,0.3), 0 0 30px rgba(249,115,22,0.07), 0 25px 50px rgba(0,0,0,0.6)',
      }}
    >

      {/* ── Confetti overlay ────────────────────────────────────── */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
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
        <Grid2x2 className="h-6 w-6 text-orange-400 shrink-0" />
        <h1 className={`text-orange-100 font-bold flex-1 leading-none ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
          Puzzle Test
        </h1>

        {mode === 'daily' && stage === 'playing' && (
          <span className="bg-amber-900/30 text-amber-400 text-xs rounded-full px-3 py-1 shrink-0">
            Daily Challenge
          </span>
        )}

        {mode === 'speedrun' && stage === 'playing' && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-base shrink-0 border ${timerCls(timeLeft)}`}>
            {timeLeft}
          </div>
        )}

        {stage === 'playing' && (
          <button
            type="button"
            onClick={handleQuit}
            className="text-orange-900/60 hover:text-rose-400 transition-colors p-1"
            aria-label="Quit"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-orange-900/60 hover:text-orange-400 transition-colors p-1"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Divider / progress bar */}
      {stage === 'playing' ? (
        <div className="h-1 bg-orange-900/20 shrink-0 relative">
          <div
            className="absolute inset-y-0 left-0 bg-orange-500 transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      ) : (
        <hr className="border-orange-900/30 mx-5 shrink-0" />
      )}

      {/* ── Setup ───────────────────────────────────────────────── */}
      {stage === 'setup' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center">

          <p className="text-orange-500/60 text-xs uppercase tracking-widest text-center mb-4">
            🧩 Test your logical thinking
          </p>

          <p className="text-orange-500/60 text-xs uppercase tracking-widest text-center mb-3">
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
                    ? 'bg-orange-950/50 border-2 border-orange-400 shadow-lg shadow-orange-500/15'
                    : 'bg-white/[0.03] border border-orange-900/20 hover:border-orange-500/40 hover:bg-orange-950/20',
                ].join(' ')}
              >
                <span className="text-3xl shrink-0 leading-none">{m.icon}</span>
                <span className="min-w-0">
                  <span className="block text-orange-100 font-bold text-sm">{m.name}</span>
                  <span className="block text-orange-700/60 text-xs mt-0.5">{m.tagline}</span>
                </span>
              </button>
            ))}
          </div>

          {showDifficulty && (
            <div className="mb-3">
              <p className="text-orange-500/60 text-xs uppercase tracking-widest text-center mb-2">
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
                        : 'bg-white/5 border-orange-900/20 text-orange-700/50 hover:border-orange-700/50 hover:text-orange-500/80',
                    ].join(' ')}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 text-center">
            <p className="text-orange-800/50 text-xs mb-1.5">Includes:</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {PUZZLE_TYPE_BADGES.map(t => (
                <span key={t.label} className="text-orange-800/60 text-xs bg-white/[0.03] rounded-full px-2 py-0.5">
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>

          {streak > 0 && (
            <p className="text-orange-400 text-xs text-center mt-2">🔥 {streak} day streak</p>
          )}

          {bestScore && activeMode && (
            <p className="text-orange-800/60 text-xs text-center mt-1">
              Best: {bestScore}/{modeMax(activeMode.id)} on {activeMode.name}
            </p>
          )}

          {mode === 'daily' && dailyCompleted ? (
            <div className="mt-5 text-center space-y-1">
              <p className="text-orange-400 text-sm font-semibold">✓ Today&apos;s puzzles solved</p>
              {dailyScore !== null && (
                <p className="text-orange-300/70 text-xs">Score: {dailyScore} / 25</p>
              )}
              <p className="text-orange-800/50 text-xs">Next challenge in {countdown}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className={[
                'mt-5 w-full py-3 rounded-xl font-bold text-sm text-white transition-all',
                'border border-orange-500/20 shadow-lg shadow-orange-600/25',
                'bg-gradient-to-r from-orange-600 to-amber-600',
                canStart
                  ? 'hover:from-orange-500 hover:to-amber-500 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed',
              ].join(' ')}
            >
              🧩 Start
            </button>
          )}

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-orange-800/60 text-xs underline hover:text-orange-600/80 transition-colors"
            >
              {showHowTo ? 'Hide guide' : 'How to play'}
            </button>
            {showHowTo && (
              <div
                className="mt-2 text-left bg-black/20 border border-orange-900/30 rounded-xl p-4 space-y-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {HOW_TO_GUIDE.map((section, i) => (
                  <div key={i}>
                    <span className="text-orange-400/80 text-xs font-semibold not-italic">{section.label}: </span>
                    <span className="text-orange-400/70 text-xs leading-relaxed">{section.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Playing ─────────────────────────────────────────────── */}
      {stage === 'playing' && puzzle && (
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col">

          <p className="text-orange-700/60 text-xs text-center mt-1 shrink-0">
            Puzzle {currentIdx + 1} of {puzzles.length}
          </p>

          <span className="block w-fit mx-auto mt-2 bg-orange-950/40 border border-orange-800/30 rounded-full px-3 py-0.5 text-xs text-orange-400/80 shrink-0">
            {TYPE_LABELS[puzzle.type]?.icon} {TYPE_LABELS[puzzle.type]?.label}
          </span>

          <div className="bg-white/[0.03] border border-orange-900/20 rounded-2xl p-5 mt-3 flex flex-col">

            {puzzle.type === 'sequence' && (() => {
              const p = puzzle as SequencePuzzle
              return (
                <>
                  <div className="flex flex-wrap justify-center gap-2 mb-1">
                    {p.sequence.map((val, i) => (
                      <div
                        key={`puzzle-${currentIdx}-seq-${i}`}
                        className={
                          i === p.missingIndex
                            ? 'bg-orange-950/60 border-2 border-orange-500 rounded-xl px-4 py-3 text-xl font-mono text-orange-400 text-center min-w-[60px]'
                            : 'bg-neutral-800 border border-neutral-600 rounded-xl px-4 py-3 text-xl font-mono font-bold text-orange-100 min-w-[60px] text-center'
                        }
                      >
                        {i === p.missingIndex ? '?' : String(val)}
                      </div>
                    ))}
                  </div>
                  <p className="text-orange-600/50 text-xs text-center mb-1 mt-1">What comes next?</p>
                </>
              )
            })()}

            {puzzle.type === 'logic' && (() => {
              const p = puzzle as LogicPuzzle
              return (
                <>
                  <p className="text-orange-100 text-sm leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    {p.question}
                  </p>
                  {p.clues.length > 0 && (
                    <div className="bg-black/20 rounded-xl p-3 mb-2 space-y-1">
                      {p.clues.map((clue, i) => (
                        <p key={`puzzle-${currentIdx}-clue-${i}`} className="text-orange-400/70 text-xs">• {clue}</p>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}

            {puzzle.type === 'oddoneout' && (() => {
              const p = puzzle as OddOneOutPuzzle
              return (
                <>
                  <p className="text-orange-600/50 text-xs text-center mb-3">Which one doesn&apos;t belong?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {p.items.map((item, i) => (
                      <button
                        key={`option-${currentIdx}-${i}-${item}`}
                        type="button"
                        disabled={hasAnswered}
                        onClick={() => handleSelect(item)}
                        className={oddItemCls(item, p.answer)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )
            })()}

            {puzzle.type === 'rebus' && (() => {
              const p = puzzle as RebusPuzzle
              return (
                <>
                  <p className="text-orange-400/70 text-xs text-center mb-2">
                    What word or phrase does this represent?
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap my-3">
                    {p.parts.map((part, i) => (
                      <span
                        key={`puzzle-${currentIdx}-part-${i}`}
                        className={
                          part.type === 'emoji'  ? 'text-5xl leading-none' :
                          part.type === 'symbol' ? 'text-2xl text-orange-600/70 font-bold' :
                          'text-xl font-bold text-orange-200'
                        }
                      >
                        {part.content}
                      </span>
                    ))}
                  </div>
                </>
              )
            })()}

            {puzzle.type === 'spatial' && (() => {
              const p = puzzle as SpatialPuzzle
              return (
                <>
                  <p className="text-orange-100 text-sm leading-relaxed mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {p.question}
                  </p>
                  <SpatialVisual shapeDescription={p.shapeDescription} />
                </>
              )
            })()}

            {/* Shared 2×2 options grid (not OddOneOut — its items serve as options) */}
            {puzzle.type !== 'oddoneout' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {getOptions(puzzle).map((opt, i) => (
                  <button
                    key={`option-${currentIdx}-${i}-${opt}`}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleSelect(opt)}
                    className={optionCls(opt, puzzle.answer)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback */}
            {hasAnswered && (
              <p className={`font-bold text-sm mt-3 ${
                timedOut                   ? 'text-rose-400'  :
                selected === puzzle.answer ? 'text-green-400' : 'text-rose-400'
              }`}>
                {timedOut
                  ? '⏱ Time\'s up!'
                  : selected === puzzle.answer
                    ? `✓ Correct! +${earnedPts} pts`
                    : '✗ Incorrect'}
              </p>
            )}

            {/* Explanation */}
            {showExplanation && (
              <div className="bg-black/20 rounded-xl p-3 mt-2">
                <p className="text-orange-300/80 text-sm">💡 {puzzle.explanation}</p>
              </div>
            )}

          </div>

          {/* Hint */}
          {!hasAnswered && (
            <div className="mt-2 text-center">
              {showHint ? (
                <div className="bg-black/20 border border-orange-900/30 rounded-xl p-3">
                  <p className="text-orange-400/70 text-xs">{TYPE_HINTS[puzzle.type]}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleShowHint}
                  className="text-orange-700/60 text-xs underline hover:text-orange-500/80 transition-colors"
                >
                  💡 Hint {!hintUsed && <span className="text-orange-800/50">(costs 2 pts)</span>}
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── Daily Results ────────────────────────────────────────── */}
      {stage === 'results' && mode === 'daily' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col items-center">

          <p className="text-orange-200 text-2xl font-bold text-center mb-1">📅 Daily Complete!</p>
          <p className="text-orange-700/60 text-xs uppercase tracking-widest text-center mb-5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-orange-950/30 border border-orange-800/30 rounded-2xl px-8 py-4 text-center mb-5">
            <p className="text-orange-600/60 text-xs uppercase tracking-widest mb-1">Score</p>
            <p className="text-orange-100 text-4xl font-bold font-mono">{score}</p>
            <p className="text-orange-700/60 text-xs mt-1">out of 25</p>
          </div>

          <div className="w-full max-w-xs bg-white/[0.03] border border-orange-900/20 rounded-2xl p-4 mb-5 space-y-2">
            {puzzles.map((p, i) => {
              const r    = results[i]
              const info = TYPE_LABELS[p.type]
              return (
                <div key={`daily-res-${p.id}`} className="flex items-center justify-between font-mono text-sm">
                  <span className="text-orange-300/80">{info?.icon} {info?.label}</span>
                  <span className={r?.correct ? 'text-green-400 font-bold' : 'text-rose-400 font-bold'}>
                    {r?.correct ? '✓' : '✗'}
                  </span>
                </div>
              )
            })}
          </div>

          {streak > 0 && (
            <p className="text-orange-300 font-semibold text-base mb-2">🔥 {streak} day streak</p>
          )}

          <p className="text-orange-800/60 text-xs mb-6">Next challenge in {countdown}</p>

          <button
            type="button"
            onClick={handleQuit}
            className="w-full max-w-xs py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border border-orange-500/20 shadow-lg shadow-orange-600/25 transition-all"
          >
            Back to Menu
          </button>

        </div>
      )}

      {/* ── Classic / Speed Run Results ──────────────────────────── */}
      {stage === 'results' && mode !== 'daily' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">

          <p className="text-orange-800/40 text-center text-sm mb-4">◆ ─────── 🧩 ─────── ◆</p>

          {/* Score */}
          <div className="text-center mb-2">
            <span className="text-orange-100 text-6xl font-bold">{score}</span>
            <span className="text-orange-700 text-xl ml-2">/ {maxScore}</span>
          </div>

          {/* Grade */}
          <div className="text-center mb-3">
            <p className="text-4xl">{grade.emoji}</p>
            <p className="text-orange-200 text-xl font-bold mt-1">{grade.title}</p>
          </div>

          {/* New PB */}
          {isNewPB && (
            <p className="text-orange-300 font-bold text-center text-sm mb-3">✨ New Personal Best!</p>
          )}

          {/* Per-type breakdown */}
          <div className="bg-black/20 rounded-xl p-4 mb-3 space-y-1">
            {typeBreakdown.map(b => (
              <div key={`tb-${b.type}`} className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-300/70">{TYPE_LABELS[b.type]?.icon} {TYPE_LABELS[b.type]?.label}</span>
                <span className={
                  b.total === 0 ? 'text-orange-800/40' :
                  b.correct === b.total ? 'text-green-400' :
                  b.correct > 0 ? 'text-orange-400' : 'text-rose-400'
                }>
                  {b.correct}/{b.total} {b.correct === b.total ? '✓' : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Review first wrong answer */}
          {firstWrongPuzzle && (
            <div className="bg-black/20 rounded-xl p-4 mb-3">
              <p className="text-orange-500/60 text-xs mb-2">📖 Review:</p>
              <p className="text-orange-200/80 text-sm mb-2 leading-relaxed">
                {getQuestionText(firstWrongPuzzle)}
              </p>
              <p className="text-white font-bold text-sm mb-1">Answer: {firstWrongPuzzle.answer}</p>
              <p className="text-orange-700/70 text-xs">{firstWrongPuzzle.explanation}</p>
            </div>
          )}

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-orange-400/80 border border-orange-800/30 bg-white/[0.03] hover:bg-orange-950/20 hover:border-orange-600/40 transition-all mb-3"
          >
            📤 Share Result
          </button>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border border-orange-500/20 shadow-lg shadow-orange-600/25 transition-all"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={handleQuit}
              className="flex-1 py-2.5 px-6 rounded-xl text-sm font-medium text-orange-400/70 bg-white/5 border border-orange-800/30 hover:bg-orange-950/20 transition-all"
            >
              Change Mode
            </button>
          </div>

          {/* How to play guide */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-orange-800/60 text-xs underline hover:text-orange-600/80 transition-colors w-full text-center"
            >
              {showHowTo ? 'Hide guide' : 'Puzzle type guide'}
            </button>
            {showHowTo && (
              <div className="mt-2 bg-black/20 border border-orange-900/20 rounded-xl p-4 space-y-2">
                {RESULTS_GUIDE.map((g, i) => (
                  <div key={i} className="text-xs leading-relaxed">
                    <span className="text-orange-400/70 font-semibold">{g.icon} {g.label}: </span>
                    <span className="text-orange-500/60">{g.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
