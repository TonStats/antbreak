'use client'

import { useState, useEffect, useRef } from 'react'
import { Keyboard } from 'lucide-react'
import { SHORTCUT_CATEGORIES, detectOS } from '@/data/keyboardShortcuts'
import SprintMode from './SprintMode'
import ReverseMode from './ReverseMode'
import ResultsScreen from './ResultsScreen'

type Stage      = 'setup' | 'playing' | 'results'
type Mode       = 'sprint' | 'reverse' | 'gauntlet'
type Difficulty = 'easy' | 'medium' | 'hard'
type OS         = 'windows' | 'mac'

const MODES: { id: Mode; icon: string; name: string; tagline: string }[] = [
  { id: 'sprint',   icon: '⚡', name: 'Shortcut Sprint',   tagline: 'Press the real keys. Race the clock.' },
  { id: 'reverse',  icon: '🔍', name: 'Reverse Challenge', tagline: 'See keys. Name the action.'          },
  { id: 'gauntlet', icon: '🏆', name: 'Software Gauntlet', tagline: 'Master one app at a time.'          },
]

const DIFFICULTIES: { id: Difficulty; label: string; active: string }[] = [
  { id: 'easy',   label: 'Easy',   active: 'bg-emerald-900 text-emerald-400 border-emerald-700' },
  { id: 'medium', label: 'Medium', active: 'bg-yellow-900 text-yellow-400 border-yellow-700'   },
  { id: 'hard',   label: 'Hard',   active: 'bg-rose-900 text-rose-400 border-rose-700'         },
]

