'use client'

import { useState, useEffect, useMemo } from 'react'
import { SHORTCUT_CATEGORIES } from '@/data/keyboardShortcuts'

interface Props {
  score: number
  correct: number
  total: number
  mode: 'sprint' | 'reverse' | 'gauntlet'
  software: string
  difficulty: 'easy' | 'medium' | 'hard'
  badges: string[]
  newBadge?: string
  onPlayAgain: () => void
  onChangeMode: () => void
}

const MODE_NAMES: Record<string, string> = {
  sprint:   'Shortcut Sprint',
  reverse:  'Reverse Challenge',
  gauntlet: 'Software Gauntlet',
}

function getGrade(correct: number, total: number): { letter: 'S' | 'A' | 'B' | 'C' | 'D'; color: string } {
  const pct = correct / total
  if (pct >= 1.0) return { letter: 'S', color: 'text-yellow-400' }
  if (pct >= 0.8) return { letter: 'A', color: 'text-green-400' }
  if (pct >= 0.6) return { letter: 'B', color: 'text-sky-400' }
  if (pct >= 0.4) return { letter: 'C', color: 'text-orange-400' }
  return { letter: 'D', color: 'text-zinc-400' }
}

export default function ResultsScreen({
  score, correct, total, mode, software, difficulty,
  badges, newBadge, onPlayAgain, onChangeMode,
}: Props) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showBest, setShowBest]         = useState(false)
  const [isNewRecord, setIsNewRecord]   = useState(false)
  const [prevBest, setPrevBest]         = useState<number | null>(null)

  const catInfo  = SHORTCUT_CATEGORIES.find(c => c.id === software)
  const grade    = getGrade(correct, total)
  const accuracy = Math.round((correct / total) * 100)

  const LINES = useMemo(() => [
    `> final_score: ${score} / 50`,
    `> accuracy: ${accuracy}%`,
    `> correct: ${correct}/${total}`,
    `> mode: ${MODE_NAMES[mode] ?? mode}`,
    `> software: ${catInfo?.name ?? software}`,
  ], [score, accuracy, correct, total, mode, software, catInfo])

  // Typewriter: reveal one line every 100ms
  useEffect(() => {
    if (visibleLines >= LINES.length) return
    const t = setTimeout(() => setVisibleLines(v => v + 1), 100)
    return () => clearTimeout(t)
  }, [visibleLines, LINES.length])

  // Personal best + confetti (once on mount)
  useEffect(() => {
    const key = `kb_best_${mode}_${software}_${difficulty}`
    const prev    = localStorage.getItem(key)
    const prevNum = prev ? parseInt(prev) : -1
    const isNew   = score > prevNum
    setPrevBest(prevNum >= 0 ? prevNum : null)
    setIsNewRecord(isNew)
    if (isNew) localStorage.setItem(key, String(score))

    const t = setTimeout(() => setShowBest(true), 600)

    if (['S', 'A'].includes(grade.letter)) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: grade.letter === 'S' ? 200 : 120, spread: 70, origin: { y: 0.6 } })
        if (grade.letter === 'S') {
          setTimeout(() => confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0, y: 0.5 } }), 400)
          setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.5 } }), 800)
        }
      })
    }

    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-4">

      {/* ── ASCII header ─────────────────────────────────────── */}
      <div className="font-mono text-green-400 text-sm leading-relaxed">
        <p>{'╔══════════════════════════╗'}</p>
        <p>{'║  GAME COMPLETE           ║'}</p>
        <p>{'╚══════════════════════════╝'}</p>
      </div>

      {/* ── Typewriter stats ─────────────────────────────────── */}
      <div className="space-y-0.5 min-h-[7rem]">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <p key={i} className="text-green-400 font-mono text-sm">{line}</p>
        ))}
        {visibleLines < LINES.length && (
          <p className="text-green-400 font-mono text-sm">
            {LINES[visibleLines]}<span className="animate-pulse">_</span>
          </p>
        )}
      </div>

      {/* ── Personal best ────────────────────────────────────── */}
      {showBest && (
        <div className="space-y-0.5">
          {prevBest !== null && (
            <p className="text-zinc-500 font-mono text-xs">{`> personal_best: ${prevBest}`}</p>
          )}
          <p className="text-zinc-500 font-mono text-xs">
            {`> new_record: ${isNewRecord}`}
          </p>
        </div>
      )}

      {/* ── Grade + badge award ──────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className={`font-mono font-bold text-5xl ${grade.color}`}>
          [ {grade.letter} ]
        </div>
        {newBadge && (
          <div className="animate-bounce">
            <p className="text-green-400 font-bold text-xl">
              🏆 {catInfo?.name} Badge Earned!
            </p>
          </div>
        )}
      </div>

      {/* ── Badge display (Gauntlet) ─────────────────────────── */}
      {mode === 'gauntlet' && (
        <div className="bg-zinc-900 rounded-xl p-4">
          <p className="text-green-500 text-xs font-mono uppercase tracking-widest mb-3">
            {'> YOUR_BADGES:'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SHORTCUT_CATEGORIES.map(cat => {
              const earned = badges.includes(cat.id)
              return (
                <div
                  key={cat.id}
                  className={[
                    'rounded-lg p-2 text-center text-xs font-mono',
                    earned
                      ? 'bg-green-950 border border-green-700 text-green-300'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-600',
                  ].join(' ')}
                >
                  <span className={earned ? '' : 'opacity-30'}>{cat.icon}</span>
                  <p className="mt-0.5 text-[10px]">{earned ? 'earned' : 'locked'}</p>
                </div>
              )
            })}
          </div>
          {!newBadge && correct / total < 0.8 && (
            <p className="text-zinc-600 font-mono text-xs mt-3">
              {'// need 8/10 correct to earn the badge — try again!'}
            </p>
          )}
        </div>
      )}

      {/* ── Buttons ──────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 bg-transparent border border-green-700 text-green-400 font-mono text-sm hover:bg-green-950 hover:border-green-500 px-6 py-2 rounded-lg transition-all"
        >
          {'> play_again'}
        </button>
        <button
          type="button"
          onClick={onChangeMode}
          className="flex-1 bg-transparent border border-green-700 text-green-400 font-mono text-sm hover:bg-green-950 hover:border-green-500 px-6 py-2 rounded-lg transition-all"
        >
          {'> change_mode'}
        </button>
      </div>

    </div>
  )
}
