'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react'
import type { GameMode, Difficulty, QuizQuestion, Country } from '@/types/geography'
import { COUNTRIES } from '@/data/geography'
import { generateQuestions, getDailyQuestions, getOptionDisplay } from '@/lib/geographyUtils'

// ── Local types ───────────────────────────────────────────────────────────────

type Stage         = 'setup' | 'playing' | 'results'
type QuestionCount = 5 | 10 | 15 | 20

interface ModeConfig {
  id:        GameMode
  emoji:     string
  name:      string
  desc:      string
  fullWidth?: true
}

interface DiffConfig {
  label:  string
  icon:   string
  desc:   string
  selCls: string
}

interface GradeInfo {
  letter: 'S' | 'A' | 'B' | 'C' | 'D'
  bg:     string
  fg:     string
  text:   string
}

// ── Static config ─────────────────────────────────────────────────────────────

const MODES: ModeConfig[] = [
  { id: 'flags',      emoji: '🚩', name: 'Flag Master',     desc: 'Identify flags from 195 countries' },
  { id: 'map',        emoji: '🗺️', name: 'Map Tap',         desc: 'Click where the country is on the map' },
  { id: 'capitals',   emoji: '🏛️', name: 'Capital Cities',  desc: 'Match countries to their capitals' },
  { id: 'population', emoji: '👥', name: 'Population Duel', desc: 'Which country has more people?' },
  { id: 'daily',      emoji: '⭐', name: 'Daily Challenge', desc: '10 questions, all modes, one shot', fullWidth: true },
]

const MODE_META: Record<GameMode, { emoji: string; name: string }> = {
  flags:      { emoji: '🚩', name: 'Flag Master' },
  map:        { emoji: '🗺️', name: 'Map Tap' },
  capitals:   { emoji: '🏛️', name: 'Capital Cities' },
  population: { emoji: '👥', name: 'Population Duel' },
  daily:      { emoji: '⭐', name: 'Daily Challenge' },
}

const DIFF_CFG: Record<Difficulty, DiffConfig> = {
  easy:   { label: 'Explorer',   icon: '🌱', desc: '30 well-known countries', selCls: 'bg-emerald-600 text-white border-emerald-500' },
  medium: { label: 'Adventurer', icon: '🧭', desc: '120 countries worldwide',  selCls: 'bg-sky-600 text-white border-sky-500' },
  hard:   { label: 'Expert',     icon: '🏔️', desc: 'All 195 countries',        selCls: 'bg-rose-600 text-white border-rose-500' },
}

const COUNTS: QuestionCount[] = [5, 10, 15, 20]

const ANSWER_TIME_SECONDS = 10
const ADVANCE_DELAY_MS    = 1500

const GRADE_CANVAS_COLOR: Record<string, string> = {
  S: '#facc15', A: '#34d399', B: '#38bdf8', C: '#fb923c', D: '#71717a',
}

