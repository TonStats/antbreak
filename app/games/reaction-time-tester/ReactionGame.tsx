'use client'

import { useState, useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { Zap, Maximize2, Minimize2, X } from 'lucide-react'
import type { ReactionTestType, ReactionRound } from '@/types/reaction'
import { COMPARISON_DATA, getGrade } from '@/types/reaction'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEST_CARDS: {
  id: ReactionTestType
  emoji: string
  name: string
  desc: string
  selectedBorder: string
  selectedShadow: string
}[] = [
  { id: 'color',  emoji: '⚡', name: 'CLICK THE COLOR',  desc: 'React when target color appears', selectedBorder: 'border-lime-400',   selectedShadow: 'shadow-lime-400/15'   },
  { id: 'aim',    emoji: '🎯', name: 'AIM AND CLICK',    desc: 'Hit targets before they vanish',  selectedBorder: 'border-cyan-400',   selectedShadow: 'shadow-cyan-400/15'   },
  { id: 'number', emoji: '🔢', name: 'NUMBER RESPONSE',  desc: 'Match numbers at speed',          selectedBorder: 'border-violet-400', selectedShadow: 'shadow-violet-400/15' },
  { id: 'rhythm', emoji: '🥁', name: 'RHYTHM TAP',       desc: 'Match the beat precisely',        selectedBorder: 'border-pink-400',   selectedShadow: 'shadow-pink-400/15'   },
]

const ROUND_OPTIONS = [3, 5, 10]

const HOW_TO_GUIDE = [
  {
    label: 'Click the Color',
    body:  'A color target flashes on screen. Click it the moment the color changes. Clicking before the signal counts as a false start and adds a 500ms penalty.',
  },
  {
    label: 'Aim and Click',
    body:  'Targets appear at random positions. Move your cursor and click each target before it disappears. Reaction time is measured from appearance to click.',
  },
  {
    label: 'Number Response',
    body:  'A number appears on screen. Click the matching number from the options as fast as possible. Accuracy and speed both contribute to your score.',
  },
  {
    label: 'Rhythm Tap',
    body:  'Tap along to a repeating beat. Your score is based on how close each tap lands to the exact beat moment. Lower deviation in milliseconds is better.',
  },
]

const GRADE_COLOR_HEX: Record<string, string> = {
  'text-yellow-400': '#facc15',
  'text-cyan-400':   '#22d3ee',
  'text-green-400':  '#4ade80',
  'text-blue-400':   '#60a5fa',
  'text-orange-400': '#fb923c',
  'text-zinc-400':   '#a1a1aa',
  'text-lime-400':   '#a3e635',
}

const MIN_WAIT        = 1500
const MAX_WAIT        = 5000
const ROUND_RESULT_MS = 1200
const TARGET_DURATION = 2000
const FLASH_DURATION  = 800
const GUIDED_BEATS    = 4
const SILENT_TAPS     = 4

const randomWait = () => MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT)

type GameStage = 'setup' | 'waiting' | 'active' | 'roundResult' | 'summary'

