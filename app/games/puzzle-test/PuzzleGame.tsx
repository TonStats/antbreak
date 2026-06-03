'use client'

import { useState, useEffect, useRef } from 'react'
import { Grid2x2, Maximize2, Minimize2, X } from 'lucide-react'
import type {
  AnyPuzzle, PuzzleMode, PuzzleDifficulty, PuzzleResult,
  SequencePuzzle, LogicPuzzle, OddOneOutPuzzle, SpatialPuzzle,
  EmojiPuzzlePuzzle,
} from '@/types/puzzle'
import {
  getPuzzles,
  SEQUENCE_PUZZLES, DEDUCTION_PUZZLES,
  SPATIAL_PUZZLES, EMOJI_PUZZLE_PUZZLES,
} from '@/data/puzzleData'

// ─── Constants ────────────────────────────────────────────────────────────────

type Stage = 'setup' | 'playing' | 'results'

const CLASSIC_COUNT          = 15
const SPEEDRUN_COUNT         = 10
const POINTS_CORRECT_NO_HINT = 5
const POINTS_CORRECT_HINT1   = 3
const POINTS_CORRECT_HINT2   = 2
const HINT_COST              = 5
const SPEED_SECONDS          = 20
const ADVANCE_DELAY          = 2000

const MODES: { id: PuzzleMode; icon: string; name: string; tagline: string }[] = [
  { id: 'classic',  icon: '🧩', name: 'Classic',   tagline: 'Sequence · Deduction · Emoji Puzzle · Spatial' },
  { id: 'speedrun', icon: '⚡', name: 'Speed Run', tagline: 'All 4 types · 20 seconds each'                  },
]

const DIFFICULTIES: { id: PuzzleDifficulty; label: string; active: string }[] = [
  { id: 'easy',   label: 'Easy',   active: 'bg-emerald-500 border-emerald-500 text-white' },
  { id: 'medium', label: 'Medium', active: 'bg-orange-500 border-orange-500 text-white'   },
  { id: 'hard',   label: 'Hard',   active: 'bg-rose-600 border-rose-600 text-white'        },
]

const CATEGORY_OPTIONS = [
  { id: 'all',         icon: '',   label: 'All Types',    selBg: 'bg-orange-500', selText: 'text-white',      selBorder: 'border-orange-400' },
  { id: 'sequence',    icon: '🔢', label: 'Sequence',     selBg: 'bg-blue-600',   selText: 'text-white',      selBorder: 'border-blue-500'   },
  { id: 'deduction',   icon: '🧠', label: 'Deduction',    selBg: 'bg-purple-600', selText: 'text-white',      selBorder: 'border-purple-500' },
  { id: 'emojipuzzle', icon: '😀', label: 'Emoji Puzzle', selBg: 'bg-yellow-500', selText: 'text-yellow-900', selBorder: 'border-yellow-400' },
  { id: 'spatial',     icon: '🔷', label: 'Spatial',      selBg: 'bg-pink-600',   selText: 'text-white',      selBorder: 'border-pink-500'   },
] as const

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  sequence:    { icon: '🔢', label: 'Number Sequence' },
  deduction:   { icon: '🧠', label: 'Deduction'       },
  emojipuzzle: { icon: '😀', label: 'Emoji Puzzle'    },
  spatial:     { icon: '🔷', label: 'Spatial'         },
}