const DAYS   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatToday(): string {
  const d = new Date()
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function getMidnightDiff() {
  const now      = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const ms = midnight.getTime() - now.getTime()
  return {
    h: Math.floor(ms / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

function formatPop(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`
  return String(n)
}

function bestKey(m: GameMode, d: Difficulty): string {
  return m === 'daily' ? 'geo_best_daily' : `geo_best_${m}_${d}`
}

function getGrade(s: number): GradeInfo {
  if (s >= 900) return { letter: 'S', bg: 'bg-yellow-400',  fg: 'text-yellow-900',  text: 'Outstanding!' }
  if (s >= 700) return { letter: 'A', bg: 'bg-emerald-400', fg: 'text-emerald-900', text: 'Great work!' }
  if (s >= 500) return { letter: 'B', bg: 'bg-sky-400',     fg: 'text-sky-900',     text: 'Good effort!' }
  if (s >= 300) return { letter: 'C', bg: 'bg-orange-400',  fg: 'text-orange-900',  text: 'Keep at it!' }
  return               { letter: 'D', bg: 'bg-zinc-500',    fg: 'text-zinc-100',    text: 'Keep learning!' }
}

// ── Root component ────────────────────────────────────────────────────────────

export default function GeographyGame() {
  // Setup
  const [mode,       setMode]       = useState<GameMode>('flags')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [qCount,     setQCount]     = useState<QuestionCount>(10)

  // Persistence
  const [streak,    setStreak]    = useState(0)
  const [dailyDone, setDailyDone] = useState(false)
  const [countdown, setCountdown] = useState<{ h: number; m: number; s: number } | null>(null)
  const [bests,     setBests]     = useState<Partial<Record<GameMode, number>>>({})

  // Game
  const [stage,        setStage]        = useState<Stage>('setup')
  const [questions,    setQuestions]    = useState<QuizQuestion[]>([])
  const [currentIdx,   setCurrentIdx]   = useState(0)
  const [selected,     setSelected]     = useState<string | null>(null)
  const [answered,     setAnswered]     = useState(false)
  const [score,        setScore]        = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [mapFeedback,  setMapFeedback]  = useState<string | null>(null)
  const [timeLeft,     setTimeLeft]     = useState(0)

  // Results metadata
  const [prevBest,      setPrevBest]      = useState<number | null>(null)
  const [isNewBest,     setIsNewBest]     = useState(false)
  const [resultStreak,  setResultStreak]  = useState(0)
  const [fastestFlag,   setFastestFlag]   = useState<number | null>(null)
  const [popBestStreak, setPopBestStreak] = useState(0)

  // UI
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [muted,        setMuted]        = useState(false)
  const containerRef   = useRef<HTMLDivElement>(null)
  const questionStart  = useRef(0)

  // Stat tracking refs
  const gameStartRef   = useRef(0)
  const fastestFlagRef = useRef(Infinity)
  const popStreakRef   = useRef({ current: 0, best: 0 })
  const audioCtxRef   = useRef<AudioContext | null>(null)

  // Timing refs — prevent stale closures in setInterval/setTimeout
  const answeredRef   = useRef(false)
  const currentIdxRef = useRef(0)
  const questionsRef  = useRef<QuizQuestion[]>([])

  // ── Load streak/daily on mount ─────────────────────────────────────────────
  useEffect(() => {
    setStreak(parseInt(localStorage.getItem('geo_streak') ?? '0', 10))
    setDailyDone(localStorage.getItem('geo_daily_date') === todayISO())
  }, [])

  // ── Load bests when difficulty changes ────────────────────────────────────
  useEffect(() => {
    const loaded: Partial<Record<GameMode, number>> = {}
    for (const m of ['flags', 'map', 'capitals', 'population', 'daily'] as GameMode[]) {
      const v = localStorage.getItem(bestKey(m, difficulty))
      if (v !== null) loaded[m] = parseInt(v, 10)
    }
    setBests(loaded)
  }, [difficulty])

  // ── Setup screen daily countdown ──────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'daily' || !dailyDone || stage !== 'setup') { setCountdown(null); return }
    setCountdown(getMidnightDiff())
    const id = setInterval(() => setCountdown(getMidnightDiff()), 1000)
    return () => clearInterval(id)
  }, [mode, dailyDone, stage])

  // ── Fullscreen tracking ────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // ── Question timer — single source of truth ──────────────────────────────
  // Deps intentionally omit handlers (use refs internally to avoid stale closures)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (stage !== 'playing') return
    answeredRef.current = false
    setTimeLeft(ANSWER_TIME_SECONDS)

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [currentIdx, stage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save results, fire confetti ───────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'results') return

    const timeSeconds = Math.round((Date.now() - gameStartRef.current) / 1000)

    // Personal best
    const key  = bestKey(mode, difficulty)
    const prev = parseInt(localStorage.getItem(key) ?? '0', 10)
    const isNew = score > prev && score > 0
    setPrevBest(prev > 0 ? prev : null)
    setIsNewBest(isNew)
    if (isNew) {
      localStorage.setItem(key, String(score))
      setBests(b => ({ ...b, [mode]: score }))
    }

    // Daily
    if (mode === 'daily') {
      const today    = todayISO()
      const lastDate = localStorage.getItem('geo_daily_date')
      const yest     = new Date()
      yest.setDate(yest.getDate() - 1)
      const yesterdayStr = yest.toISOString().slice(0, 10)

      const newStreak =
        lastDate === yesterdayStr ? parseInt(localStorage.getItem('geo_streak') ?? '0', 10) + 1 :
        lastDate === today        ? parseInt(localStorage.getItem('geo_streak') ?? '1', 10)     :
        1

      localStorage.setItem('geo_streak',    String(newStreak))
      localStorage.setItem('geo_daily_date', today)
      localStorage.setItem(`geo_daily_${today}`, JSON.stringify({
        score, correct: correctCount, total: questions.length, completed: true,
      }))
      setStreak(newStreak)
      setResultStreak(newStreak)
      setDailyDone(true)
    }

    // Mode stats
    setFastestFlag(fastestFlagRef.current < Infinity ? fastestFlagRef.current : null)
    setPopBestStreak(popStreakRef.current.best)

    // History
    const entry = {
      mode, difficulty, score,
      correct: correctCount,
      total:   questions.length,
      date:    new Date().toISOString(),
      timeSeconds,
    }
    const prevHistory: unknown[] = JSON.parse(localStorage.getItem('geo_history') ?? '[]')
    localStorage.setItem('geo_history', JSON.stringify([entry, ...prevHistory].slice(0, 20)))

    // Confetti
    const grade = getGrade(score)
    if (['S', 'A', 'B'].includes(grade.letter)) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: grade.letter === 'S' ? 200 : 120, spread: 70, origin: { y: 0.6 } })
        if (grade.letter === 'S') {
          setTimeout(() => confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0, y: 0.5 } }), 400)
          setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.5 } }), 800)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // ── Sound helpers ──────────────────────────────────────────────────────────

  function playBeep(freq: number, dur: number) {
    if (muted) return
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx  = audioCtxRef.current
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + dur / 1000)
    } catch {
      // AudioContext unavailable
    }
  }

  // ── Advance + timeout ─────────────────────────────────────────────────────

  function advanceQuestion() {
    setTimeout(() => {
      const next = currentIdxRef.current + 1
      if (next >= questionsRef.current.length) {
        setStage('results')
      } else {
        currentIdxRef.current = next
        answeredRef.current   = false
        setCurrentIdx(next)
        setSelected(null)
        setAnswered(false)
        setMapFeedback(null)
        questionStart.current = Date.now()
      }
    }, ADVANCE_DELAY_MS)
  }

  function handleTimeout() {
    if (answeredRef.current) return
    answeredRef.current = true
    const q = questionsRef.current[currentIdxRef.current]
    if (q?.mode === 'map') setMapFeedback('Time up! ⏱️')
    setAnswered(true)
    advanceQuestion()
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  function handleStart() {
    const qs = mode === 'daily' ? getDailyQuestions() : generateQuestions(mode, difficulty, qCount)
    answeredRef.current    = false
    currentIdxRef.current  = 0
    questionsRef.current   = qs
    gameStartRef.current   = Date.now()
    fastestFlagRef.current = Infinity
    popStreakRef.current   = { current: 0, best: 0 }
    questionStart.current  = Date.now()
    setQuestions(qs)
    setCurrentIdx(0)
    setScore(0)
    setCorrectCount(0)
    setSelected(null)
    setAnswered(false)
    setMapFeedback(null)
    setPrevBest(null)
    setIsNewBest(false)
    setResultStreak(0)
    setFastestFlag(null)
    setPopBestStreak(0)
    setStage('playing')
  }

  function handleAnswer(display: string) {
    if (answeredRef.current) return
    answeredRef.current = true
    const q       = questions[currentIdx]
    const correct = display === q.correctAnswer
    const elapsed = (Date.now() - questionStart.current) / 1000
    const pts     = correct ? (elapsed <= 3 ? 150 : 100) : 0

    if (correct) {
      playBeep(440, 150)
      if (q.mode === 'flags' && elapsed < fastestFlagRef.current) fastestFlagRef.current = elapsed
      if (q.mode === 'population') {
        popStreakRef.current.current++
        if (popStreakRef.current.current > popStreakRef.current.best)
          popStreakRef.current.best = popStreakRef.current.current
      }
    } else {
      playBeep(220, 150)
      if (q.mode === 'population') popStreakRef.current.current = 0
    }

    setScore(s  => s + pts)
    if (correct) setCorrectCount(c => c + 1)
    setSelected(display)
    setAnswered(true)
    advanceQuestion()
  }

  function handleMapAnswer(continent: string) {
    if (answeredRef.current) return
    answeredRef.current = true
    const q       = questions[currentIdx]
    const correct = continent === q.correctAnswer
    const elapsed = (Date.now() - questionStart.current) / 1000
    const pts     = correct ? (elapsed <= 3 ? 150 : 100) : 0

    if (correct) {
      playBeep(440, 150)
      setMapFeedback('Correct! 🎯')
    } else {
      playBeep(220, 150)
      setMapFeedback(`It's in ${q.country.continent}!`)
    }

    setScore(s => s + pts)
    if (correct) setCorrectCount(c => c + 1)
    setSelected(continent)
    setAnswered(true)
    advanceQuestion()
  }

  function handleRestart() {
    answeredRef.current   = false
    currentIdxRef.current = 0
    questionsRef.current  = []
    setStage('setup')
    setQuestions([])
    setCurrentIdx(0)
    setSelected(null)
    setAnswered(false)
    setMapFeedback(null)
    setTimeLeft(0)
  }

  function handlePlayAgain() {
    const qs = generateQuestions(mode, difficulty, qCount)
    answeredRef.current    = false
    currentIdxRef.current  = 0
    questionsRef.current   = qs
    gameStartRef.current   = Date.now()
    fastestFlagRef.current = Infinity
    popStreakRef.current   = { current: 0, best: 0 }
    questionStart.current  = Date.now()
    setQuestions(qs)
    setCurrentIdx(0)
    setScore(0)
    setCorrectCount(0)
    setSelected(null)
    setAnswered(false)
    setMapFeedback(null)
    setTimeLeft(0)
    setPrevBest(null)
    setIsNewBest(false)
    setResultStreak(0)
    setFastestFlag(null)
    setPopBestStreak(0)
    setStage('playing')
  }

  function handleShare() {
    const canvas = document.createElement('canvas')
    canvas.width  = 600
    canvas.height = 300
    const ctx   = canvas.getContext('2d')!
    const grade = getGrade(score)
    const meta  = MODE_META[mode]
    const pct   = Math.round((correctCount / (questions.length || 1)) * 100)

    const grad = ctx.createLinearGradient(0, 0, 600, 300)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#0d2a47')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 600, 300)

    ctx.fillStyle = '#14b8a6'
    ctx.fillRect(0, 0, 600, 4)

    ctx.fillStyle = '#475569'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('ANTBREAK GEOGRAPHY CHALLENGE', 30, 24)

    const diffLabel = mode === 'daily' ? 'Daily Challenge' : `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`
    ctx.fillStyle = '#94a3b8'
    ctx.font = '17px sans-serif'
    ctx.fillText(`${meta.name}  ·  ${diffLabel}`, 30, 48)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 88px sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(String(score), 30, 200)
    const scoreW = ctx.measureText(String(score)).width

    ctx.fillStyle = '#475569'
    ctx.font = '22px sans-serif'
    ctx.fillText('/1000', 34 + scoreW, 196)

    ctx.textBaseline = 'top'
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#34d399'
    ctx.fillText(`✓ ${correctCount}/${questions.length} correct`, 30, 218)
    ctx.fillStyle = '#14b8a6'
    ctx.fillText(`${pct}% accuracy`, 30, 244)

    ctx.fillStyle = GRADE_CANVAS_COLOR[grade.letter]
    ctx.beginPath()
    ctx.arc(530, 155, 52, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = grade.letter === 'D' ? '#f8fafc' : '#0f172a'
    ctx.font = 'bold 54px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(grade.letter, 530, 159)

    ctx.fillStyle = '#334155'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('antbreak.com', 572, 288)

    const link = document.createElement('a')
    link.download = `antbreak-geo-${mode}-${score}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-background px-3 py-3 sm:px-6 sm:py-4">
      <div
        ref={containerRef}
        id="original-game-card"
        className="relative w-full rounded-2xl bg-slate-800 p-4 dark:bg-slate-900"
        style={{ boxShadow: '0 0 0 1px rgba(20,184,166,0.4), 0 25px 50px rgba(0,0,0,0.5)' }}
      >
        {/* Header controls */}
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            onClick={() => setMuted(m => !m)}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-slate-200"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="rounded-lg p-1.5 text-teal-400 transition-colors hover:text-teal-300"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2 border-b border-teal-800 pb-3">
          <Globe className="h-5 w-5 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">Geography Challenge</h1>
        </div>

        {stage === 'setup' && (
          <SetupScreen
            mode={mode}
            difficulty={difficulty}
            qCount={qCount}
            streak={streak}
            dailyDone={dailyDone}
            countdown={countdown}
            bests={bests}
            onMode={setMode}
            onDiff={setDifficulty}
            onCount={setQCount}
            onStart={handleStart}
          />
        )}

        {stage === 'playing' && questions.length > 0 && (
          <PlayingScreen
            question={questions[currentIdx]}
            currentIdx={currentIdx}
            total={questions.length}
            score={score}
            selected={selected}
            answered={answered}
            selectedMode={mode}
            mapFeedback={mapFeedback}
            timeLeft={timeLeft}
            maxTime={ANSWER_TIME_SECONDS}
            onAnswer={handleAnswer}
            onMapAnswer={handleMapAnswer}
          />
        )}

        {stage === 'results' && (
          <ResultsScreen
            score={score}
            correct={correctCount}
            total={questions.length}
            mode={mode}
            difficulty={difficulty}
            prevBest={prevBest}
            isNewBest={isNewBest}
            resultStreak={resultStreak}
            fastestFlag={fastestFlag}
            popBestStreak={popBestStreak}
            dailyDone={dailyDone}
            onRestart={handleRestart}
            onPlayAgain={handlePlayAgain}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  )
}

// ── Setup Screen ──────────────────────────────────────────────────────────────

interface SetupProps {
  mode:       GameMode
  difficulty: Difficulty
  qCount:     QuestionCount
  streak:     number
  dailyDone:  boolean
  countdown:  { h: number; m: number; s: number } | null
  bests:      Partial<Record<GameMode, number>>
  onMode:     (m: GameMode) => void
  onDiff:     (d: Difficulty) => void
  onCount:    (n: QuestionCount) => void
  onStart:    () => void
}

function SetupScreen({
  mode, difficulty, qCount, streak, dailyDone,
  countdown, bests, onMode, onDiff, onCount, onStart,
}: SetupProps) {
  const regularModes = MODES.filter(m => !m.fullWidth)
  const dailyMode    = MODES.find(m => m.fullWidth)!

  const SL     = 'mb-4 text-center text-sm font-semibold uppercase tracking-widest text-teal-300'
  const CB     = 'w-full rounded-xl p-4 text-left transition-all'
  const CSEL   = 'border-2 border-teal-400 bg-teal-900 shadow-lg shadow-teal-500/20'
  const CUNSEL = 'border border-slate-600 bg-slate-700 hover:border-teal-500'

  return (
    <div className="space-y-8">

      {streak > 0 && (
        <p className="text-center text-sm text-amber-400">🔥 {streak} day streak</p>
      )}

      <section>
        <p className={SL}>Choose Mode</p>
        <div className="grid grid-cols-2 gap-3">
          {regularModes.map(m => (
            <button key={m.id} type="button" onClick={() => onMode(m.id)}
              className={[CB, mode === m.id ? CSEL : CUNSEL].join(' ')}>
              <span className="mb-2 block text-2xl">{m.emoji}</span>
              <p className="font-semibold text-white">{m.name}</p>
              <p className="text-xs text-slate-400">{m.desc}</p>
              {bests[m.id] !== undefined && bests[m.id]! > 0 && (
                <p className="mt-1.5 text-xs text-teal-400">Best: {bests[m.id]} pts</p>
              )}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <button type="button" onClick={() => onMode(dailyMode.id)}
            className={[CB, mode === dailyMode.id ? CSEL : CUNSEL].join(' ')}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{dailyMode.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-white">{dailyMode.name}</p>
                <p className="text-xs text-slate-400 mb-1">{dailyMode.desc}</p>
                <p className="text-xs text-slate-500">Today: {formatToday()}</p>
                {dailyDone ? (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs text-teal-400">✓ Completed today!</p>
                    {countdown && (
                      <p className="text-xs text-slate-400">
                        Next in{' '}
                        <span className="font-mono font-semibold text-white">
                          {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
                        </span>
                      </p>
                    )}
                  </div>
                ) : bests[dailyMode.id] !== undefined && bests[dailyMode.id]! > 0 ? (
                  <p className="mt-1.5 text-xs text-teal-400">Best: {bests[dailyMode.id]} pts</p>
                ) : null}
              </div>
            </div>
          </button>
        </div>
      </section>

      {mode !== 'daily' && (
        <section>
          <p className={SL}>Choose Difficulty</p>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(DIFF_CFG) as Difficulty[]).map(key => {
              const cfg = DIFF_CFG[key]
              const sel = difficulty === key
              return (
                <button key={key} type="button" onClick={() => onDiff(key)}
                  className={[
                    'flex flex-col items-center rounded-xl border p-3 text-center transition-all',
                    sel ? `${cfg.selCls} shadow-lg` : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500',
                  ].join(' ')}>
                  <span className="mb-1 text-xl">{cfg.icon}</span>
                  <span className="text-sm font-semibold leading-tight">{cfg.label}</span>
                  <span className={`mt-0.5 text-xs ${sel ? 'text-white/75' : 'text-slate-400'}`}>{cfg.desc}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {mode !== 'daily' && (
        <section>
          <p className={SL}>Questions</p>
          <div className="flex justify-center gap-2">
            {COUNTS.map(n => (
              <button key={n} type="button" onClick={() => onCount(n)}
                className={[
                  'rounded-full px-5 py-1.5 text-sm font-medium transition-colors',
                  qCount === n ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200',
                ].join(' ')}>
                {n}
              </button>
            ))}
          </div>
        </section>
      )}

      <div>
        <button type="button" onClick={onStart}
          disabled={mode === 'daily' && dailyDone}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-4 text-lg font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-500 hover:to-cyan-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
          ▶ Start Challenge
        </button>
      </div>

    </div>
  )
}

// ── Timer Bar ─────────────────────────────────────────────────────────────────

function TimerBar({ timeLeft, maxTime }: { timeLeft: number; maxTime: number }) {
  const [animated, setAnimated] = useState(false)

  // On mount (each new question via key={currentIdx}): snap to full, then
  // enable smooth drain after 50 ms so the reset is instant.
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(t)
  }, [])

  const pct      = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0
  const barColor = timeLeft > 6 ? 'bg-green-500' : timeLeft > 3 ? 'bg-yellow-500' : 'bg-rose-500'

  return (
    <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
      <div
        className={`h-full rounded-full ${barColor}`}
        style={{
          width: `${pct}%`,
          transition: animated ? 'width 1s linear' : 'none',
        }}
      />
    </div>
  )
}

// ── Playing Screen ────────────────────────────────────────────────────────────

interface PlayingProps {
  question:     QuizQuestion
  currentIdx:   number
  total:        number
  score:        number
  selected:     string | null
  answered:     boolean
  selectedMode: GameMode
  mapFeedback:  string | null
  timeLeft:     number
  maxTime:      number
  onAnswer:     (display: string) => void
  onMapAnswer:  (continent: string) => void
}

function PlayingScreen({
  question, currentIdx, total, score, selected, answered, selectedMode,
  mapFeedback, timeLeft, maxTime, onAnswer, onMapAnswer,
}: PlayingProps) {
  const qMode = question.mode
  const meta  = MODE_META[selectedMode]
  const pct   = (currentIdx / total) * 100

  return (
    <div>
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span className="text-teal-300">{currentIdx + 1} / {total}</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span>{meta.emoji}</span>
          <span>{meta.name}</span>
          {selectedMode === 'daily' && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">Daily</span>
          )}
        </span>
        <span className="text-teal-300">Score: {score}</span>
      </div>

      {/* Question progress bar */}
      <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Timer bar — key forces remount on each question so the bar snaps to full */}
      <TimerBar key={currentIdx} timeLeft={timeLeft} maxTime={maxTime} />

      {/* Question content — fade-in on each new question */}
      <div key={currentIdx} className="geo-question-enter">

        {/* Flag Master */}
        {qMode === 'flags' && (
          <>
            <div className="mb-6 rounded-xl bg-slate-700/50 p-6 text-center">
              <img
                src={`https://flagcdn.com/w160/${question.country.code.toLowerCase()}.png`}
                alt={`Flag of ${question.country.name}`}
                className="mx-auto mb-4 rounded-md border border-slate-600 shadow-lg"
                style={{ width: 192, maxHeight: 120, objectFit: 'contain' }}
              />
              <p className="text-lg text-white">{question.questionText}</p>
            </div>
            <AnswerGrid
              options={question.options!}
              qMode={qMode}
              correctAnswer={question.correctAnswer}
              selected={selected}
              answered={answered}
              onAnswer={onAnswer}
            />
            {answered && <FunFact text={question.country.funFact} />}
          </>
        )}

        {/* Capital Cities */}
        {qMode === 'capitals' && (
          <>
            <div className="mb-6 rounded-xl bg-slate-700/50 p-6 text-center">
              <p className="mb-2 text-3xl font-bold text-white">{question.country.name}</p>
              <p className="text-lg text-slate-300">{question.questionText}</p>
            </div>
            <AnswerGrid
              options={question.options!}
              qMode={qMode}
              correctAnswer={question.correctAnswer}
              selected={selected}
              answered={answered}
              onAnswer={onAnswer}
            />
            {answered && <FunFact text={question.country.funFact} />}
          </>
        )}

        {/* Population Duel */}
        {qMode === 'population' && (
          <>
            <p className="mb-6 text-center text-xl font-semibold text-white">{question.questionText}</p>
            <PopulationDuelCards
              options={question.options!}
              correctAnswer={question.correctAnswer}
              selected={selected}
              answered={answered}
              onAnswer={onAnswer}
            />
            {answered && <FunFact text={question.country.funFact} />}
          </>
        )}

        {/* Map Tap — continent selection */}
        {qMode === 'map' && (
          <ContinentSelectScreen
            question={question}
            answered={answered}
            selected={selected}
            feedback={mapFeedback}
            onAnswer={onMapAnswer}
          />
        )}

      </div>
    </div>
  )
}

// ── Answer Grid ───────────────────────────────────────────────────────────────

interface AnswerGridProps {
  options:       Country[]
  qMode:         GameMode
  correctAnswer: string
  selected:      string | null
  answered:      boolean
  onAnswer:      (display: string) => void
}

function AnswerGrid({ options, qMode, correctAnswer, selected, answered, onAnswer }: AnswerGridProps) {
  const cols = options.length === 2 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${cols} gap-3`}>
      {options.map((opt, i) => {
        const display    = getOptionDisplay(opt, qMode)
        const isCorrect  = display === correctAnswer
        const isSelected = selected === display

        let cls    = 'w-full cursor-pointer rounded-xl border px-4 py-4 text-center text-lg font-medium transition-all'
        let suffix = ''

        if (!answered) {
          cls += ' border-slate-600 bg-slate-700 text-white hover:border-teal-500 hover:bg-slate-600'
        } else if (isCorrect) {
          cls    += ' border-emerald-500 bg-emerald-700 text-white'
          suffix  = ' ✓'
        } else if (isSelected) {
          cls    += ' border-rose-600 bg-rose-900 text-rose-300'
          suffix  = ' ✗'
        } else {
          cls += ' border-slate-700 bg-slate-800 text-slate-500'
        }

        return (
          <button key={i} type="button" disabled={answered} onClick={() => onAnswer(display)} className={cls}>
            {display}{suffix}
          </button>
        )
      })}
    </div>
  )
}

// ── Population Duel Cards ─────────────────────────────────────────────────────

interface PopulationDuelProps {
  options:       Country[]
  correctAnswer: string
  selected:      string | null
  answered:      boolean
  onAnswer:      (name: string) => void
}

function PopulationDuelCards({ options, correctAnswer, selected, answered, onAnswer }: PopulationDuelProps) {
  const diff = Math.abs(options[0].population - options[1].population)

  return (
    <div>
      {/* Stack on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {options.map(country => {
          const isCorrect  = country.name === correctAnswer
          const isSelected = selected === country.name

          let cardCls = 'flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all'
          if (!answered) {
            cardCls += ' border-slate-600 bg-slate-700 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20'
          } else if (isCorrect) {
            cardCls += ' border-emerald-400 bg-emerald-900/30 shadow-lg shadow-emerald-500/20'
          } else {
            cardCls += ` border-rose-400 bg-rose-900/30 ${isSelected ? '' : 'opacity-60'}`
          }

          return (
            <button
              key={country.code}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(country.name)}
              className={cardCls}
            >
              <img
                src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                alt={`Flag of ${country.name}`}
                className="mx-auto rounded border border-slate-600 shadow"
                style={{ height: 48, maxWidth: 80, objectFit: 'contain' }}
              />
              <p className="text-xl font-bold leading-tight text-white">{country.name}</p>
              {answered ? (
                <p className={`font-mono text-lg font-bold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {formatPop(country.population)}
                </p>
              ) : (
                <p className="text-3xl font-bold text-slate-500">???</p>
              )}
              {answered && isCorrect && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300">✓ Larger</span>
              )}
            </button>
          )
        })}
      </div>

      {answered && (
        <p className="mt-4 text-center text-sm text-slate-300">
          <span className="font-semibold text-white">{correctAnswer}</span> has{' '}
          <span className="font-semibold text-teal-300">{formatPop(diff)}</span> more people
        </p>
      )}
    </div>
  )
}

