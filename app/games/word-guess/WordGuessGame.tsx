'use client'

import { useState, useEffect, useRef } from 'react'
import { BookOpen, Maximize2, Minimize2, X } from 'lucide-react'
import {
  getMaxAttempts,
  getWordByLength,
  getSpeedWords,
  checkGuess,
} from '@/data/wordGuessWords'
import type { WordGuessMode, GuessRow, LetterState } from '@/types/wordGuess'

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = 'short' | 'standard' | 'long' | 'expert'
type GameStage  = 'setup' | 'playing' | 'results'

interface DifficultyConfig {
  label:  string
  range:  string
  minLen: number
  maxLen: number
  color:  string
}

interface Stats {
  total:         number
  wins:          number
  streak:        number
  currentStreak: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERIF = { fontFamily: 'Georgia, serif' }

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  short:    { label: 'Short',    range: '4–5 letters',  minLen: 4, maxLen: 5,  color: 'bg-emerald-700' },
  standard: { label: 'Standard', range: '5–6 letters',  minLen: 5, maxLen: 6,  color: 'bg-amber-700'   },
  long:     { label: 'Long',     range: '7–8 letters',  minLen: 7, maxLen: 8,  color: 'bg-orange-700'  },
  expert:   { label: 'Expert',   range: '9–10 letters', minLen: 9, maxLen: 10, color: 'bg-rose-800'    },
}

const MODE_OPTIONS = [
  { id: 'classic' as WordGuessMode, emoji: '📖', name: 'Word Classic', desc: 'Guess the hidden word letter by letter' },
  { id: 'speed'   as WordGuessMode, emoji: '⚡', name: 'Speed Guess',  desc: '5 words. 2 minutes. Race the clock.' },
] as const

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

const SPEED_INITIAL_TIME = 120
const CORRECT_TIME_BONUS = 15
const SPEED_WORD_COUNT   = 20
const POINTS_PER_WORD    = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCellMeta(wordLen: number): { size: number; textCls: string } {
  if (wordLen <= 5) return { size: 52, textCls: 'text-2xl' }
  if (wordLen <= 7) return { size: 46, textCls: 'text-xl'  }
  if (wordLen <= 9) return { size: 40, textCls: 'text-lg'  }
  return                   { size: 36, textCls: 'text-base' }
}

function revealedCls(state: LetterState): string {
  if (state === 'correct')        return 'bg-emerald-600 border-emerald-500 text-white'
  if (state === 'wrong-position') return 'bg-amber-600   border-amber-500   text-white'
  return                                 'bg-stone-700   border-stone-600   text-stone-300'
}

function keyCls(state: LetterState | 'unused'): string {
  if (state === 'correct')        return 'bg-emerald-600 text-white'
  if (state === 'wrong-position') return 'bg-amber-600   text-white'
  if (state === 'incorrect')      return 'bg-stone-800   text-stone-500'
  return                                 'bg-stone-700   text-stone-200'
}

