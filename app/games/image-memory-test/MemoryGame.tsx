'use client'

import { useState, useEffect } from 'react'
import { Brain, Maximize2 } from 'lucide-react'
import type { MemoryMode, Difficulty } from '@/types/memory'
import SequenceRecall from './SequenceRecall'
import GridMatch from './GridMatch'
import DailyFlash from './DailyFlash'

const CARD_STYLE: React.CSSProperties = {
  height: 'calc(100vh - 100px)',
  minHeight: '500px',
  boxShadow:
    '0 0 0 1px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.15), 0 25px 50px rgba(0,0,0,0.5)',
}

const MODES: { key: MemoryMode; emoji: string; name: string; desc: string }[] = [
  { key: 'sequence', emoji: '🧠', name: 'Sequence Recall',  desc: 'Watch the pattern. Repeat it back.'          },
  { key: 'grid',     emoji: '🃏', name: 'Grid Match',       desc: 'Find all matching pairs from memory.'         },
  { key: 'daily',    emoji: '⚡', name: 'Daily Flash',      desc: '5 images. Half a second. Can you recall?'    },
]

const THEMES = [
  { key: 'animals', label: 'Animals', icon: '🐾' },
  { key: 'food',    label: 'Food',    icon: '🍕' },
  { key: 'sports',  label: 'Sports',  icon: '⚽' },
  { key: 'travel',  label: 'Travel',  icon: '✈️' },
  { key: 'nature',  label: 'Nature',  icon: '🌸' },
  { key: 'objects', label: 'Objects', icon: '🎸' },
]

const DIFFICULTIES: { key: Difficulty; label: string; pairs: number }[] = [
  { key: 'easy',   label: 'Easy',   pairs: 8  },
  { key: 'medium', label: 'Medium', pairs: 12 },
  { key: 'hard',   label: 'Hard',   pairs: 15 },
  { key: 'expert', label: 'Expert', pairs: 18 },
]

type GamePhase = 'setup' | 'playing'