// ── Continent Select Screen (replaces Map Tap) ────────────────────────────────

const ALL_CONTINENTS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']

interface ContinentProps {
  question: QuizQuestion
  answered: boolean
  selected: string | null
  feedback: string | null
  onAnswer: (continent: string) => void
}

function ContinentSelectScreen({ question, answered, selected, feedback, onAnswer }: ContinentProps) {
  return (
    <div>
      <p className="mb-3 text-center text-2xl font-bold text-white">{question.questionText}</p>
      <div className="mb-4 flex justify-center">
        <img
          src={`https://flagcdn.com/w80/${question.country.code.toLowerCase()}.png`}
          alt={`Flag of ${question.country.name}`}
          className="rounded border border-slate-600 shadow"
          style={{ height: 48, objectFit: 'contain' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ALL_CONTINENTS.map(continent => {
          const isCorrect  = continent === question.correctAnswer
          const isSelected = selected === continent
          let cls = 'rounded-xl border px-3 py-3 text-sm font-medium text-center transition-all'
          if (!answered) {
            cls += ' border-slate-600 bg-slate-700 text-white hover:border-teal-500 hover:bg-slate-600 cursor-pointer'
          } else if (isCorrect) {
            cls += ' border-emerald-500 bg-emerald-700 text-white'
          } else if (isSelected && !isCorrect) {
            cls += ' border-rose-600 bg-rose-900 text-rose-300'
          } else {
            cls += ' border-slate-700 bg-slate-800 text-slate-500'
          }
          return (
            <button key={continent} type="button" disabled={answered} onClick={() => onAnswer(continent)} className={cls}>
              {continent}
              {answered && isCorrect && ' ✓'}
              {answered && isSelected && !isCorrect && ' ✗'}
            </button>
          )
        })}
      </div>
      {answered && feedback && (
        <p className="mt-3 text-center text-sm font-semibold text-white">{feedback}</p>
      )}
      {answered && (
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-300">
          <img
            src={`https://flagcdn.com/w40/${question.country.code.toLowerCase()}.png`}
            alt=""
            className="rounded"
            style={{ height: 20, objectFit: 'contain' }}
          />
          <span>
            <span className="font-semibold text-white">{question.country.name}</span>
            {' — '}{question.country.region}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Fun Fact ──────────────────────────────────────────────────────────────────

function FunFact({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg bg-slate-800 p-3 text-center">
      <p className="text-sm text-slate-300">📍 {text}</p>
    </div>
  )
}

// ── Results Screen ────────────────────────────────────────────────────────────

interface ResultsProps {
  score:         number
  correct:       number
  total:         number
  mode:          GameMode
  difficulty:    Difficulty
  prevBest:      number | null
  isNewBest:     boolean
  resultStreak:  number
  fastestFlag:   number | null
  popBestStreak: number
  dailyDone:     boolean
  onRestart:     () => void
  onPlayAgain:   () => void
  onShare:       () => void
}

function ResultsScreen({
  score, correct, total, mode, difficulty, prevBest, isNewBest,
  resultStreak, fastestFlag, popBestStreak, dailyDone,
  onRestart, onPlayAgain, onShare,
}: ResultsProps) {
  const pct   = Math.round((correct / total) * 100)
  const grade = getGrade(score)
  const meta  = MODE_META[mode]

  const [cd, setCd] = useState<{ h: number; m: number; s: number } | null>(
    mode === 'daily' ? getMidnightDiff() : null
  )
  useEffect(() => {
    if (mode !== 'daily') return
    const id = setInterval(() => setCd(getMidnightDiff()), 1000)
    return () => clearInterval(id)
  }, [mode])

  return (
    <div className="space-y-5">

      {/* Score + Grade */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-7xl font-bold text-white tabular-nums leading-none">{score}</span>
            <span className="text-xl text-slate-400">/1000</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{meta.emoji} {meta.name}</p>
          {mode !== 'daily' && (
            <p className="text-xs text-slate-500 capitalize">{difficulty} difficulty</p>
          )}
        </div>
        <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-4xl font-bold ${grade.bg} ${grade.fg}`}>
          {grade.letter}
        </div>
      </div>

      <p className="text-lg font-semibold text-white">{grade.text}</p>

      {/* Stats */}
      <div className="flex gap-6 rounded-xl bg-slate-700/40 px-4 py-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{correct}</p>
          <p className="text-xs text-slate-400">correct</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-rose-400">{total - correct}</p>
          <p className="text-xs text-slate-400">wrong</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-teal-300">{pct}%</p>
          <p className="text-xs text-slate-400">accuracy</p>
        </div>
      </div>

      {/* Mode-specific stats */}
      {mode === 'flags' && fastestFlag !== null && (
        <p className="text-sm text-slate-300">
          Fastest answer: <span className="font-semibold text-white">{fastestFlag.toFixed(1)}s</span>
        </p>
      )}
      {mode === 'population' && popBestStreak > 1 && (
        <p className="text-sm text-slate-300">
          Best streak: <span className="font-semibold text-white">{popBestStreak} in a row</span>
        </p>
      )}

      {/* Personal best */}
      <div className="rounded-xl border border-slate-700 bg-slate-700/30 px-4 py-3">
        {isNewBest ? (
          <p className="font-semibold text-yellow-400">🏆 New Personal Best!</p>
        ) : prevBest !== null ? (
          <p className="text-sm text-slate-400">
            Personal best: <span className="font-semibold text-white">{prevBest} pts</span>
          </p>
        ) : (
          <p className="text-sm text-slate-400">First time playing this mode!</p>
        )}
      </div>

      {/* Daily streak */}
      {mode === 'daily' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
          {resultStreak > 0 && (
            <p className="text-lg font-bold text-amber-400">🔥 {resultStreak} day streak!</p>
          )}
          {cd && (
            <p className="mt-1 text-xs text-slate-400">
              Next challenge in{' '}
              <span className="font-mono font-semibold text-white">
                {pad(cd.h)}:{pad(cd.m)}:{pad(cd.s)}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Share */}
      <button type="button" onClick={onShare}
        className="w-full rounded-xl border border-slate-600 bg-slate-700 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600">
        📤 Share Result
      </button>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onPlayAgain}
          disabled={mode === 'daily' && dailyDone}
          className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3 font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-500 hover:to-cyan-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
          ▶ Play Again
        </button>
        <button type="button" onClick={onRestart}
          className="flex-1 rounded-xl border border-slate-600 bg-slate-700 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-600">
          ← Change Mode
        </button>
      </div>

    </div>
  )
}