function makeEmptyGuesses(attempts: number, wordLen: number): GuessRow[] {
  return Array.from({ length: attempts }, () => ({
    letters: Array.from({ length: wordLen }, () => ({
      letter: '',
      state: 'empty' as LetterState,
    })),
    isComplete: false,
  }))
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WordGuessGame() {
  const cardRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── UI ──────────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [stage,        setStage]        = useState<GameStage>('setup')
  const [showGuide,    setShowGuide]    = useState(false)

  // ── Setup ────────────────────────────────────────────────────────────────
  const [mode,       setMode]       = useState<WordGuessMode>('classic')
  const [difficulty, setDifficulty] = useState<Difficulty>('standard')

  // ── Classic game ──────────────────────────────────────────────────────────
  const [currentWord,  setCurrentWord]  = useState('')
  const [guesses,      setGuesses]      = useState<GuessRow[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [currentRow,   setCurrentRow]   = useState(0)
  const [maxAttempts,  setMaxAttempts]  = useState(6)
  const [gameWon,      setGameWon]      = useState(false)
  const [gameLost,     setGameLost]     = useState(false)
  const [keyStates,    setKeyStates]    = useState<Record<string, LetterState>>({})
  const [shakingRow,   setShakingRow]   = useState(-1)
  const [revealRow,    setRevealRow]    = useState(-1)
  const [invalidWord,  setInvalidWord]  = useState(false)
  const [popIndex,     setPopIndex]     = useState(-1)

  // ── Speed game ────────────────────────────────────────────────────────────
  const [speedWords,     setSpeedWords]     = useState<string[]>([])
  const [speedIdx,       setSpeedIdx]       = useState(0)
  const [timeLeft,       setTimeLeft]       = useState(SPEED_INITIAL_TIME)
  const [speedScore,     setSpeedScore]     = useState(0)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [speedGuess,     setSpeedGuess]     = useState('')
  const [speedFeedback,  setSpeedFeedback]  = useState<LetterState[]>([])
  const [showFeedback,   setShowFeedback]   = useState(false)
  const [showTimeBonus,  setShowTimeBonus]  = useState(false)
  const [lastGuessLetters, setLastGuessLetters] = useState<string[]>([])

  // ── Stats ────────────────────────────────────────────────────────────────
  const [stats,     setStats]     = useState<Stats | null>(null)
  const [bestSpeed, setBestSpeed] = useState<number | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(false)

  // ── Load persisted data ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wg_stats')
      if (raw) setStats(JSON.parse(raw) as Stats)
      const bestRaw = localStorage.getItem('wg_best_speed')
      if (bestRaw) setBestSpeed(parseInt(bestRaw))
    } catch {}
  }, [])

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) document.exitFullscreen?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  function toggleFullscreen() {
    if (!document.fullscreenElement) cardRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  // ── Speed timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'speed') return
    if (stage !== 'playing') return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setStage('results')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [stage, mode])

  // ── Focus speed input when word changes ────────────────────────────────
  useEffect(() => {
    if (stage === 'playing' && mode === 'speed') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [speedIdx, stage, mode])

  // ── Save speed best on results ─────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'results' || mode !== 'speed') return
    try {
      const raw  = localStorage.getItem('wg_best_speed')
      const prev = raw ? parseInt(raw) : 0
      if (speedScore > prev) {
        localStorage.setItem('wg_best_speed', String(speedScore))
        setBestSpeed(speedScore)
        setIsNewRecord(true)
      } else {
        setBestSpeed(prev)
        setIsNewRecord(false)
      }
    } catch {}
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Classic keyboard listener ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (stage !== 'playing' || mode !== 'classic') return
      if (gameWon || gameLost) return
      if (e.key === 'Enter')              submitGuess()
      else if (e.key === 'Backspace')     deleteLetter()
      else if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, mode, currentGuess, currentRow, gameWon, gameLost, guesses, keyStates])

  // ── Derived ───────────────────────────────────────────────────────────────
  const cfg            = DIFFICULTIES[difficulty]
  const maxAttemptsCfg = getMaxAttempts(cfg.maxLen)
  const winPct         = stats && stats.total > 0
    ? Math.round((stats.wins / stats.total) * 100) : 0
  const { size: cellSize, textCls } = getCellMeta(currentWord.length || 5)
  const currentSpeedWord = speedWords[speedIdx] ?? ''

  const timeColorCls = timeLeft > 60 ? 'text-amber-200'
    : timeLeft > 30 ? 'text-yellow-300' : 'text-rose-400'
  const timeSizeCls  = timeLeft <= 10 ? 'text-5xl' : 'text-4xl'
  const timePulseCls = timeLeft < 30  ? 'animate-pulse' : ''

  // ── Start game ────────────────────────────────────────────────────────────
  function startGame() {
    setIsNewRecord(false)
    if (mode === 'classic') {
      const word     = getWordByLength(cfg.minLen, cfg.maxLen)
      const attempts = getMaxAttempts(word.length)
      setCurrentWord(word)
      setMaxAttempts(attempts)
      setGuesses(makeEmptyGuesses(attempts, word.length))
      setCurrentGuess('')
      setCurrentRow(0)
      setGameWon(false)
      setGameLost(false)
      setKeyStates({})
      setShakingRow(-1)
      setRevealRow(-1)
      setInvalidWord(false)
      setPopIndex(-1)
    } else {
      const words = getSpeedWords(SPEED_WORD_COUNT)
      setSpeedWords(words)
      setSpeedIdx(0)
      setTimeLeft(SPEED_INITIAL_TIME)
      setSpeedScore(0)
      setWordsCompleted(0)
      setSpeedGuess('')
      setSpeedFeedback([])
      setShowFeedback(false)
      setShowTimeBonus(false)
      setLastGuessLetters([])
    }
    setStage('playing')
  }

  function resetToSetup() {
    setStage('setup')
    setCurrentWord('')
    setGuesses([])
    setCurrentGuess('')
    setCurrentRow(0)
    setGameWon(false)
    setGameLost(false)
    setKeyStates({})
  }

  // ── Classic game logic ────────────────────────────────────────────────────

  function addLetter(letter: string) {
    if (currentGuess.length >= currentWord.length) return
    const idx = currentGuess.length
    setPopIndex(idx)
    setTimeout(() => setPopIndex(-1), 120)
    setCurrentGuess(prev => prev + letter)
  }

  function deleteLetter() {
    setCurrentGuess(prev => prev.slice(0, -1))
  }

  function saveClassicStats(won: boolean) {
    try {
      const raw  = localStorage.getItem('wg_stats')
      const prev: Stats = raw
        ? (JSON.parse(raw) as Stats)
        : { total: 0, wins: 0, streak: 0, currentStreak: 0 }
      const newCurrent = won ? prev.currentStreak + 1 : 0
      const next: Stats = {
        total:         prev.total + 1,
        wins:          won ? prev.wins + 1 : prev.wins,
        streak:        Math.max(prev.streak, newCurrent),
        currentStreak: newCurrent,
      }
      setStats(next)
      localStorage.setItem('wg_stats', JSON.stringify(next))
    } catch {}
  }

  function submitGuess() {
    if (currentGuess.length < currentWord.length) {
      setShakingRow(currentRow)
      setInvalidWord(true)
      setTimeout(() => { setShakingRow(-1); setInvalidWord(false) }, 1500)
      return
    }
    const states = checkGuess(currentGuess, currentWord)
    const newGuesses = guesses.map((r, i) =>
      i === currentRow
        ? { letters: currentGuess.split('').map((l, j) => ({ letter: l, state: states[j] })), isComplete: true }
        : r,
    )
    setGuesses(newGuesses)
    setRevealRow(currentRow)

    const newKeys = { ...keyStates }
    currentGuess.split('').forEach((l, i) => {
      const existing = newKeys[l]; const next = states[i]
      if (existing === 'correct') return
      if (existing === 'wrong-position' && next !== 'correct') return
      newKeys[l] = next
    })
    setKeyStates(newKeys)

    const won   = states.every(s => s === 'correct')
    const delay = currentWord.length * 150 + 200

    setTimeout(() => {
      if (won) {
        saveClassicStats(true)
        setGameWon(true)
        setStage('results')
      } else if (currentRow >= maxAttempts - 1) {
        saveClassicStats(false)
        setGameLost(true)
        setStage('results')
      } else {
        setCurrentRow(r => r + 1)
        setCurrentGuess('')
      }
    }, delay)
  }

  // ── Speed game logic ──────────────────────────────────────────────────────

  function checkSpeedGuess() {
    const word = currentSpeedWord
    if (!word || speedGuess.length < word.length) return

    const states = checkGuess(speedGuess, word)
    setLastGuessLetters(speedGuess.split(''))
    setSpeedFeedback(states)
    setShowFeedback(true)

    const isCorrect = states.every(s => s === 'correct')

    if (isCorrect) {
      setSpeedScore(prev => prev + POINTS_PER_WORD)
      setWordsCompleted(prev => prev + 1)
      setTimeLeft(prev => prev + CORRECT_TIME_BONUS)
      setShowTimeBonus(true)
      setTimeout(() => {
        setShowTimeBonus(false)
        setShowFeedback(false)
        setSpeedIdx(prev => {
          if (prev >= speedWords.length - 1) {
            setStage('results')
            return prev
          }
          return prev + 1
        })
        setSpeedGuess('')
      }, 600)
    } else {
      setTimeout(() => {
        setShowFeedback(false)
        setSpeedGuess('')
      }, 800)
    }
  }

  function skipWord() {
    setShowFeedback(false)
    setSpeedGuess('')
    setSpeedFeedback([])
    setLastGuessLetters([])
    if (speedIdx >= speedWords.length - 1) {
      setStage('results')
      return
    }
    setSpeedIdx(prev => prev + 1)
  }

  // ── Classic cell render ───────────────────────────────────────────────────

  function renderCell(rowIdx: number, colIdx: number) {
    const row          = guesses[rowIdx]
    const isCurrentRow = rowIdx === currentRow && stage === 'playing'
    const isRevealRow  = rowIdx === revealRow
    let cls   = `border-2 rounded-lg flex items-center justify-center font-bold font-mono uppercase transition-all duration-100 ${textCls} `
    let content: string = ''
    let animStyle: React.CSSProperties = {}

    if (row.isComplete) {
      content = row.letters[colIdx].letter
      cls    += revealedCls(row.letters[colIdx].state)
      if (isRevealRow) {
        cls      += ' cell-flip'
        animStyle = { animationDelay: `${colIdx * 150}ms` }
      }
    } else if (isCurrentRow) {
      const letter = currentGuess[colIdx] ?? ''
      content      = letter
      if (letter) {
        cls += `border-amber-400/80 bg-amber-950/20 text-amber-100${colIdx === popIndex ? ' cell-pop' : ''}`
      } else {
        cls += 'border-amber-600/60 bg-transparent text-transparent'
      }
    } else {
      cls += 'border-amber-900/30 bg-transparent text-transparent'
    }

    return (
      <div
        key={`${rowIdx}-${colIdx}`}
        className={cls}
        style={{ width: cellSize, height: cellSize, ...animStyle }}
      >
        {content}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={cardRef}
      id="original-game-card"
      className="flex flex-col rounded-2xl word-guess-card overflow-hidden bg-gradient-to-b from-emerald-950 to-stone-950"
      style={{
        height: 'calc(100vh - 100px)',
        minHeight: '580px',
        boxShadow:
          '0 0 0 1px rgba(217,181,112,0.3), ' +
          '0 0 30px rgba(217,181,112,0.06), ' +
          '0 25px 50px rgba(0,0,0,0.6)',
      }}
    >

      {/* ── Title Row ──────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <span className="text-2xl font-bold text-amber-100" style={SERIF}>Word Guess</span>
        </div>
        <div className="flex items-center gap-2">
          {stage !== 'setup' && (
            <button
              onClick={resetToSetup}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" /> Quit
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/10 p-1.5 text-amber-300 transition-colors hover:bg-white/20"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="h-px shrink-0 bg-amber-900/20" />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SETUP                                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {stage === 'setup' && (
        <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-4">

          <p className="mb-5 text-center text-xs uppercase tracking-[0.5em] text-amber-800/50" style={SERIF}>
            Word Guess
          </p>

          <div className="grid grid-cols-2 gap-3">
            {MODE_OPTIONS.map(m => {
              const selected = mode === m.id
              return (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`rounded-2xl p-5 transition-all duration-200 ${
                    selected
                      ? 'border-2 border-amber-500 bg-amber-950/60 shadow-lg shadow-amber-500/15'
                      : 'border border-amber-900/30 bg-black/20 hover:border-amber-600/50 hover:bg-black/30'
                  }`}>
                  <div className="text-center text-4xl">{m.emoji}</div>
                  <p className="mt-2 text-center text-base font-bold text-amber-100" style={SERIF}>{m.name}</p>
                  <p className="mt-1 text-center text-xs text-amber-700/70">{m.desc}</p>
                </button>
              )
            })}
          </div>

          {mode === 'classic' && (
            <>
              <p className="mb-2 mt-5 text-center text-xs uppercase tracking-widest text-amber-700/60">Difficulty</p>
              <div className="flex justify-center gap-2">
                {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultyConfig][]).map(([key, dc]) => {
                  const sel = difficulty === key
                  return (
                    <button key={key} onClick={() => setDifficulty(key)}
                      className={`rounded-full px-3 py-1 text-xs transition-all duration-150 ${
                        sel
                          ? `${dc.color} font-semibold text-white`
                          : 'border border-amber-900/30 bg-black/20 text-amber-700/60 hover:border-amber-700/50'
                      }`}>
                      {dc.label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1 text-center text-xs text-amber-800/50">
                {cfg.range} · Up to {maxAttemptsCfg} attempts
              </p>
            </>
          )}

          {stats && stats.total > 0 && (
            <div className="mt-3 space-y-0.5">
              <p className="text-center text-xs text-amber-800/50">Played: {stats.total} | Won: {winPct}%</p>
              {stats.streak > 0 && (
                <p className="text-center text-xs text-amber-700/40">Best streak: {stats.streak}</p>
              )}
              {bestSpeed !== null && bestSpeed > 0 && (
                <p className="text-center text-xs text-amber-700/40">⚡ Speed best: {bestSpeed} pts</p>
              )}
            </div>
          )}

          <button onClick={startGame}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-700 to-yellow-700 py-3 text-sm font-bold text-white shadow-lg shadow-amber-700/25 transition-all hover:from-amber-600 hover:to-yellow-600"
            style={SERIF}>
            ▶ Start Game
          </button>

          <div className="mt-2 text-center">
            <button onClick={() => setShowGuide(g => !g)} className="text-xs text-amber-800/50 underline" style={SERIF}>
              {showGuide ? 'Hide guide' : 'How to Play'}
            </button>
          </div>

          {showGuide && (
            <div className="mt-2 rounded-xl border border-amber-900/20 bg-black/20 p-4 text-xs leading-relaxed text-amber-600/70">
              <p>Type letters to guess the hidden word.</p>
              <p className="mt-2">🟩 Green — correct letter, correct position</p>
              <p>🟨 Yellow — correct letter, wrong position</p>
              <p>⬛ Gray — letter not in the word</p>
              <p className="mt-2">Longer words get more attempts.</p>
              <p className="mt-1">Speed Guess: solve words in 2 minutes. Each correct word earns 15 seconds back.</p>
            </div>
          )}

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* CLASSIC PLAYING                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {stage === 'playing' && mode === 'classic' && (
        <div className="relative flex flex-1 flex-col overflow-hidden">

          {invalidWord && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-800 px-3 py-2 text-xs text-amber-200">
              Not enough letters
            </div>
          )}

          <p className="shrink-0 pt-2 text-center font-mono text-xs tracking-[0.3em] text-amber-700/40">
            {Array(currentWord.length).fill('_').join(' ')}
          </p>

          <div className="flex flex-1 items-center justify-center p-2">
            <div className="flex flex-col" style={{ gap: '4px' }}>
              {guesses.map((_, rowIdx) => (
                <div key={rowIdx} className={`flex ${shakingRow === rowIdx ? 'row-shake' : ''}`} style={{ gap: '4px' }}>
                  {Array.from({ length: currentWord.length }, (__, colIdx) => renderCell(rowIdx, colIdx))}
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 space-y-1 px-2 pb-3">
            {KB_ROWS.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-1">
                {row.map(key => {
                  const isWide = key === 'ENTER' || key === '⌫'
                  const kState = (key.length === 1 ? keyStates[key] : undefined) ?? 'unused'
                  return (
                    <button key={key}
                      onClick={() => {
                        if (key === 'ENTER') submitGuess()
                        else if (key === '⌫') deleteLetter()
                        else addLetter(key)
                      }}
                      className={`rounded-lg py-3 font-bold font-mono transition-colors ${keyCls(kState)} ${
                        isWide ? 'min-w-[48px] px-2 text-xs' : 'min-w-[32px] px-1 text-sm'
                      }`}
                      aria-label={key === '⌫' ? 'Backspace' : key}>
                      {key}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SPEED PLAYING                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {stage === 'playing' && mode === 'speed' && (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-6 py-4">

          {/* +15s bonus */}
          {showTimeBonus && (
            <div className="pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2 float-up font-mono text-xl font-bold text-emerald-400">
              +15s
            </div>
          )}

          {/* Timer */}
          <div className="relative text-center">
            <p className={`font-mono font-bold ${timeColorCls} ${timeSizeCls} ${timePulseCls}`}>
              {formatTime(timeLeft)}
            </p>
          </div>

          {/* Progress + score */}
          <div className="space-y-0.5 text-center">
            <p className="text-xs text-amber-700/60">{wordsCompleted} words solved</p>
            <p className="text-sm font-bold text-amber-400">{speedScore} pts</p>
          </div>

          {/* Word length indicator */}
          <p className="font-mono text-xs tracking-[0.4em] text-amber-600/50">
            {Array(currentSpeedWord.length).fill('_').join(' ')}
          </p>

          {/* Last guess feedback */}
          {showFeedback && speedFeedback.length > 0 && (
            <div className="flex gap-1">
              {lastGuessLetters.map((letter, i) => (
                <div key={i}
                  className={`flex items-center justify-center rounded border-2 font-mono text-sm font-bold uppercase ${revealedCls(speedFeedback[i])}`}
                  style={{ width: 32, height: 32 }}>
                  {letter}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={speedGuess}
            maxLength={currentSpeedWord.length}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={e => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
              if (val.length <= currentSpeedWord.length) setSpeedGuess(val)
            }}
            onKeyDown={e => { if (e.key === 'Enter') checkSpeedGuess() }}
            className="border-b-2 border-amber-700/50 bg-transparent text-center font-mono text-3xl font-bold uppercase tracking-[0.3em] text-amber-100 outline-none transition-colors focus:border-amber-400"
            style={{ width: `${Math.max(currentSpeedWord.length * 36, 120)}px` }}
          />

          <button onClick={skipWord} className="text-xs text-amber-800/50 underline">
            skip word →
          </button>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* CLASSIC RESULTS                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {stage === 'results' && mode === 'classic' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-6">

          {gameWon ? (
            <>
              <div className="text-4xl text-center text-emerald-400">✓</div>
              <p className="text-xl font-bold text-amber-100 text-center" style={SERIF}>You got it!</p>
            </>
          ) : (
            <p className="text-sm text-amber-700/70 text-center" style={SERIF}>The word was:</p>
          )}

          <div className="flex gap-1.5">
            {currentWord.split('').map((letter, i) => (
              <div key={i}
                className={`flex items-center justify-center rounded-lg border-2 font-bold font-mono text-xl uppercase ${
                  gameWon
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-stone-600   bg-stone-700   text-stone-300'
                }`}
                style={{ width: 44, height: 44 }}>
                {letter}
              </div>
            ))}
          </div>

          {gameWon && (
            <p className="text-sm text-amber-600/70 text-center">
              In {currentRow + 1} of {maxAttempts} {maxAttempts === 1 ? 'guess' : 'guesses'}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button onClick={startGame}
              className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-700 px-6 py-2 text-sm font-bold text-white transition-all hover:from-amber-600 hover:to-yellow-600">
              Play Again
            </button>
            <button onClick={resetToSetup}
              className="rounded-xl border border-amber-800/30 bg-black/20 px-6 py-2 text-sm text-amber-400/70 transition-colors hover:bg-black/40">
              Change Mode
            </button>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SPEED RESULTS                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {stage === 'results' && mode === 'speed' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-6">

          <p className="text-2xl font-bold text-amber-100 text-center" style={SERIF}>⚡ Speed Complete!</p>

          {isNewRecord && (
            <p className="text-sm font-bold text-emerald-400 text-center">⚡ New Speed Record!</p>
          )}

          <div className="space-y-1 text-center">
            <p className="text-base text-amber-200">
              Words solved: <span className="font-bold">{wordsCompleted}</span>
              <span className="text-amber-700/60"> / {speedWords.length}</span>
            </p>
            <p className="text-2xl font-bold text-amber-400" style={SERIF}>{speedScore} pts</p>
            {timeLeft > 0 && (
              <p className="text-xs text-amber-700/60">Time remaining: {formatTime(timeLeft)}</p>
            )}
            {bestSpeed !== null && !isNewRecord && bestSpeed > 0 && (
              <p className="text-xs text-amber-700/40">Best: {bestSpeed} pts</p>
            )}
          </div>

          <div className="mt-2 flex gap-3">
            <button onClick={startGame}
              className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-700 px-6 py-2 text-sm font-bold text-white transition-all hover:from-amber-600 hover:to-yellow-600">
              Play Again
            </button>
            <button onClick={resetToSetup}
              className="rounded-xl border border-amber-800/30 bg-black/20 px-6 py-2 text-sm text-amber-400/70 transition-colors hover:bg-black/40">
              Change Mode
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