export default function MemoryGame() {
  const [phase,      setPhase]      = useState<GamePhase>('setup')
  const [mode,       setMode]       = useState<MemoryMode | null>(null)
  const [theme,      setTheme]      = useState('animals')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [streak,     setStreak]     = useState(0)
  const [bestSeq,    setBestSeq]    = useState(0)
  const [bestGrid,   setBestGrid]   = useState(0)
  const [dailyDone,  setDailyDone]  = useState(false)
  const [countdown,  setCountdown]  = useState('')

  useEffect(() => {
    setStreak(Number(localStorage.getItem('memory_streak') ?? 0))
    setBestSeq(Number(localStorage.getItem('memory_best_sequence') ?? 0))
    const gridBests = ['easy','medium','hard','expert']
      .map((d) => Number(localStorage.getItem(`memory_best_grid_${d}`) ?? 0))
    setBestGrid(Math.max(...gridBests))
    const todayISO = new Date().toISOString().split('T')[0]
    setDailyDone(!!localStorage.getItem(`memory_daily_${todayISO}`))
  }, [])

  useEffect(() => {
    if (mode !== 'daily') return
    function tick() {
      const now  = new Date()
      const next = new Date()
      next.setHours(24, 0, 0, 0)
      const diff = next.getTime() - now.getTime()
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setCountdown(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [mode])

  function handleFullscreen() {
    const el = document.getElementById('original-game-card')
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else if (el) {
      el.requestFullscreen().catch(() => {})
    }
  }

  if (phase === 'playing') {
    return (
      <div
        id="original-game-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 to-purple-950 p-6"
        style={CARD_STYLE}
      >
        {mode === 'sequence' && (
          <SequenceRecall onQuit={() => setPhase('setup')} />
        )}
        {mode === 'grid' && (
          <GridMatch
            difficulty={difficulty}
            theme={theme}
            onQuit={() => setPhase('setup')}
          />
        )}
        {mode === 'daily' && (
          <DailyFlash onQuit={() => setPhase('setup')} />
        )}
      </div>
    )
  }

  return (
    <div
      id="original-game-card"
      className="rounded-2xl bg-gradient-to-br from-indigo-950 to-purple-950 overflow-y-auto"
      style={CARD_STYLE}
    >
      <div className="p-6 flex flex-col min-h-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <h2 className="text-white font-bold text-2xl">Image Memory Test</h2>
            <span className="animate-pulse text-purple-400 ml-1">●</span>
          </div>
          <button
            onClick={handleFullscreen}
            aria-label="Fullscreen"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        <hr className="border-purple-800/50 mb-5" />

        {/* ── Mode cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {MODES.map((m) => {
            const selected = mode === m.key
            const isDaily  = m.key === 'daily'
            return (
              <div
                key={m.key}
                onClick={() => setMode(m.key)}
                className={[
                  'relative rounded-2xl p-5 cursor-pointer backdrop-blur-sm transition-all duration-200',
                  isDaily ? 'sm:col-span-2' : '',
                  selected
                    ? 'bg-purple-500/20 border-2 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                    : 'bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-purple-500/10 hover:scale-[1.02]',
                ].join(' ')}
              >
                <div className="text-4xl">{m.emoji}</div>
                <p className="text-white font-bold text-lg mt-2">{m.name}</p>
                <p className="text-purple-200/70 text-sm">{m.desc}</p>

                {isDaily && dailyDone && (
                  <span className="absolute top-3 right-3 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2.5 py-0.5">
                    ✓ Complete
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Daily countdown ── */}
        {mode === 'daily' && dailyDone && countdown && (
          <p className="text-purple-300/60 text-xs text-center mb-4">
            Next challenge in {countdown}
          </p>
        )}

        {/* ── Settings (Grid Match only) ── */}
        {mode === 'grid' && (
          <div className="mb-4 space-y-4">
            {/* Theme */}
            <div>
              <p className="text-purple-300 text-xs uppercase tracking-widest mb-2">Choose Theme</p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(t.key)}
                    className={[
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors',
                      theme === t.key
                        ? 'bg-purple-500/30 border border-purple-400 text-white'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20',
                    ].join(' ')}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-purple-300 text-xs uppercase tracking-widest mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDifficulty(d.key)}
                    className={[
                      'rounded-full px-3 py-1 text-sm transition-colors',
                      difficulty === d.key
                        ? 'bg-purple-500/30 border border-purple-400 text-white'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20',
                    ].join(' ')}
                  >
                    {d.label}
                    <span className="ml-1 text-white/30 text-xs">({d.pairs})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Spacer pushes footer down ── */}
        <div className="flex-1" />

        {/* ── Streak + personal best ── */}
        {streak > 0 && (
          <p className="text-orange-300 text-sm font-semibold mt-3 text-center">
            🔥 {streak} day streak
          </p>
        )}
        {(bestSeq > 0 || bestGrid > 0) && (
          <p className="text-purple-300/60 text-xs text-center mt-1">
            Your best — Sequence: {bestSeq} | Grid: {bestGrid}%
          </p>
        )}

        {/* ── Start button ── */}
        <button
          type="button"
          disabled={mode === null}
          onClick={() => mode && setPhase('playing')}
          className={[
            'mt-5 w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2',
            'border border-purple-400/30 shadow-lg shadow-purple-500/30 transition-all duration-200',
            mode !== null
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
              : 'bg-white/5 text-white/20 cursor-not-allowed',
          ].join(' ')}
        >
          <Brain className="h-4 w-4" />
          ▶ Start
        </button>

        {/* ── How to Play ── */}
        <div className="text-center mt-2">
          <a
            href="#how-to-play"
            className="text-purple-400/50 text-xs underline hover:text-purple-300/70 transition-colors"
          >
            How to Play
          </a>
        </div>

      </div>
    </div>
  )
}