type ConfettiParticle = {
  left: number; delay: number; duration: number; color: string; size: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReactionGame() {
  const cardRef = useRef<HTMLDivElement>(null)

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGuide,    setShowGuide]    = useState(false)
  const [bestMs,       setBestMs]       = useState<number | null>(null)

  // ── Setup ───────────────────────────────────────────────────────────────────
  const [testType,   setTestType]   = useState<ReactionTestType>('color')
  const [roundCount, setRoundCount] = useState(5)

  // ── Game ────────────────────────────────────────────────────────────────────
  const [gameStage,    setGameStage]    = useState<GameStage>('setup')
  const [currentRound, setCurrentRound] = useState(0)
  const [rounds,       setRounds]       = useState<ReactionRound[]>([])
  const [lastRound,    setLastRound]    = useState<ReactionRound | null>(null)
  const [penaltyMsg,   setPenaltyMsg]   = useState('')
  const [missedRound,  setMissedRound]  = useState(false)

  // ── Summary ──────────────────────────────────────────────────────────────────
  const [isNewBest,         setIsNewBest]         = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])

  // ── Aim ─────────────────────────────────────────────────────────────────────
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null)

  // ── Number Response ──────────────────────────────────────────────────────────
  const [shownNumber,    setShownNumber]    = useState<number | null>(null)
  const [numberOptions,  setNumberOptions]  = useState<number[]>([])
  const [showingFlash,   setShowingFlash]   = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  // ── Rhythm Tap ───────────────────────────────────────────────────────────────
  const [rhythmBpm,      setRhythmBpm]      = useState(() => 60 + Math.floor(Math.random() * 40))
  const [beatPhase,      setBeatPhase]      = useState<'guided' | 'silent'>('guided')
  const [guidedCount,    setGuidedCount]    = useState(0)
  const [beatActive,     setBeatActive]     = useState(false)
  const [silentCount,    setSilentCount]    = useState(0)
  const [rhythmFeedback, setRhythmFeedback] = useState<{ text: string; color: string } | null>(null)

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const waitTimeoutRef      = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const targetTimeoutRef    = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const roundResultTimerRef = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const flashTimeoutRef     = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const beatIntervalRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const rhythmFeedbackRef   = useRef<ReturnType<typeof setTimeout>  | null>(null)
  // Stable values for async closures
  const roundsRef           = useRef<ReactionRound[]>([])
  const roundCountRef       = useRef(5)
  const testTypeRef         = useRef<ReactionTestType>('color')
  const startTimeRef        = useRef(0)
  const beginWaitingRef     = useRef<() => void>(() => {})
  const rhythmIntervalMsRef = useRef(Math.round(60000 / rhythmBpm))
  const lastTapMsRef        = useRef(0)
  const silentCountRef      = useRef(0)
  const beatPhaseRef        = useRef<'guided' | 'silent'>('guided')

  useEffect(() => { roundCountRef.current = roundCount }, [roundCount])
  useEffect(() => { testTypeRef.current   = testType   }, [testType])

  useEffect(() => {
    const stored = localStorage.getItem(`reaction_best_${testType}`)
    setBestMs(stored ? parseInt(stored) : null)
  }, [testType])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // Save personal best + confetti on summary
  useEffect(() => {
    if (gameStage !== 'summary') return
    const allRounds = roundsRef.current
    if (allRounds.length === 0) return

    const avg     = Math.round(allRounds.reduce((s, r) => s + r.reactionMs, 0) / allRounds.length)
    const key     = `reaction_best_${testTypeRef.current}`
    const saved   = localStorage.getItem(key)
    const prev    = saved ? parseInt(saved) : null
    const newBest = prev === null || avg < prev

    if (newBest) {
      localStorage.setItem(key, String(avg))
      setBestMs(avg)
    }
    setIsNewBest(newBest)

    const grade = getGrade(avg, testTypeRef.current)
    if (grade.label === 'Superhuman' || grade.label === 'Elite') {
      const COLORS = ['#a3e635', '#22d3ee', '#f59e0b', '#f472b6', '#818cf8']
      setConfettiParticles(
        Array.from({ length: 40 }, () => ({
          left:     Math.random() * 100,
          delay:    Math.random() * 0.8,
          duration: 1.5 + Math.random() * 2,
          color:    COLORS[Math.floor(Math.random() * COLORS.length)],
          size:     6 + Math.floor(Math.random() * 6),
        }))
      )
    }
  }, [gameStage])

  useEffect(() => {
    return () => {
      if (waitTimeoutRef.current)      clearTimeout(waitTimeoutRef.current)
      if (targetTimeoutRef.current)    clearTimeout(targetTimeoutRef.current)
      if (roundResultTimerRef.current) clearTimeout(roundResultTimerRef.current)
      if (flashTimeoutRef.current)     clearTimeout(flashTimeoutRef.current)
      if (beatIntervalRef.current)     clearInterval(beatIntervalRef.current)
      if (rhythmFeedbackRef.current)   clearTimeout(rhythmFeedbackRef.current)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await cardRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }

  // ── Game logic ──────────────────────────────────────────────────────────────

  const recordRound = (round: ReactionRound) => {
    const newRounds = [...roundsRef.current, round]
    roundsRef.current = newRounds
    setRounds(newRounds)
    setLastRound(round)
    setCurrentRound(newRounds.length)

    if (round.falseStart) {
      setPenaltyMsg('TOO EARLY! +500ms penalty')
      roundResultTimerRef.current = setTimeout(() => {
        if (newRounds.length >= roundCountRef.current) {
          setGameStage('summary')
        } else {
          beginWaitingRef.current()
        }
      }, 1500)
    } else {
      setMissedRound(!round.accurate)
      setGameStage('roundResult')
      roundResultTimerRef.current = setTimeout(() => {
        if (newRounds.length >= roundCountRef.current) {
          setGameStage('summary')
        } else {
          beginWaitingRef.current()
        }
      }, ROUND_RESULT_MS)
    }
  }

  const beginWaiting = () => {
    setPenaltyMsg('')
    setMissedRound(false)
    setGameStage('waiting')

    waitTimeoutRef.current = setTimeout(() => {
      const type = testTypeRef.current

      if (type === 'color') {
        startTimeRef.current = performance.now()
        setGameStage('active')

      } else if (type === 'aim') {
        const x = 10 + Math.random() * 80
        const y = 15 + Math.random() * 70
        setTargetPos({ x, y })
        startTimeRef.current = performance.now()
        setGameStage('active')

        targetTimeoutRef.current = setTimeout(() => {
          setTargetPos(null)
          const missRound: ReactionRound = { reactionMs: 2000, accurate: false, falseStart: false }
          const newRounds = [...roundsRef.current, missRound]
          roundsRef.current = newRounds
          setRounds(newRounds)
          setLastRound(missRound)
          setCurrentRound(newRounds.length)
          setMissedRound(true)
          setGameStage('roundResult')
          roundResultTimerRef.current = setTimeout(() => {
            if (newRounds.length >= roundCountRef.current) {
              setGameStage('summary')
            } else {
              beginWaitingRef.current()
            }
          }, ROUND_RESULT_MS)
        }, TARGET_DURATION)

      } else if (type === 'number') {
        const correct = 1 + Math.floor(Math.random() * 9)
        const wrongs  = new Set<number>()
        while (wrongs.size < 3) {
          const w = 1 + Math.floor(Math.random() * 9)
          if (w !== correct) wrongs.add(w)
        }
        const opts = [correct, ...Array.from(wrongs)]
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[opts[i], opts[j]] = [opts[j], opts[i]]
        }
        setShownNumber(correct)
        setNumberOptions(opts)
        setSelectedOption(null)
        setShowingFlash(true)
        setGameStage('active')

        flashTimeoutRef.current = setTimeout(() => {
          setShowingFlash(false)
          startTimeRef.current = performance.now()
        }, FLASH_DURATION)

      } else if (type === 'rhythm') {
        const intervalMs = rhythmIntervalMsRef.current
        setBeatPhase('guided')
        beatPhaseRef.current = 'guided'
        setGuidedCount(0)
        setSilentCount(0)
        silentCountRef.current = 0
        lastTapMsRef.current   = 0
        setBeatActive(false)
        setGameStage('active')

        let guidedTicks = 0
        beatIntervalRef.current = setInterval(() => {
          setBeatActive(true)
          setTimeout(() => setBeatActive(false), 150)
          guidedTicks += 1
          setGuidedCount(guidedTicks)
          if (guidedTicks >= GUIDED_BEATS) {
            clearInterval(beatIntervalRef.current!)
            setBeatPhase('silent')
            beatPhaseRef.current = 'silent'
          }
        }, intervalMs)
      }
    }, randomWait())
  }

  beginWaitingRef.current = beginWaiting

  const handleStart = () => {
    const newBpm = 60 + Math.floor(Math.random() * 40)
    setRhythmBpm(newBpm)
    rhythmIntervalMsRef.current = Math.round(60000 / newBpm)

    roundsRef.current  = []
    setRounds([])
    setCurrentRound(0)
    setLastRound(null)
    setPenaltyMsg('')
    setMissedRound(false)
    setIsNewBest(false)
    setConfettiParticles([])
    setShownNumber(null)
    setNumberOptions([])
    setShowingFlash(false)
    setSelectedOption(null)
    setBeatPhase('guided')
    beatPhaseRef.current = 'guided'
    setGuidedCount(0)
    setSilentCount(0)
    silentCountRef.current = 0
    lastTapMsRef.current   = 0
    setBeatActive(false)
    setRhythmFeedback(null)
    beginWaiting()
  }

  const handleQuit = () => {
    if (waitTimeoutRef.current)      clearTimeout(waitTimeoutRef.current)
    if (targetTimeoutRef.current)    clearTimeout(targetTimeoutRef.current)
    if (roundResultTimerRef.current) clearTimeout(roundResultTimerRef.current)
    if (flashTimeoutRef.current)     clearTimeout(flashTimeoutRef.current)
    if (beatIntervalRef.current)     clearInterval(beatIntervalRef.current)
    if (rhythmFeedbackRef.current)   clearTimeout(rhythmFeedbackRef.current)
    setTargetPos(null)
    setBeatActive(false)
    setConfettiParticles([])
    setIsNewBest(false)
    setGameStage('setup')
  }

  const handleContentAreaClick = () => {
    const isFalseStartTest = testType === 'color' || testType === 'aim'
    if (gameStage === 'waiting' && !penaltyMsg && isFalseStartTest) {
      clearTimeout(waitTimeoutRef.current!)
      recordRound({ reactionMs: 500, accurate: false, falseStart: true })
    } else if (gameStage === 'active' && testType === 'color') {
      const ms = Math.round(performance.now() - startTimeRef.current)
      recordRound({ reactionMs: ms, accurate: true, falseStart: false })
    }
  }

  const handleTargetClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (gameStage !== 'active' || testType !== 'aim') return
    clearTimeout(targetTimeoutRef.current!)
    const ms = Math.round(performance.now() - startTimeRef.current)
    setTargetPos(null)
    recordRound({ reactionMs: ms, accurate: true, falseStart: false })
  }

  const handleNumberOption = (e: MouseEvent, option: number) => {
    e.stopPropagation()
    if (gameStage !== 'active' || testType !== 'number' || showingFlash || selectedOption !== null) return
    const ms       = Math.round(performance.now() - startTimeRef.current)
    const accurate = option === shownNumber
    setSelectedOption(option)
    recordRound({ reactionMs: ms, accurate, falseStart: false })
  }

  const handleRhythmTap = (e: MouseEvent) => {
    e.stopPropagation()
    if (gameStage !== 'active' || testType !== 'rhythm') return

    const now       = performance.now()
    const prevTapMs = lastTapMsRef.current
    lastTapMsRef.current = now

    if (beatPhaseRef.current === 'guided') return

    const newSilentCount = silentCountRef.current + 1
    silentCountRef.current = newSilentCount
    setSilentCount(newSilentCount)

    if (prevTapMs > 0) {
      const deviation = Math.abs((now - prevTapMs) - rhythmIntervalMsRef.current)
      const ms        = Math.round(deviation)

      let feedbackText: string
      let feedbackColor: string
      if (deviation < 30) {
        feedbackText  = `+${ms}ms ✓`
        feedbackColor = 'text-lime-400'
      } else if (deviation < 60) {
        feedbackText  = `+${ms}ms`
        feedbackColor = 'text-yellow-400'
      } else {
        feedbackText  = `+${ms}ms`
        feedbackColor = 'text-rose-400'
      }
      setRhythmFeedback({ text: feedbackText, color: feedbackColor })
      if (rhythmFeedbackRef.current) clearTimeout(rhythmFeedbackRef.current)
      rhythmFeedbackRef.current = setTimeout(() => setRhythmFeedback(null), 600)

      const newRound: ReactionRound = { reactionMs: ms, accurate: deviation < 100, falseStart: false }
      const newRounds = [...roundsRef.current, newRound]
      roundsRef.current = newRounds
      setRounds(newRounds)
      setCurrentRound(newRounds.length)
    }

    if (newSilentCount >= SILENT_TAPS) {
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current)
      setGameStage('summary')
    }
  }

  const handleShareBadge = () => {
    const allRounds = roundsRef.current
    if (allRounds.length === 0) return
    const avg     = Math.round(allRounds.reduce((s, r) => s + r.reactionMs, 0) / allRounds.length)
    const grade   = getGrade(avg, testTypeRef.current)
    const testName = TEST_CARDS.find(c => c.id === testTypeRef.current)?.name ?? ''
    const gradeHex = GRADE_COLOR_HEX[grade.color] ?? '#a3e635'

    const canvas = document.createElement('canvas')
    canvas.width  = 600
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 600, 300)

    ctx.textAlign = 'center'

    ctx.fillStyle = '#a3e635'
    ctx.font = '13px monospace'
    ctx.fillText('ANTBREAK REACTION TIME TESTER', 300, 36)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 88px monospace'
    ctx.fillText(`${avg}ms`, 300, 158)

    ctx.fillStyle = gradeHex
    ctx.font = 'bold 26px monospace'
    ctx.fillText(`${grade.emoji} ${grade.label}`, 300, 200)

    ctx.fillStyle = '#71717a'
    ctx.font = '15px monospace'
    ctx.fillText(testName, 300, 236)

    ctx.fillStyle = '#3f3f46'
    ctx.font = '13px monospace'
    ctx.textAlign = 'right'
    ctx.fillText('antbreak.com', 590, 285)

    const a = document.createElement('a')
    a.download = `antbreak-reaction-${avg}ms.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  // ── Derived for summary ──────────────────────────────────────────────────────
  const comparison  = COMPARISON_DATA[testType]
  const summaryAvg  = gameStage === 'summary' && rounds.length > 0
    ? Math.round(rounds.reduce((s, r) => s + r.reactionMs, 0) / rounds.length)
    : 0
  const summaryGrade = summaryAvg > 0 ? getGrade(summaryAvg, testType) : null
  const barMax       = summaryAvg > 0 ? Math.max(summaryAvg, comparison.average) * 1.5 : 1
  const playerPct    = Math.min((summaryAvg / barMax) * 100, 96)
  const avgPct       = Math.min((comparison.average / barMax) * 100, 96)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Confetti overlay — outside the card so it covers the full viewport */}
      {gameStage === 'summary' && confettiParticles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiParticles.map((p, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left:              `${p.left}%`,
                top:               '-10px',
                width:             `${p.size}px`,
                height:            `${p.size}px`,
                backgroundColor:   p.color,
                animationDuration: `${p.duration}s`,
                animationDelay:    `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        ref={cardRef}
        className="flex flex-col rounded-2xl reaction-game-card"
        style={{
          height:    'calc(100vh - 100px)',
          minHeight: '580px',
          background: '#000000',
          boxShadow:
            '0 0 0 1px rgba(163,230,53,0.3), 0 0 40px rgba(163,230,53,0.08), 0 25px 50px rgba(0,0,0,0.8)',
        }}
      >
        {/* ── Title row ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-lime-900/30 shrink-0">
          <Zap className="w-6 h-6 text-lime-400" />
          <h1 className="text-lime-400 font-bold text-xl font-mono flex-1 leading-none">
            Reaction Time Tester
          </h1>
          {gameStage !== 'setup' && (
            <button
              onClick={handleQuit}
              className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
              aria-label="Quit"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* ── Setup screen ────────────────────────────────────────────────── */}
        {gameStage === 'setup' && (
          <div className="flex-1 overflow-y-auto scrollbar-hidden flex flex-col justify-center px-6 py-4">

            <p className="text-lime-900/60 text-xs font-mono uppercase tracking-[0.4em] text-center mb-5">
              REACTION TIME TESTER
            </p>

            <div className="grid grid-cols-2 gap-3">
              {TEST_CARDS.map(card => {
                const isSelected = testType === card.id
                return (
                  <button
                    key={card.id}
                    onClick={() => setTestType(card.id)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all duration-150 text-left ${
                      isSelected
                        ? `bg-black border-2 ${card.selectedBorder} shadow-lg ${card.selectedShadow}`
                        : 'bg-zinc-950 border border-zinc-800 hover:border-lime-800/60 hover:bg-zinc-900'
                    }`}
                  >
                    <p className="text-4xl text-center">{card.emoji}</p>
                    <p className="text-white font-bold text-sm font-mono mt-2 text-center">{card.name}</p>
                    <p className="text-zinc-600 text-xs mt-1 text-center">{card.desc}</p>
                  </button>
                )
              })}
            </div>

            <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest text-center mb-2 mt-4">
              ROUNDS
            </p>
            <div className="flex justify-center gap-2">
              {ROUND_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setRoundCount(n)}
                  className={`text-xs font-mono rounded-lg px-4 py-1.5 transition-all ${
                    roundCount === n
                      ? 'bg-lime-400 text-black font-bold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {bestMs !== null && (
              <p className="text-zinc-700 text-xs font-mono text-center mt-3">
                BEST: {bestMs}ms on {testType}
              </p>
            )}

            <p className="text-zinc-800 text-xs font-mono text-center mt-1">
              HUMAN AVERAGE: {comparison.average}ms
            </p>

            <button
              onClick={handleStart}
              className="bg-lime-400 text-black font-bold font-mono text-sm w-full py-3 rounded-xl mt-5 hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20 border border-lime-300/20"
            >
              ▶ START TEST
            </button>

            <button
              onClick={() => setShowGuide(g => !g)}
              className="text-zinc-800 text-xs font-mono underline mt-2 text-center hover:text-zinc-600 transition-colors"
            >
              {showGuide ? 'Hide guide' : 'How does each test work?'}
            </button>

            {showGuide && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-600 font-mono mt-2 space-y-3">
                {HOW_TO_GUIDE.map(item => (
                  <div key={item.label}>
                    <p className="text-zinc-400 font-bold mb-0.5">{item.label}</p>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Game area ───────────────────────────────────────────────────── */}
        {gameStage !== 'setup' && (
          <div
            className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center select-none ${
              gameStage === 'active' && testType === 'color'
                ? 'bg-lime-400 cursor-pointer'
                : 'cursor-default'
            }`}
            onClick={handleContentAreaClick}
          >

            {/* ── WAITING ───────────────────────────────────────────────── */}
            {gameStage === 'waiting' && (
              <div className="flex flex-col items-center justify-center h-full w-full">
                {penaltyMsg ? (
                  <p className="text-rose-400 font-mono text-xl text-center px-4">{penaltyMsg}</p>
                ) : testType === 'number' ? (
                  <>
                    <p className="text-zinc-600 font-mono text-2xl">GET READY</p>
                    <p className="text-zinc-700 text-sm font-mono mt-2 text-center">A number will flash briefly</p>
                    <p className="text-zinc-700 text-sm font-mono">Click the matching number!</p>
                    <div className="w-3 h-3 rounded-full bg-lime-400/30 animate-pulse mx-auto mt-4" />
                  </>
                ) : testType === 'rhythm' ? (
                  <>
                    <p className="text-zinc-600 font-mono text-2xl">GET READY</p>
                    <p className="text-zinc-700 text-sm font-mono mt-2 text-center px-6">
                      Follow the beat. Then keep the rhythm!
                    </p>
                    <p className="text-pink-400/60 font-mono text-sm mt-1">{rhythmBpm} BPM</p>
                    <div className="w-3 h-3 rounded-full bg-lime-400/30 animate-pulse mx-auto mt-4" />
                  </>
                ) : (
                  <>
                    <p className="text-zinc-600 font-mono text-2xl">GET READY</p>
                    <p className="text-zinc-700 text-sm font-mono mt-2 text-center px-6">
                      {testType === 'color'
                        ? 'Click when screen turns LIME GREEN'
                        : 'Click the target when it appears!'}
                    </p>
                    <div className="w-3 h-3 rounded-full bg-lime-400/30 animate-pulse mx-auto mt-4" />
                  </>
                )}
              </div>
            )}

            {/* ── ACTIVE — Aim target ───────────────────────────────────── */}
            {gameStage === 'active' && testType === 'aim' && targetPos && (
              <div
                style={{
                  position:  'absolute',
                  left:      `${targetPos.x}%`,
                  top:       `${targetPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="w-16 h-16 rounded-full bg-cyan-400 border-2 border-cyan-200 cursor-crosshair shadow-lg shadow-cyan-400/50 transition-transform duration-150 hover:scale-110"
                onClick={handleTargetClick}
              />
            )}

            {/* ── ACTIVE — Number flash ─────────────────────────────────── */}
            {gameStage === 'active' && testType === 'number' && showingFlash && shownNumber !== null && (
              <p className="text-violet-400 font-mono font-bold text-[120px] leading-none text-center select-none">
                {shownNumber}
              </p>
            )}

            {/* ── ACTIVE — Number options ───────────────────────────────── */}
            {gameStage === 'active' && testType === 'number' && !showingFlash && (
              <div className="w-full px-6">
                <div className="grid grid-cols-2 gap-3">
                  {numberOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={(e) => handleNumberOption(e, opt)}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl font-mono font-bold text-4xl text-white text-center aspect-square w-full hover:bg-zinc-800 cursor-pointer transition-colors flex items-center justify-center"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACTIVE — Rhythm ───────────────────────────────────────── */}
            {gameStage === 'active' && testType === 'rhythm' && (
              <div className="flex flex-col items-center justify-center h-full w-full px-6">
                <div
                  className={`w-40 h-40 rounded-full mx-auto transition-all duration-150 ${
                    beatPhase === 'guided' && beatActive
                      ? 'bg-pink-500/40 border-2 border-pink-400 scale-110'
                      : 'bg-pink-950/20 border border-pink-900/30 scale-100'
                  }`}
                />
                {beatPhase === 'guided' ? (
                  <p className="text-zinc-500 font-mono text-sm mt-4">TAP WITH THE BEAT</p>
                ) : (
                  <>
                    <p className="text-zinc-400 font-mono text-xl text-center mt-4">KEEP THE RHYTHM</p>
                    <p className="text-zinc-600 text-sm font-mono mt-1">
                      Tap {SILENT_TAPS - silentCount} more times
                    </p>
                    {rhythmFeedback && (
                      <p className={`font-mono text-lg mt-1 ${rhythmFeedback.color}`}>
                        {rhythmFeedback.text}
                      </p>
                    )}
                  </>
                )}
                <button
                  className="bg-pink-950/30 border-2 border-pink-800 rounded-2xl w-full py-10 mt-4 text-pink-400 font-mono font-bold text-xl active:scale-95 transition-transform cursor-pointer"
                  onClick={handleRhythmTap}
                >
                  TAP
                </button>
              </div>
            )}

            {/* ── ROUND RESULT ──────────────────────────────────────────── */}
            {gameStage === 'roundResult' && lastRound && (
              <div className="flex flex-col items-center justify-center h-full w-full">
                {testType === 'number' ? (
                  <div className="w-full px-6 flex flex-col items-center">
                    <p className={`font-mono text-2xl font-bold mb-3 ${lastRound.accurate ? 'text-lime-400' : 'text-rose-400'}`}>
                      {lastRound.reactionMs}ms
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {numberOptions.map(opt => {
                        let cls = 'bg-zinc-900 border border-zinc-700 text-white'
                        if (opt === shownNumber)
                          cls = 'bg-green-900/40 border-2 border-green-500 text-green-300'
                        else if (opt === selectedOption && !lastRound.accurate)
                          cls = 'bg-red-900/40 border-2 border-red-500 text-red-300'
                        return (
                          <div
                            key={opt}
                            className={`${cls} rounded-xl font-mono font-bold text-4xl text-center aspect-square w-full flex items-center justify-center`}
                          >
                            {opt}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : missedRound ? (
                  <p className="text-rose-400 font-mono text-3xl font-bold">MISSED!</p>
                ) : (
                  <>
                    <p className="text-lime-400 font-mono text-5xl font-bold">{lastRound.reactionMs}ms</p>
                    <p className="text-zinc-500 text-xs font-mono mt-2">
                      vs {comparison.average}ms human avg
                      {lastRound.reactionMs < comparison.average ? ' — faster!' : ' — keep practising'}
                    </p>
                  </>
                )}

                <div className="flex gap-2 mt-6">
                  {Array.from({ length: roundCount }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i < currentRound ? 'bg-lime-400' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── SUMMARY ───────────────────────────────────────────────── */}
            {gameStage === 'summary' && (
              <div className="absolute inset-0 overflow-y-auto scrollbar-hidden py-5 px-5">

                {/* Header */}
                <p className="text-lime-400/60 font-mono text-xs uppercase tracking-[0.4em] text-center mb-4">
                  TEST COMPLETE
                </p>

                {summaryAvg === 0 ? (
                  <p className="text-zinc-600 font-mono text-sm text-center">No rounds recorded</p>
                ) : (
                  <>
                    {/* Main time */}
                    <div className="text-center">
                      <span className="text-lime-400 font-mono font-bold text-7xl">{summaryAvg}</span>
                      <span className="text-lime-700 font-mono text-2xl">ms</span>
                    </div>

                    {/* Grade */}
                    {summaryGrade && (
                      <div className="text-center mt-2">
                        <p className="text-5xl">{summaryGrade.emoji}</p>
                        <p className={`text-2xl font-bold font-mono ${summaryGrade.color}`}>{summaryGrade.label}</p>
                        <p className="text-zinc-500 text-sm font-mono mt-1">{summaryGrade.description}</p>
                      </div>
                    )}

                    {/* Personal best */}
                    {isNewBest ? (
                      <p className="text-lime-400 font-bold font-mono text-lg text-center mt-3 animate-best-flash">
                        ⚡ NEW BEST: {summaryAvg}ms!
                      </p>
                    ) : bestMs !== null ? (
                      <p className="text-zinc-600 font-mono text-xs text-center mt-3">
                        BEST: {bestMs}ms
                      </p>
                    ) : null}

                    {/* Comparison bar */}
                    <div className="mt-4">
                      <div className="relative h-5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 bottom-0 w-px bg-zinc-500"
                          style={{ left: `${avgPct}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-1 rounded-sm bg-lime-400 shadow-sm shadow-lime-400/50"
                          style={{ left: `${Math.max(0, playerPct - 0.1)}%` }}
                        />
                      </div>
                      <p className="text-lime-400 font-mono text-sm mt-2">
                        YOUR TIME: {summaryAvg}ms
                      </p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">
                        {summaryAvg < comparison.average
                          ? `|←── ${comparison.average - summaryAvg}ms faster ──→|`
                          : summaryAvg > comparison.average
                          ? `|←── ${summaryAvg - comparison.average}ms slower ──→|`
                          : '|── exactly average ──|'}
                      </p>
                    </div>

                    {/* Round by round */}
                    <div className="mt-4">
                      <p className="text-zinc-700 text-xs font-mono uppercase tracking-widest mb-2">ROUNDS</p>
                      <div className="space-y-1">
                        {rounds.map((r, i) => (
                          <div key={i} className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-700">Round {i + 1}</span>
                            {r.falseStart ? (
                              <span className="text-rose-400">FALSE START</span>
                            ) : !r.accurate ? (
                              <span className="text-zinc-600">MISSED</span>
                            ) : (
                              <span className={r.reactionMs < comparison.average ? 'text-lime-400' : 'text-zinc-500'}>
                                {r.reactionMs}ms
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Share badge */}
                    <button
                      onClick={handleShareBadge}
                      className="mt-4 text-zinc-600 text-xs font-mono underline text-center w-full hover:text-zinc-400 transition-colors"
                    >
                      ↓ Download result card
                    </button>
                  </>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-lime-400 text-black font-bold font-mono text-sm py-2 px-6 rounded-xl hover:bg-lime-300 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleQuit}
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono text-sm py-2 px-6 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Change Test
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
