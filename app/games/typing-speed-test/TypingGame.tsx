'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Download, Keyboard, Maximize2, Minimize2, RotateCcw, Trophy } from 'lucide-react'
import { generateText } from '@/data/typingContent'
import type { Difficulty } from '@/data/typingContent'

// ── Types ─────────────────────────────────────────────────────────────────────

type Duration = 30 | 60 | 120
type Stage    = 'setup' | 'playing' | 'finished'

interface Grade {
  letter:      string
  label:       string
  bg:          string
  color:       string
  canvasColor: string
}

interface Result {
  wpm:         number
  accuracy:    number
  errors:      number
  wordsTyped:  number
  grade:       Grade
  isPersonalBest: boolean
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function getGrade(wpm: number): Grade {
  if (wpm >= 100) return { letter: 'S', label: 'Exceptional', bg: 'bg-yellow-400',  color: 'text-yellow-900', canvasColor: '#F59E0B' }
  if (wpm >= 80)  return { letter: 'A', label: 'Advanced',    bg: 'bg-green-500',   color: 'text-white',      canvasColor: '#10B981' }
  if (wpm >= 60)  return { letter: 'B', label: 'Proficient',  bg: 'bg-blue-500',    color: 'text-white',      canvasColor: '#3B82F6' }
  if (wpm >= 40)  return { letter: 'C', label: 'Average',     bg: 'bg-orange-500',  color: 'text-white',      canvasColor: '#F97316' }
  return           { letter: 'D', label: 'Developing', bg: 'bg-zinc-400',    color: 'text-white',      canvasColor: '#6B7280' }
}

function loadBest(difficulty: Difficulty): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(`typing_best_${difficulty}`) ?? '0', 10)
}

function saveBest(difficulty: Difficulty, wpm: number) {
  localStorage.setItem(`typing_best_${difficulty}`, String(wpm))
}