const TYPE_BADGE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  sequence:    { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/40',   label: '🔢 NUMBER SEQUENCE' },
  deduction:   { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40', label: '🧠 DEDUCTION'       },
  emojipuzzle: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40', label: '😀 EMOJI PUZZLE'    },
  spatial:     { bg: 'bg-pink-500/20',   text: 'text-pink-300',   border: 'border-pink-500/40',   label: '🔷 SPATIAL PUZZLE'  },
}

const TYPE_HINTS: Record<string, string> = {
  sequence:    'Look at the differences or ratios between consecutive terms — does the gap grow, shrink, or stay fixed?',
  deduction:   'Work through each clue one by one, or try different category groupings — function, origin, spelling, or hidden property.',
  emojipuzzle: "Say each emoji's name out loud and think about what word or phrase it sounds like.",
  spatial:     'Close your eyes and visualise rotating or transforming the shape step by step.',
}

const INPUT_PLACEHOLDERS: Record<string, string> = {
  sequence:    'Type the missing number...',
  deduction:   'Type your answer...',
  emojipuzzle: 'Type what this represents...',
  spatial:     'Type your answer...',
}

const HOW_TO_GUIDE = [
  { label: 'Classic',   body: 'Work through 15 puzzles with no time limit. Five puzzle types rotate so every question feels fresh.' },
  { label: 'Speed Run', body: '10 puzzles, 20 seconds each. Answer quickly — time out and the question auto-advances.' },
  { label: 'Hints',     body: 'Each puzzle has a hint. Use it if stuck — it reduces your score from 5 to 3 points.' },
  { label: 'Types',     body: 'Sequence: find the pattern. Deduction: deduce from clues or spot the misfit. Emoji Puzzle: decode picture rebuses or emoji combos. Spatial: visualise shapes.' },
]

const RESULTS_GUIDE = [
  { icon: '🔢', label: 'Sequences',    body: 'Find the pattern in numbers or letters to identify what comes next.' },
  { icon: '🧠', label: 'Deduction',    body: 'Use clues to reason logically, or identify the item that doesn\'t share the same connection.' },
  { icon: '😀', label: 'Emoji Puzzle', body: "Decode the emoji sequence — say each emoji's name to find the hidden word or phrase." },
  { icon: '🔷', label: 'Spatial',      body: 'Visualise shapes, rotations and patterns in your mind to answer.' },
]

const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => ({
  left:  (i * 37 + 11) % 100,
  delay: (i * 0.13) % 1.8,
  dur:   1.6 + (i * 0.07) % 1.4,
  color: ['#fb923c', '#fbbf24', '#f97316', '#f59e0b', '#d97706', '#ea580c'][i % 6],
  w:     4 + (i % 3) * 2,
  h:     6 + (i % 4) * 2,
}))

// ─── Module-level helpers ──────────────────────────────────────────────────────

function modeMax(m: PuzzleMode): number {
  return m === 'classic' ? CLASSIC_COUNT : SPEEDRUN_COUNT
}

function timerCls(t: number): string {
  if (t > 12) return 'bg-zinc-800 border-zinc-600 text-white'
  if (t > 4)  return 'bg-yellow-800/60 border-yellow-600 text-yellow-200'
  return 'bg-rose-800/60 border-rose-600 text-rose-300 animate-pulse'
}

function getGrade(pct: number): { emoji: string; title: string } {
  if (pct >= 100) return { emoji: '🧠', title: 'Puzzle Master'   }
  if (pct >= 75)  return { emoji: '💡', title: 'Sharp Mind'      }
  if (pct >= 50)  return { emoji: '🔍', title: 'Logical Thinker' }
  if (pct >= 25)  return { emoji: '🧩', title: 'Puzzle Novice'   }
  return               { emoji: '🌱', title: 'Keep Practising' }
}

function checkTextAnswer(input: string, puzzle: AnyPuzzle): boolean {
  const clean = (s: string) =>
    s.toLowerCase()
     .trim()
     .replace(/^(a |an |the )/, '')
     .replace(/[^a-z0-9]/g, '')
  const cleaned = clean(input)
  if (clean(puzzle.answer) === cleaned) return true
  if ('alternateAnswers' in puzzle) {
    const alts = (puzzle as EmojiPuzzlePuzzle).alternateAnswers
    if (alts.some(a => clean(a) === cleaned)) return true
  }
  return false
}

function getQuestionText(p: AnyPuzzle): string {
  if (p.type === 'sequence')                                 return `Sequence: ${(p as SequencePuzzle).sequence.join(' → ')}`
  if (p.type === 'deduction' && p.subtype === 'logic')       return (p as LogicPuzzle).question
  if (p.type === 'deduction' && p.subtype === 'oddoneout')   return `Odd one out: ${(p as OddOneOutPuzzle).items.join(', ')}`
  if (p.type === 'emojipuzzle')                              return (p as EmojiPuzzlePuzzle).parts.map(pt => pt.content).join(' ')
  if (p.type === 'spatial')                                  return (p as SpatialPuzzle).question
  return ''
}