export default function KeyboardGame() {
  const [stage, setStage]               = useState<Stage>('setup')
  const [os, setOs]                     = useState<OS>('windows')
  const [mode, setMode]                 = useState<Mode | null>(null)
  const [software, setSoftware]         = useState<string | null>(null)
  const [difficulty, setDifficulty]     = useState<Difficulty>('medium')
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [badges, setBadges]             = useState<string[]>([])
  const [lastScore, setLastScore]       = useState<string | null>(null)
  const [bestScore, setBestScore]       = useState<string | null>(null)
  const [gameResult, setGameResult]     = useState<{ score: number; correct: number; total: number; newBadge?: string } | null>(null)
  const [browserNotice, setBrowserNotice] = useState(false)
  const [showGuide, setShowGuide]         = useState(false)
  const gameStartRef = useRef<number>(0)

  useEffect(() => {
    setOs(detectOS())
    if (window.innerWidth < 768) setShowKeyboard(true)
    const saved = localStorage.getItem('kb_badges')
    if (saved) setBadges(JSON.parse(saved) as string[])
  }, [])

  // Prevent browser shortcuts during gameplay
  useEffect(() => {
    if (stage !== 'playing') return
    const handler = (e: KeyboardEvent) => e.preventDefault()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [stage])

  // Browser notice fade-out
  useEffect(() => {
    if (stage !== 'playing') return
    setBrowserNotice(true)
    const t = setTimeout(() => setBrowserNotice(false), 2000)
    return () => clearTimeout(t)
  }, [stage])

  useEffect(() => {
    if (!mode || !software) {
      setLastScore(null)
      setBestScore(null)
      return
    }
    const key = `kb_score_${mode}_${software}_${difficulty}`
    setLastScore(localStorage.getItem(`${key}_last`))
    setBestScore(localStorage.getItem(`${key}_best`))
  }, [mode, software, difficulty])

  function handleStart() {
    if (!mode || !software) return
    gameStartRef.current = Date.now()
    setStage('playing')
  }

  function handleFinish(score: number, correct: number, total: number, wrongIds: string[]) {
    // Save last/best for setup screen display
    const key = `kb_score_${mode}_${software}_${difficulty}`
    const scoreStr = `${correct}/${total}`
    localStorage.setItem(`${key}_last`, scoreStr)
    const prev = localStorage.getItem(`${key}_best`)
    const prevNum = prev ? parseInt(prev.split('/')[0]) : -1
    if (correct > prevNum) localStorage.setItem(`${key}_best`, scoreStr)

    // Award gauntlet badge
    let newBadge: string | undefined
    if (mode === 'gauntlet' && software && correct / total >= 0.8) {
      if (!badges.includes(software)) {
        const newBadges = [...badges, software]
        setBadges(newBadges)
        localStorage.setItem('kb_badges', JSON.stringify(newBadges))
        newBadge = software
      }
    }

    // Save session history
    const timeSeconds = Math.round((Date.now() - gameStartRef.current) / 1000)
    const entry = { mode, category: software, difficulty, score, correct, total, date: new Date().toISOString(), timeSeconds, wrongShortcuts: wrongIds }
    const history: unknown[] = JSON.parse(localStorage.getItem('kb_history') ?? '[]')
    localStorage.setItem('kb_history', JSON.stringify([entry, ...history].slice(0, 20)))

    setGameResult({ score, correct, total, newBadge })
    setStage('results')
  }

  function handleQuit() {
    setStage('setup')
    setGameResult(null)
  }

  const canStart = Boolean(mode && software)

  return (
    <div
      id="original-game-card"
      className="h-full rounded-2xl p-5 overflow-y-auto"
      style={{
        background: '#09090b',
        border: '2px solid rgba(74,222,128,0.3)',
        boxShadow:
          '0 0 0 1px rgba(74,222,128,0.2),' +
          '0 0 30px rgba(74,222,128,0.1),' +
          '0 25px 50px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-1">
        <Keyboard className="h-6 w-6 text-green-400 shrink-0" />
        <h1 className="text-2xl font-bold text-green-400 font-mono">
          Keyboard Shortcut Master
        </h1>
        <span className="animate-pulse inline-block w-2 h-5 bg-green-400 ml-1 align-middle" />
      </div>
      <hr className="border-green-900 mb-4" />

      {/* ── Setup ───────────────────────────────────────── */}
      {stage === 'setup' && (
        <div className="space-y-5">

          {/* OS detection */}
          <div>
            <button
              type="button"
              onClick={() => setOs(o => (o === 'windows' ? 'mac' : 'windows'))}
              className="bg-zinc-800 text-green-400 text-xs rounded-full px-3 py-1 inline-flex items-center gap-1 hover:bg-zinc-700 transition-colors"
            >
              {os === 'windows' ? '🪟 Windows shortcuts detected' : '🍎 Mac shortcuts detected'}
              <span className="text-zinc-500 ml-1">· click to toggle</span>
            </button>
          </div>

          {/* Mode selection */}
          <div>
            <p className="text-green-500 text-xs font-mono uppercase tracking-widest mb-3">
              {'> SELECT_MODE:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={[
                    'rounded-xl p-3 text-left transition-all',
                    mode === m.id
                      ? 'bg-green-950 border-2 border-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-zinc-900 border border-zinc-700 hover:border-green-700',
                  ].join(' ')}
                >
                  <div className="text-lg mb-1">{m.icon}</div>
                  <div className="text-green-300 font-semibold text-sm">{m.name}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{m.tagline}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Software selection */}
          <div>
            <p className="text-green-500 text-xs font-mono uppercase tracking-widest mb-3">
              {'> SELECT_SOFTWARE:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SHORTCUT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSoftware(cat.id)}
                  className={[
                    'rounded-xl p-3 text-sm transition-all text-left',
                    software === cat.id
                      ? 'bg-green-950 border-2 border-green-500 text-green-300'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-green-700 hover:text-green-400',
                  ].join(' ')}
                >
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            {mode === 'gauntlet' && (
              <p className="text-xs text-zinc-500 mt-2">
                {'Your badges: '}
                {SHORTCUT_CATEGORIES.map(cat => (
                  <span
                    key={cat.id}
                    className={`mr-3 ${badges.includes(cat.id) ? 'text-green-400' : 'text-zinc-600'}`}
                  >
                    {cat.icon} {badges.includes(cat.id) ? '✓' : '✗'}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-green-500 text-xs font-mono uppercase tracking-widest mb-3">
              {'> DIFFICULTY:'}
            </p>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={[
                    'flex-1 py-1.5 px-3 rounded-full text-xs font-medium border transition-all',
                    difficulty === d.id
                      ? d.active
                      : 'bg-zinc-900 text-zinc-600 border-zinc-700 hover:border-zinc-500',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard toggle + Start */}
          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only"
                checked={showKeyboard}
                onChange={e => setShowKeyboard(e.target.checked)}
              />
              <div className="relative pointer-events-none">
                <div className={`w-8 h-4 rounded-full transition-colors ${showKeyboard ? 'bg-green-600' : 'bg-zinc-700'}`} />
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${showKeyboard ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs text-zinc-500">⌨️ Show on-screen keyboard</span>
            </label>

            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="mt-4 w-full py-3 rounded-xl font-bold font-mono text-base text-black bg-green-600 hover:bg-green-500 border border-green-400 shadow-lg shadow-green-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {'> START_GAME'}
            </button>

            {canStart && (lastScore !== null || bestScore !== null) && (
              <p className="text-xs text-zinc-600 font-mono mt-2">
                last_score: {lastScore ?? '—'} | best: {bestScore ?? '—'}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(g => !g)}
              className="text-xs text-zinc-600 hover:text-green-500 mt-2 font-mono block transition-colors text-left"
            >
              {showGuide ? '// [collapse guide]' : '// how_to_play'}
            </button>

            {showGuide && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mt-2 font-mono text-xs text-green-400 leading-relaxed space-y-0.5">
                <p>{'// KEYBOARD SHORTCUT MASTER — GUIDE'}</p>
                <p>&nbsp;</p>
                <p>{'// SHORTCUT SPRINT:'}</p>
                <p>{'// An action appears on screen.'}</p>
                <p>{'// Press the correct key combination'}</p>
                <p>{'// on your keyboard within 5 seconds.'}</p>
                <p>{'// Speed bonus for answering under 2s.'}</p>
                <p>&nbsp;</p>
                <p>{'// REVERSE CHALLENGE:'}</p>
                <p>{'// A key combination appears on screen.'}</p>
                <p>{'// Select what action it performs.'}</p>
                <p>{'// 4 options — only one is correct.'}</p>
                <p>&nbsp;</p>
                <p>{'// SOFTWARE GAUNTLET:'}</p>
                <p>{'// Complete 10 shortcuts from one app.'}</p>
                <p>{'// Score 80%+ to earn the app badge.'}</p>
                <p>{'// Each session uses different shortcuts'}</p>
                <p>{'// from a bank of 35-40 per software.'}</p>
                <p>&nbsp;</p>
                <p>{'// TIPS:'}</p>
                <p>{'// Start with Windows or Mac basics'}</p>
                <p>{'// Practice Sprint mode daily'}</p>
                <p>{'// On-screen keyboard shows key positions'}</p>
                <p>{'// Earn all 6 badges to master them all'}</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Browser notice ───────────────────────────────── */}
      {stage === 'playing' && (
        <p className={`text-zinc-600 text-xs font-mono mb-1 transition-opacity duration-700 ${browserNotice ? 'opacity-100' : 'opacity-0'}`}>
          ⚠ Browser shortcuts disabled during game
        </p>
      )}

      {/* ── Sprint mode ──────────────────────────────────── */}
      {stage === 'playing' && mode === 'sprint' && software && (
        <SprintMode
          software={software}
          difficulty={difficulty}
          os={os}
          showKeyboard={showKeyboard}
          onQuit={handleQuit}
          onFinish={handleFinish}
        />
      )}

      {/* ── Reverse Challenge ────────────────────────────── */}
      {stage === 'playing' && mode === 'reverse' && software && (
        <ReverseMode
          software={software}
          difficulty={difficulty}
          os={os}
          onQuit={handleQuit}
          onFinish={handleFinish}
        />
      )}

      {/* ── Software Gauntlet ────────────────────────────── */}
      {stage === 'playing' && mode === 'gauntlet' && software && (
        <SprintMode
          software={software}
          difficulty={difficulty}
          os={os}
          showKeyboard={showKeyboard}
          onQuit={handleQuit}
          onFinish={handleFinish}
          gauntlet
        />
      )}

      {/* ── Results ──────────────────────────────────────── */}
      {stage === 'results' && gameResult && mode && software && (
        <ResultsScreen
          score={gameResult.score}
          correct={gameResult.correct}
          total={gameResult.total}
          mode={mode}
          software={software}
          difficulty={difficulty}
          badges={badges}
          newBadge={gameResult.newBadge}
          onPlayAgain={() => { setStage('playing'); setGameResult(null) }}
          onChangeMode={handleQuit}
        />
      )}
    </div>
  )
}