function downloadBadge(wpm: number, accuracy: number, grade: Grade) {
  const canvas = document.createElement('canvas')
  canvas.width = 600; canvas.height = 300
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const grad = ctx.createLinearGradient(0, 0, 600, 300)
  grad.addColorStop(0, '#7C3AED')
  grad.addColorStop(1, '#4C1D95')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 300)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = '600 13px Arial, sans-serif'
  ctx.fillText('ANTBREAK TYPING TEST', 300, 46)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 88px Arial, sans-serif'
  ctx.fillText(String(wpm), 300, 155)

  ctx.fillStyle = 'rgba(255,255,255,0.70)'
  ctx.font = '500 15px Arial, sans-serif'
  ctx.fillText('WORDS PER MINUTE', 300, 183)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '400 13px Arial, sans-serif'
  ctx.fillText(`Accuracy: ${accuracy}%`, 300, 208)

  ctx.beginPath()
  ctx.arc(300, 242, 22, 0, Math.PI * 2)
  ctx.fillStyle = grade.canvasColor
  ctx.fill()
  ctx.fillStyle = grade.letter === 'S' ? '#78350F' : '#ffffff'
  ctx.font = 'bold 18px Arial, sans-serif'
  ctx.fillText(grade.letter, 300, 249)

  ctx.fillStyle = 'rgba(255,255,255,0.40)'
  ctx.font = '400 12px Arial, sans-serif'
  ctx.fillText('antbreak.com', 300, 284)

  const link = document.createElement('a')
  link.download = `antbreak-wpm-${wpm}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function triggerConfetti(): () => void {
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const colors = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F472B6', '#FB7185']

  const particles = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * 300,
    w: 4 + Math.random() * 8,
    h: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vy: 2.5 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 2.5,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
  }))

  const endTime = Date.now() + 3000
  let animId: number

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const remaining = endTime - Date.now()

    for (const p of particles) {
      p.y += p.vy; p.x += p.vx; p.rotation += p.rotSpeed
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.globalAlpha = remaining < 1000 ? Math.max(0, remaining / 1000) : 1
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }

    if (remaining > 0) { animId = requestAnimationFrame(frame) }
    else { if (canvas.parentNode) canvas.remove() }
  }
  animId = requestAnimationFrame(frame)

  return () => { cancelAnimationFrame(animId); if (canvas.parentNode) canvas.remove() }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TypingGame() {
  const [stage,        setStage]        = useState<Stage>('setup')
  const [difficulty,   setDifficulty]   = useState<Difficulty>('medium')
  const [duration,     setDuration]     = useState<Duration>(30)
  const [text,         setText]         = useState('')
  const [typed,        setTyped]        = useState('')
  const [timeLeft,     setTimeLeft]     = useState(30)
  const [startTime,    setStartTime]    = useState<number | null>(null)
  const [personalBest, setPersonalBest] = useState(0)
  const [result,       setResult]       = useState<Result | null>(null)
  const [showNewBest,  setShowNewBest]  = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const latest = useRef({
    typed:      '',
    text:       '',
    startTime:  null as number | null,
    difficulty: 'medium' as Difficulty,
    finished:   false,
  })
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const currentCharRef = useRef<HTMLSpanElement>(null)
  const containerRef   = useRef<HTMLDivElement>(null)
  const confettiClean  = useRef<(() => void) | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────

  const charStatus = useMemo(() =>
    text.split('').map((char, i): 'correct' | 'wrong' | 'current' | 'upcoming' => {
      if (i < typed.length) return typed[i] === char ? 'correct' : 'wrong'
      if (i === typed.length) return 'current'
      return 'upcoming'
    }),
    [text, typed],
  )

  // timeLeft in deps forces recalc every second even without keystrokes
  const liveStats = useMemo(() => {
    if (!startTime || typed.length === 0) return { wpm: 0, accuracy: 100 }
    const elapsed      = (Date.now() - startTime) / 1000 / 60
    const correctChars = typed.split('').filter((c, i) => c === text[i]).length
    const wpm          = Math.max(0, Math.round((correctChars / 5) / Math.max(elapsed, 0.001)))
    const accuracy     = Math.round((correctChars / typed.length) * 100)
    return { wpm, accuracy }
  }, [typed, text, startTime, timeLeft])

  const progressPct = startTime ? (timeLeft / duration) * 100 : 100

  // ── endGame ────────────────────────────────────────────────────────────────

  const endGame = useCallback(() => {
    if (latest.current.finished) return
    latest.current.finished = true

    const { typed: t, text: tx, startTime: st, difficulty: diff } = latest.current
    const elapsed        = st ? (Date.now() - st) / 1000 / 60 : 0.001
    const correctChars   = t.split('').filter((c, i) => c === tx[i]).length
    const wpm            = Math.round((correctChars / 5) / Math.max(elapsed, 0.001))
    const acc            = t.length > 0 ? Math.round((correctChars / t.length) * 100) : 100
    const errors         = t.split('').filter((c, i) => c !== tx[i]).length
    const wordsTyped     = Math.round(correctChars / 5)
    const grade          = getGrade(wpm)
    const prevBest       = loadBest(diff)
    const isPersonalBest = wpm > prevBest

    if (isPersonalBest) { saveBest(diff, wpm); setPersonalBest(wpm) }

    setResult({ wpm, accuracy: acc, errors, wordsTyped, grade, isPersonalBest })
    setShowNewBest(isPersonalBest)
    setStage('finished')

    if (wpm >= 40) confettiClean.current = triggerConfetti()
  }, [])

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    setPersonalBest(loadBest(difficulty))
  }, [difficulty])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Cleanup confetti if component unmounts mid-animation
  useEffect(() => () => { confettiClean.current?.() }, [])

  // Focus textarea when playing begins
  useEffect(() => {
    if (stage !== 'playing') return
    const t = setTimeout(() => textareaRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [stage])

  // Countdown timer — only ticks after user's first keystroke sets startTime
  useEffect(() => {
    if (!startTime || stage !== 'playing') return
    const interval = setInterval(() => setTimeLeft(prev => Math.max(prev - 1, 0)), 1000)
    return () => clearInterval(interval)
  }, [startTime, stage])

  // Detect expiry
  useEffect(() => {
    if (stage === 'playing' && timeLeft === 0) endGame()
  }, [timeLeft, stage, endGame]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll current char into view
  useEffect(() => {
    currentCharRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [typed.length])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function startGame(diff: Difficulty, dur: Duration) {
    const newText = generateText(diff)
    latest.current = { typed: '', text: newText, startTime: null, difficulty: diff, finished: false }
    setText(newText)
    setTyped('')
    setTimeLeft(dur)
    setStartTime(null)
    setResult(null)
    setShowNewBest(false)
    confettiClean.current?.()
    confettiClean.current = null
    setStage('playing')
  }

  function handleTyping(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (stage !== 'playing') return
    const value = e.target.value.slice(0, latest.current.text.length)

    if (!latest.current.startTime && value.length > 0) {
      const now = Date.now()
      latest.current.startTime = now
      setStartTime(now)
    }

    latest.current.typed = value
    setTyped(value)
    if (value.length >= latest.current.text.length) endGame()
  }

  function toggleFullscreen() {
    if (isFullscreen) {
      document.exitFullscreen().catch(() => {})
    } else {
      ;(containerRef.current ?? document.documentElement).requestFullscreen().catch(() => {})
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-10">
      <div
        ref={containerRef}
        className="relative mx-auto max-w-[800px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-700 dark:bg-zinc-900 sm:p-8"
      >
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          {isFullscreen
            ? <Minimize2 className="h-4 w-4" />
            : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Title */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Keyboard className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Typing Speed Test
          </h1>
        </div>

        {/* ────────────── STAGE 1: SETUP ────────────────────────────────── */}
        {stage === 'setup' && (
          <div className="mx-auto max-w-md">
            <p className="mb-2.5 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Choose Difficulty
            </p>
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { id: 'easy',   label: 'Easy' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'hard',   label: 'Hard' },
                  { id: 'expert', label: 'Expert' },
                ] as { id: Difficulty; label: string }[]
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setDifficulty(id)}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    difficulty === id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mb-2.5 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Choose Duration
            </p>
            <div className="mb-6 grid grid-cols-3 gap-2">
              {([30, 60, 120] as Duration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    duration === d
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            {personalBest > 0 && (
              <p className="mb-5 flex items-center justify-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Your best:{' '}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {personalBest} WPM
                </span>{' '}
                on {difficulty}
              </p>
            )}

            <button
              onClick={() => startGame(difficulty, duration)}
              className="w-full rounded-xl bg-violet-600 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98]"
            >
              Start Game
            </button>
          </div>
        )}

        {/* ────────────── STAGE 2: PLAYING ─────────────────────────────── */}
        {stage === 'playing' && (
          <div>
            {/* Live stats */}
            <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard label="WPM"       value={liveStats.wpm}           bg="bg-blue-500" />
              <StatCard label="Accuracy"  value={`${liveStats.accuracy}%`} bg="bg-green-500" />
              <StatCard
                label="Time Left"
                value={`${timeLeft}s`}
                bg={timeLeft <= 10 ? 'bg-red-500' : 'bg-orange-500'}
              />
            </div>

            {/* Progress bar — full until user starts typing, then drains */}
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-violet-600 transition-all duration-1000 ease-linear dark:bg-violet-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Reference text */}
            <div className="mb-3 max-h-48 overflow-y-auto rounded-xl border border-violet-200 bg-violet-50 p-4 font-mono text-base leading-relaxed select-none dark:border-violet-800 dark:bg-violet-950/60 sm:text-lg">
              {text.split('').map((char, i) => {
                const status = charStatus[i]
                return (
                  <span
                    key={i}
                    ref={status === 'current' ? currentCharRef : undefined}
                    className={
                      status === 'correct' ? 'text-green-500' :
                      status === 'wrong'   ? 'text-red-500' :
                      status === 'current' ? 'rounded-sm bg-violet-300 text-violet-900 dark:bg-violet-700 dark:text-violet-100' :
                                            'text-zinc-400 dark:text-zinc-500'
                    }
                  >
                    {char === ' ' && status === 'wrong' ? '·' : char}
                  </span>
                )
              })}
            </div>

            {/* Typing input */}
            <textarea
              ref={textareaRef}
              value={typed}
              onChange={handleTyping}
              disabled={stage !== 'playing'}
              rows={3}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              placeholder="Type here — timer starts on your first keystroke…"
              className="w-full resize-none rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 font-mono text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-violet-400 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-violet-500 sm:text-lg"
            />

            <div className="mt-2 flex justify-end">
              <button
                onClick={endGame}
                className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-600 hover:underline dark:hover:text-zinc-300"
              >
                End test early
              </button>
            </div>
          </div>
        )}

        {/* ──────────────── STAGE 4: RESULTS ───────────────────────────── */}
        {stage === 'finished' && result && (
          <ResultsScreen
            result={result}
            showNewBest={showNewBest}
            personalBest={personalBest}
            difficulty={difficulty}
            onPlayAgain={() => startGame(difficulty, duration)}
            onTryDifferentMode={() => { confettiClean.current?.(); confettiClean.current = null; setStage('setup') }}
            onDownloadBadge={() => downloadBadge(result.wpm, result.accuracy, result.grade)}
          />
        )}
      </div>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  bg,
}: {
  label: string
  value: number | string
  bg: string
}) {
  return (
    <div className={`${bg} rounded-xl px-3 py-2 text-center text-white`}>
      <div className="text-xl font-bold tabular-nums sm:text-2xl">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</div>
    </div>
  )
}

// ── ResultsScreen ─────────────────────────────────────────────────────────────

function ResultsScreen({
  result,
  showNewBest,
  personalBest,
  difficulty,
  onPlayAgain,
  onTryDifferentMode,
  onDownloadBadge,
}: {
  result: Result
  showNewBest: boolean
  personalBest: number
  difficulty: Difficulty
  onPlayAgain: () => void
  onTryDifferentMode: () => void
  onDownloadBadge: () => void
}) {
  const avgWpm    = 40
  const pctDiff   = Math.round(Math.abs((result.wpm - avgWpm) / avgWpm) * 100)
  const comparison =
    result.wpm > avgWpm
      ? `${result.wpm} WPM — ${pctDiff}% faster than average!`
      : result.wpm === avgWpm
      ? `${result.wpm} WPM — exactly at the average!`
      : `${result.wpm} WPM — ${pctDiff}% below average.`

  return (
    <div>
      {/* Banner */}
      {showNewBest ? (
        <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800 dark:border-yellow-700/40 dark:bg-yellow-900/20 dark:text-yellow-300">
          <span className="text-xl">🎉</span>
          <span className="font-bold">New Personal Best!</span>
        </div>
      ) : result.grade.letter === 'D' ? (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
          Keep practicing! Every expert was once a beginner.
        </div>
      ) : null}

      {/* WPM + grade letter */}
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <div className="text-7xl font-extrabold tabular-nums text-violet-600 dark:text-violet-400 sm:text-8xl">
            {result.wpm}
          </div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            words per minute
          </div>
        </div>
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-extrabold shadow-sm ${result.grade.bg} ${result.grade.color}`}
        >
          {result.grade.letter}
        </div>
      </div>
      <p className="mb-5 text-base font-semibold text-zinc-600 dark:text-zinc-300">
        {result.grade.label}
      </p>

      {/* Stats grid */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Accuracy"     value={`${result.accuracy}%`} />
        <MiniStat label="Errors"       value={String(result.errors)} />
        <MiniStat label="Words Typed"  value={String(result.wordsTyped)} />
        <MiniStat
          label="Personal Best"
          value={`${personalBest} WPM`}
          highlight={showNewBest}
        />
      </div>

      {/* Comparison */}
      <div className="mb-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
        <p className="text-zinc-500 dark:text-zinc-400">
          Average typist types{' '}
          <span className="font-medium text-zinc-700 dark:text-zinc-200">40 WPM</span>
        </p>
        <p className="font-medium text-zinc-700 dark:text-zinc-200">
          You typed {comparison}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
        <button
          onClick={onDownloadBadge}
          className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
        >
          <Download className="h-4 w-4" />
          Download Badge
        </button>
        <button
          onClick={onTryDifferentMode}
          className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Try Different Mode
        </button>
      </div>
    </div>
  )
}

// ── MiniStat ──────────────────────────────────────────────────────────────────

function MiniStat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center ${
        highlight
          ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700/40 dark:bg-yellow-900/20'
          : 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
      }`}
    >
      <div className="text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-100 sm:text-lg">
        {value}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  )
}