function getFilteredPuzzles(
  count: number,
  difficulty: PuzzleDifficulty,
  category: string,
): AnyPuzzle[] {
  if (category === 'all') return getPuzzles(count, difficulty)
  const pool: AnyPuzzle[] = [
    ...SEQUENCE_PUZZLES,
    ...DEDUCTION_PUZZLES,
    ...EMOJI_PUZZLE_PUZZLES,
    ...SPATIAL_PUZZLES,
  ]
  return pool
    .filter(p => p.type === category && p.difficulty === difficulty)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

function generateDistractors(answer: string, type: string): string[] {
  if (type === 'sequence') {
    const num = parseInt(answer)
    if (!isNaN(num)) {
      return [String(num + 2), String(num - 2), String(num * 2)]
    }
  }
  return ['Option B', 'Option C', 'Option D']
}

function getHintOptions(puzzle: AnyPuzzle, hintLevel: 1 | 2): string[] {
  if (puzzle.type === 'emojipuzzle') {
    const ep = puzzle as EmojiPuzzlePuzzle
    if (hintLevel === 1 && ep.hint1Options.length > 0) return ep.hint1Options
    if (hintLevel === 2 && ep.hint2Options.length > 0) return ep.hint2Options
  }
  const answer     = puzzle.answer
  const distractors = generateDistractors(answer, puzzle.type)
  if (hintLevel === 1) {
    return [answer, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5)
  }
  return [answer, distractors[0]].sort(() => Math.random() - 0.5)
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
  const [stage,            setStage]            = useState<Stage>('setup')
  const [mode,             setMode]             = useState<PuzzleMode | null>(null)
  const [difficulty,       setDifficulty]       = useState<PuzzleDifficulty>('medium')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [bestScore,        setBestScore]        = useState<string | null>(null)
  const [showHowTo,        setShowHowTo]        = useState(false)
  const [isFullscreen,     setIsFullscreen]     = useState(false)

  // ── Game state ─────────────────────────────────────────────────
  const [puzzles,         setPuzzles]         = useState<AnyPuzzle[]>([])
  const [currentIdx,      setCurrentIdx]      = useState(0)
  const [hasAnswered,     setHasAnswered]     = useState(false)
  const [wasCorrect,      setWasCorrect]      = useState(false)
  const [timedOut,        setTimedOut]        = useState(false)
  const [score,                  setScore]                  = useState(0)
  const [sessionPoints,          setSessionPoints]          = useState(0)
  const [hintsUsedThisQuestion,  setHintsUsedThisQuestion]  = useState(0)
  const [shownOptions,           setShownOptions]           = useState<string[]>([])
  const [showInsufficientPoints, setShowInsufficientPoints] = useState(false)
  const [showExplanation,        setShowExplanation]        = useState(false)
  const [timeLeft,        setTimeLeft]        = useState(SPEED_SECONDS)
  const [results,         setResults]         = useState<PuzzleResult[]>([])
  const [textAnswer,      setTextAnswer]      = useState('')
  const [inputShake,      setInputShake]      = useState(false)

  // ── Results state ──────────────────────────────────────────────
  const [isNewPB,      setIsNewPB]      = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // ── Refs ───────────────────────────────────────────────────────
  const cardRef    = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const pbSavedRef = useRef(false)

  // ── Reset category when mode changes ──────────────────────────
  useEffect(() => {
    setSelectedCategory('all')
  }, [mode])

  // ── Best score updates with mode / difficulty ──────────────────
  useEffect(() => {
    if (!mode) { setBestScore(null); return }
    const key = `puzzle_best_${mode}_${difficulty}`
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
    setWasCorrect(false)
    setResults(prev => [...prev, {
      puzzleId: puzzle.id, correct: false,
      timeSeconds: SPEED_SECONDS, hintUsed: hintsUsedThisQuestion > 0, pointsEarned: 0,
    }])
  }, [timeLeft, mode, stage, hasAnswered, puzzles, currentIdx, hintsUsedThisQuestion])

  // ── Reset input + hint state + auto-focus on new question ────
  useEffect(() => {
    setTextAnswer('')
    setInputShake(false)
    setWasCorrect(false)
    setHintsUsedThisQuestion(0)
    setShownOptions([])
    setShowInsufficientPoints(false)
    if (stage === 'playing') {
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [currentIdx, stage])

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
        setHasAnswered(false)
        setTimedOut(false)
        setShowExplanation(false)
        setTimeLeft(SPEED_SECONDS)
      }
    }, ADVANCE_DELAY)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnswered, stage, currentIdx])

  // ── Save PB + trigger confetti ────────────────────────────────
  useEffect(() => {
    if (stage === 'setup') { pbSavedRef.current = false; return }
    if (stage !== 'results' || !mode || pbSavedRef.current) return
    pbSavedRef.current = true

    const correctCount = results.filter(r => r.correct).length
    const key          = `puzzle_best_${mode}_${difficulty}`
    const prevBest     = parseInt(localStorage.getItem(key) ?? '0')
    if (correctCount > prevBest) {
      localStorage.setItem(key, String(correctCount))
      setIsNewPB(true)
      setBestScore(String(correctCount))
    }

    const maxScore = puzzles.length * POINTS_CORRECT_NO_HINT
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
    if (!mode) return
    const qs = getFilteredPuzzles(
      mode === 'classic' ? CLASSIC_COUNT : SPEEDRUN_COUNT,
      difficulty,
      selectedCategory,
    )
    setPuzzles(qs)
    setCurrentIdx(0)
    setHasAnswered(false)
    setWasCorrect(false)
    setTimedOut(false)
    setScore(0)
    setSessionPoints(0)
    setHintsUsedThisQuestion(0)
    setShownOptions([])
    setShowInsufficientPoints(false)
    setShowExplanation(false)
    setTimeLeft(SPEED_SECONDS)
    setResults([])
    setIsNewPB(false)
    setShowConfetti(false)
    setShowHowTo(false)
    setTextAnswer('')
    setInputShake(false)
    pbSavedRef.current = false
    setStage('playing')
  }

  function handleQuit() {
    setStage('setup')
    setPuzzles([])
    setCurrentIdx(0)
    setHasAnswered(false)
    setWasCorrect(false)
    setTimedOut(false)
    setScore(0)
    setSessionPoints(0)
    setHintsUsedThisQuestion(0)
    setShownOptions([])
    setShowInsufficientPoints(false)
    setShowExplanation(false)
    setTimeLeft(SPEED_SECONDS)
    setResults([])
    setIsNewPB(false)
    setShowConfetti(false)
    setTextAnswer('')
    setInputShake(false)
  }

  function handleSubmitText() {
    if (!textAnswer.trim() || hasAnswered) return
    const p = puzzles[currentIdx]
    if (!p) return

    const correct = checkTextAnswer(textAnswer, p)
    if (correct) {
      const pointsEarned = hintsUsedThisQuestion === 0 ? POINTS_CORRECT_NO_HINT
        : hintsUsedThisQuestion === 1 ? POINTS_CORRECT_HINT1
        : POINTS_CORRECT_HINT2
      setWasCorrect(true)
      setHasAnswered(true)
      setScore(prev => prev + pointsEarned)
      setSessionPoints(prev => prev + pointsEarned)
      setResults(prev => [...prev, {
        puzzleId: p.id, correct: true,
        timeSeconds: mode === 'speedrun' ? SPEED_SECONDS - timeLeft : 0,
        hintUsed: hintsUsedThisQuestion > 0, pointsEarned,
      }])
    } else {
      setInputShake(true)
      setTimeout(() => setInputShake(false), 500)
      if (hintsUsedThisQuestion >= 2) {
        // Lock out after both hints used and still wrong
        setWasCorrect(false)
        setHasAnswered(true)
        setResults(prev => [...prev, {
          puzzleId: p.id, correct: false,
          timeSeconds: mode === 'speedrun' ? SPEED_SECONDS - timeLeft : 0,
          hintUsed: true, pointsEarned: 0,
        }])
      } else {
        setTextAnswer('')
      }
    }
  }

  function handleHint() {
    if (hintsUsedThisQuestion >= 2) return
    const p = puzzles[currentIdx]
    if (!p) return
    if (sessionPoints < HINT_COST) {
      setShowInsufficientPoints(true)
      setTimeout(() => setShowInsufficientPoints(false), 2000)
      return
    }
    setSessionPoints(prev => prev - HINT_COST)
    const newHintCount = (hintsUsedThisQuestion + 1) as 1 | 2
    setHintsUsedThisQuestion(newHintCount)
    setShownOptions(getHintOptions(p, newHintCount))
  }

  function handleShare() {
    const canvas  = document.createElement('canvas')
    canvas.width  = 600
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const maxScore = puzzles.length * POINTS_CORRECT_NO_HINT
    const pct      = maxScore > 0 ? (score / maxScore) * 100 : 0
    const grade    = getGrade(pct)

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 600, 300)
    ctx.fillStyle = '#f97316'
    ctx.fillRect(0, 0, 600, 4)
    ctx.fillStyle = '#fb923c'
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ANTBREAK  PUZZLE TEST', 300, 40)
    ctx.font = '52px system-ui, sans-serif'
    ctx.fillText(grade.emoji, 300, 110)
    ctx.fillStyle = '#fdba74'
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillText(grade.title, 300, 148)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui, monospace'
    ctx.fillText(String(score), 300, 228)
    ctx.fillStyle = '#7c2d12'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillText(`/ ${maxScore} pts`, 300, 258)
    ctx.fillStyle = '#431407'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('antbreak.com', 300, 291)

    const link    = document.createElement('a')
    link.download = `antbreak-puzzle-${score}.png`
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  // ── Derived ────────────────────────────────────────────────────

  const canStart   = mode !== null
  const activeMode = mode ? MODES.find(m => m.id === mode) : null
  const puzzle     = puzzles[currentIdx] ?? null

  const maxScore      = puzzles.length * POINTS_CORRECT_NO_HINT
  const pct           = maxScore > 0 ? (score / maxScore) * 100 : 0
  const grade         = getGrade(pct)
  const lastResult    = results[results.length - 1]
  const earnedPts     = lastResult?.pointsEarned ?? 0
  const progressWidth = puzzles.length ? (currentIdx / puzzles.length) * 100 : 0

  const typeOrder = ['sequence', 'deduction', 'emojipuzzle', 'spatial']
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
          '0 0 0 1px rgba(249,115,22,0.5), 0 0 40px rgba(249,115,22,0.12), 0 25px 50px rgba(0,0,0,0.7)',
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
        <h1 className={`text-white font-bold leading-none ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
          Puzzle Test
        </h1>

        {stage === 'playing' && (
          <span className="text-orange-300 text-xs font-mono shrink-0 flex-1">💡 {sessionPoints} pts</span>
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
            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-rose-500/50 text-zinc-400 hover:text-rose-400 transition-colors p-1.5 w-8 h-8 flex items-center justify-center"
            aria-label="Quit"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-orange-500/50 text-zinc-400 hover:text-orange-300 transition-colors p-1.5 w-8 h-8 flex items-center justify-center"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Divider / progress bar */}
      {stage === 'playing' ? (
        <div className="h-1 bg-zinc-700 shrink-0 relative">
          <div
            className="absolute inset-y-0 left-0 bg-orange-500 transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      ) : (
        <hr className="border-zinc-700 mx-5 shrink-0" />
      )}

      {/* ── Setup ───────────────────────────────────────────────── */}
      {stage === 'setup' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center">

          <p className="text-orange-300 text-xs uppercase tracking-widest text-center mb-4">
            🧩 Test your logical thinking
          </p>

          <p className="text-orange-300 text-xs uppercase tracking-widest text-center mb-3">
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
                    : 'bg-zinc-800/80 border border-zinc-600/50 hover:border-orange-500/40 hover:bg-zinc-700/80',
                ].join(' ')}
                style={mode === m.id ? { boxShadow: 'inset 0 0 20px rgba(249,115,22,0.1)' } : undefined}
              >
                <span className="text-3xl shrink-0 leading-none">{m.icon}</span>
                <span className="min-w-0">
                  <span className="block text-white font-bold text-sm">{m.name}</span>
                  <span className="block text-zinc-400 text-xs mt-0.5">{m.tagline}</span>
                </span>
              </button>
            ))}
          </div>

          {mode && (
            <>
              <div className="mb-3">
                <p className="text-zinc-400 text-xs uppercase tracking-widest text-center mb-2 mt-4">
                  Choose Category
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {CATEGORY_OPTIONS.map(cat => {
                    const sel = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={[
                          'rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-150 border',
                          sel
                            ? `${cat.selBg} ${cat.selText} ${cat.selBorder}`
                            : 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700',
                        ].join(' ')}
                      >
                        {cat.icon ? `${cat.icon} ` : ''}{cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-orange-300 text-xs uppercase tracking-widest text-center mb-2">
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
                          : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-orange-500/50 hover:text-white',
                      ].join(' ')}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {bestScore && activeMode && (
            <p className="text-zinc-400 text-xs text-center mt-1">
              Best: {bestScore}/{modeMax(activeMode.id)} on {activeMode.name}
            </p>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart}
            className={[
              'mt-5 w-full py-3 rounded-xl font-bold text-base text-white transition-all',
              'border border-orange-500/20 shadow-lg shadow-orange-500/40',
              'bg-gradient-to-r from-orange-600 to-amber-600',
              canStart
                ? 'hover:from-orange-500 hover:to-amber-500 cursor-pointer'
                : 'opacity-40 cursor-not-allowed',
            ].join(' ')}
          >
            🧩 Start
          </button>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-orange-300 text-xs underline hover:text-orange-200 transition-colors"
            >
              {showHowTo ? 'Hide guide' : 'How to play'}
            </button>
            {showHowTo && (
              <div
                className="mt-2 text-left bg-zinc-800 border border-zinc-600 rounded-xl p-4 space-y-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {HOW_TO_GUIDE.map((section, i) => (
                  <div key={i}>
                    <span className="text-orange-300 text-xs font-semibold not-italic">{section.label}: </span>
                    <span className="text-zinc-300 text-xs leading-relaxed">{section.body}</span>
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

          <p className="text-zinc-400 text-xs text-center mt-1 shrink-0">
            Puzzle {currentIdx + 1} of {puzzles.length}
          </p>

          {(() => {
            const bs = TYPE_BADGE_STYLES[puzzle.type]
            if (!bs) return null
            const subtype = (puzzle as { subtype?: string }).subtype
            const label = puzzle.type === 'deduction'
              ? (subtype === 'oddoneout' ? '🎯 ODD ONE OUT' : '🧠 LOGIC DEDUCTION')
              : bs.label
            return (
              <span className={`block w-fit mx-auto mt-2 ${bs.bg} border ${bs.border} rounded-full px-3 py-0.5 text-xs font-semibold ${bs.text} shrink-0 tracking-wide`}>
                {label}
              </span>
            )
          })()}

          <div className={`bg-zinc-800/60 border border-zinc-600/40 rounded-2xl mt-3 flex flex-col ${puzzle.type === 'emojipuzzle' && (puzzle as EmojiPuzzlePuzzle).style === 'symbolic' ? 'p-6' : 'p-5'}`}>

            {/* ── Sequence ── */}
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
                            : 'bg-zinc-700 border border-zinc-500 rounded-xl px-4 py-3 text-xl font-mono font-bold text-white min-w-[60px] text-center'
                        }
                      >
                        {i === p.missingIndex ? '?' : String(val)}
                      </div>
                    ))}
                  </div>
                  <p className="text-zinc-400 text-xs text-center mt-1">What is the missing number?</p>
                </>
              )
            })()}

            {/* ── Deduction (logic + odd-one-out) ── */}
            {puzzle.type === 'deduction' && (() => {
              if (puzzle.subtype === 'logic') {
                const p = puzzle as LogicPuzzle
                return (
                  <>
                    <p className="text-white font-semibold text-sm leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                      {p.question}
                    </p>
                    {p.clues.length > 0 && (
                      <div className="bg-zinc-900 rounded-xl p-3 mb-2 space-y-1">
                        {p.clues.map((clue, i) => (
                          <p key={`puzzle-${currentIdx}-clue-${i}`} className="text-zinc-300 text-xs">• {clue}</p>
                        ))}
                      </div>
                    )}
                  </>
                )
              }
              const p = puzzle as OddOneOutPuzzle
              return (
                <>
                  <p className="text-zinc-400 text-xs text-center mb-3">Which one doesn&apos;t belong?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {p.items.map((item, i) => (
                      <div
                        key={`item-${currentIdx}-${i}`}
                        className={[
                          'rounded-xl px-4 py-3 text-base font-semibold select-none',
                          hasAnswered && item === p.answer
                            ? 'bg-green-900/30 border border-green-600 text-green-300'
                            : 'bg-zinc-700 border border-zinc-500 text-white',
                        ].join(' ')}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}

            {/* ── Emoji Puzzle ── */}
            {puzzle.type === 'emojipuzzle' && (() => {
              const p = puzzle as EmojiPuzzlePuzzle
              return p.style === 'rebus' ? (
                <>
                  <p className="text-zinc-400 text-xs text-center mb-2">
                    What word or phrase does this represent?
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap my-3">
                    {p.parts.map((part, i) => (
                      <span
                        key={`puzzle-${currentIdx}-part-${i}`}
                        className={
                          part.type === 'emoji'  ? 'text-5xl leading-none' :
                          part.type === 'symbol' ? 'text-2xl text-orange-400 font-bold' :
                          'text-xl font-bold text-orange-200'
                        }
                      >
                        {part.content}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-4 flex-wrap my-6 px-4">
                    {p.parts.map((part, i) => (
                      <span
                        key={`emoji-${currentIdx}-${i}`}
                        className="text-5xl sm:text-6xl leading-none select-none"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                      >
                        {part.content}
                      </span>
                    ))}
                  </div>
                  <p className="text-orange-300/70 text-sm text-center mb-2">
                    What does this emoji sequence represent?
                  </p>
                </div>
              )
            })()}

            {/* ── Spatial ── */}
            {puzzle.type === 'spatial' && (() => {
              const p = puzzle as SpatialPuzzle
              return (
                <>
                  <p className="text-white font-semibold text-sm leading-relaxed mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {p.question}
                  </p>
                  <SpatialVisual shapeDescription={p.shapeDescription} />
                </>
              )
            })()}

            {/* ── Text input ── */}
            {!hasAnswered && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmitText() }}
                  placeholder={INPUT_PLACEHOLDERS[puzzle.type] ?? 'Type your answer...'}
                  className={[
                    'bg-zinc-800 border-2 outline-none rounded-xl px-4 py-3',
                    'text-white font-medium text-base placeholder:text-zinc-600 w-full mt-4',
                    'transition-colors duration-150',
                    inputShake
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-zinc-600 focus:border-orange-400',
                  ].join(' ')}
                  style={{ caretColor: 'orange' }}
                />
                <button
                  type="button"
                  onClick={handleSubmitText}
                  disabled={!textAnswer.trim()}
                  className={[
                    'bg-orange-500 text-white font-bold text-sm rounded-xl px-8 py-2.5 mt-3 w-full transition-all',
                    textAnswer.trim() ? 'hover:bg-orange-400 cursor-pointer' : 'opacity-40 cursor-not-allowed',
                  ].join(' ')}
                >
                  Submit Answer
                </button>
              </>
            )}

            {/* ── Feedback ── */}
            {hasAnswered && (
              <div className="mt-3">
                {timedOut ? (
                  <p className="font-bold text-sm text-rose-400">⏱ Time&apos;s up!</p>
                ) : wasCorrect ? (
                  <p className="font-bold text-sm text-green-400">✓ Correct! +{earnedPts} pts</p>
                ) : (
                  <>
                    <p className="font-bold text-sm text-rose-400">✗ Incorrect</p>
                    <p className="text-zinc-400 text-xs mt-1">
                      The answer was: <span className="text-white font-semibold">{puzzle.answer}</span>
                    </p>
                  </>
                )}
              </div>
            )}

            {/* ── Explanation ── */}
            {showExplanation && (
              <div className="bg-zinc-800 rounded-xl p-3 mt-2">
                <p className="text-orange-200 text-sm">💡 {puzzle.explanation}</p>
              </div>
            )}

          </div>

          {/* ── Hint area ── */}
          {!hasAnswered && (
            <div className="mt-3">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={hintsUsedThisQuestion >= 2}
                  className={[
                    'text-xs rounded-lg px-3 py-1.5 transition-all border',
                    hintsUsedThisQuestion >= 2
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-600 opacity-40 cursor-not-allowed'
                      : sessionPoints < HINT_COST
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-pointer'
                        : 'bg-zinc-700 border-zinc-500 text-zinc-300 hover:bg-zinc-600 cursor-pointer',
                  ].join(' ')}
                >
                  {hintsUsedThisQuestion >= 2 ? '💡 No more hints' : `💡 Hint (${sessionPoints} pts)`}
                </button>
              </div>

              {showInsufficientPoints && (
                <div className="bg-zinc-800 border border-rose-700/50 rounded-lg px-3 py-2 text-rose-300 text-xs text-center mt-2">
                  Not enough points. Answer questions to earn points first!
                </div>
              )}

              {shownOptions.length > 0 && (
                <div className="mt-3">
                  <p className="text-zinc-500 text-xs mb-1 text-center">Choose from:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {shownOptions.map((opt, i) => (
                      <button
                        key={`hint-opt-${currentIdx}-${i}`}
                        type="button"
                        onClick={() => {
                          setTextAnswer(opt)
                          inputRef.current?.focus()
                        }}
                        className="bg-zinc-700 border border-zinc-500 text-zinc-200 text-sm rounded-lg px-4 py-2 hover:bg-zinc-600 hover:border-orange-400/60 cursor-pointer transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {stage === 'results' && (
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">

          <p className="text-zinc-600 text-center text-sm mb-4">◆ ─────── 🧩 ─────── ◆</p>

          <div className="text-center mb-2">
            <span className="text-orange-400 text-6xl font-bold">{score}</span>
            <span className="text-zinc-400 text-xl ml-2">/ {maxScore}</span>
          </div>

          <div className="text-center mb-3">
            <p className="text-4xl">{grade.emoji}</p>
            <p className="text-orange-200 text-xl font-bold mt-1">{grade.title}</p>
          </div>

          {isNewPB && (
            <p className="text-orange-300 font-bold text-center text-sm mb-3">✨ New Personal Best!</p>
          )}

          <div className="bg-zinc-800 rounded-xl p-4 mb-3 space-y-1">
            {typeBreakdown.map(b => (
              <div key={`tb-${b.type}`} className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">{TYPE_LABELS[b.type]?.icon} {TYPE_LABELS[b.type]?.label}</span>
                <span className={
                  b.total === 0      ? 'text-orange-800/40' :
                  b.correct === b.total ? 'text-green-400'  :
                  b.correct > 0      ? 'text-orange-400'    : 'text-rose-400'
                }>
                  {b.correct}/{b.total} {b.correct === b.total ? '✓' : ''}
                </span>
              </div>
            ))}
          </div>

          {firstWrongPuzzle && (
            <div className="bg-zinc-800 rounded-xl p-4 mb-3">
              <p className="text-zinc-400 text-xs mb-2">📖 Review:</p>
              <p className="text-zinc-200 text-sm mb-2 leading-relaxed">
                {getQuestionText(firstWrongPuzzle)}
              </p>
              <p className="text-white font-bold text-sm mb-1">Answer: {firstWrongPuzzle.answer}</p>
              <p className="text-zinc-400 text-xs">{firstWrongPuzzle.explanation}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-orange-400/80 border border-orange-800/30 bg-white/[0.03] hover:bg-orange-950/20 hover:border-orange-600/40 transition-all mb-3"
          >
            📤 Share Result
          </button>

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
              className="flex-1 py-2.5 px-6 rounded-xl text-sm font-medium text-zinc-200 bg-zinc-700 border border-zinc-500 hover:bg-zinc-600 transition-all"
            >
              Change Mode
            </button>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowHowTo(v => !v)}
              className="text-orange-300 text-xs underline hover:text-orange-200 transition-colors w-full text-center"
            >
              {showHowTo ? 'Hide guide' : 'Puzzle type guide'}
            </button>
            {showHowTo && (
              <div className="mt-2 bg-zinc-800 border border-zinc-600 rounded-xl p-4 space-y-2">
                {RESULTS_GUIDE.map((g, i) => (
                  <div key={i} className="text-xs leading-relaxed">
                    <span className="text-orange-300 font-semibold">{g.icon} {g.label}: </span>
                    <span className="text-zinc-300">{g.body}</span>
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
