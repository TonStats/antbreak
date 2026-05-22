'use client'

import { useState, useEffect, useRef } from 'react'
import { Chess, type Move, type Square, type PieceSymbol } from 'chess.js'
import { BookOpen, Crown, Flame, Infinity as InfinityIcon, Maximize2, Minimize2, Play, Timer, Zap } from 'lucide-react'
import { ChessPiece } from '@/components/chess/ChessPiece'

// ── Types ─────────────────────────────────────────────────────────────────────

type Difficulty  = 'easy' | 'medium' | 'hard'
type ChessColor  = 'w' | 'b'
type Stage       = 'setup' | 'playing' | 'gameover'
type Outcome      = 'win' | 'loss' | 'draw' | 'resign'
type TimeControl  = 'bullet' | 'blitz' | 'rapid' | 'unlimited'

interface GameResult {
  outcome:    Outcome
  reason:     string
  totalMoves: number
}

interface SavedGame {
  fen:          string
  difficulty:   Difficulty
  playerColor:  ChessColor
  timeControl?: TimeControl
  playerTime?:  number | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PIECE_VALS: Record<PieceSymbol, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
}

const CENTER_SQS = new Set<string>(['d4', 'd5', 'e4', 'e5'])

const DIFF_CFG: Record<Difficulty, { label: string; emoji: string; desc: string; sel: string }> = {
  easy:   { label: 'Easy',   emoji: '🤖', desc: 'Random moves',  sel: 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/25' },
  medium: { label: 'Medium', emoji: '⚡', desc: 'Basic strategy', sel: 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/25' },
  hard:   { label: 'Hard',   emoji: '🔥', desc: 'Advanced play',  sel: 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-500/25' },
}

const TIME_CFG: Record<TimeControl, { label: string; sub: string; seconds: number | null; sel: string }> = {
  bullet:    { label: 'Bullet',    sub: '2 min',    seconds: 120,  sel: 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/25' },
  blitz:     { label: 'Blitz',     sub: '5 min',    seconds: 300,  sel: 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/25' },
  rapid:     { label: 'Rapid',     sub: '10 min',   seconds: 600,  sel: 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/25' },
  unlimited: { label: 'Unlimited', sub: 'No limit', seconds: null, sel: 'bg-zinc-400 border-zinc-300 text-zinc-900 shadow-lg shadow-zinc-400/25' },
}

const PIECE_START: Partial<Record<PieceSymbol, number>> = { p: 8, n: 2, b: 2, r: 2, q: 1 }
const CAP_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p']

type BoardSnapshot = ReturnType<Chess['board']>

function getCaptured(board: BoardSnapshot, capturedColor: ChessColor): PieceSymbol[] {
  const onBoard: Partial<Record<PieceSymbol, number>> = {}
  for (const row of board) for (const sq of row) {
    if (sq?.color === capturedColor) onBoard[sq.type] = (onBoard[sq.type] ?? 0) + 1
  }
  const caps: PieceSymbol[] = []
  for (const t of CAP_ORDER)
    for (let i = 0; i < (PIECE_START[t] ?? 0) - (onBoard[t] ?? 0); i++) caps.push(t)
  return caps
}

// ── AI ────────────────────────────────────────────────────────────────────────

function evalBoard(chess: Chess): number {
  let score = 0
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq) continue
      const val = PIECE_VALS[sq.type] + (CENTER_SQS.has(sq.square) ? 10 : 0)
      score += sq.color === 'w' ? val : -val
    }
  }
  return score
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || chess.isGameOver()) return evalBoard(chess)
  const moves = chess.moves()
  if (maximizing) {
    let best = -Infinity
    for (const m of moves) {
      chess.move(m); const v = minimax(chess, depth - 1, alpha, beta, false); chess.undo()
      if (v > best) best = v
      if (v > alpha) alpha = v
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      chess.move(m); const v = minimax(chess, depth - 1, alpha, beta, true); chess.undo()
      if (v < best) best = v
      if (v < beta) beta = v
      if (beta <= alpha) break
    }
    return best
  }
}

function pickMove(chess: Chess, diff: Difficulty, aiColor: ChessColor): string | null {
  const moves = chess.moves()
  if (!moves.length) return null
  if (diff === 'easy') return moves[Math.floor(Math.random() * moves.length)]
  if (diff === 'medium') {
    const vMoves = chess.moves({ verbose: true })
    const caps = vMoves
      .filter((m): m is Move & { captured: PieceSymbol } => !!m.captured)
      .sort((a, b) => PIECE_VALS[b.captured] - PIECE_VALS[a.captured])
    if (caps.length) return caps[0].san
    return moves[Math.floor(Math.random() * moves.length)]
  }
  // Hard: minimax depth 3
  const maximize = aiColor === 'w'
  let best = maximize ? -Infinity : Infinity
  let bestMove = moves[0]
  for (const m of moves) {
    chess.move(m)
    const score = minimax(chess, 2, -Infinity, Infinity, !maximize)
    chess.undo()
    if (maximize ? score > best : score < best) { best = score; bestMove = m }
  }
  return bestMove
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function triggerConfetti(): () => void {
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  const colors = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F472B6', '#FB7185']
  const particles = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width, y: -Math.random() * 300,
    w: 4 + Math.random() * 8, h: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    vy: 2.5 + Math.random() * 3, vx: (Math.random() - 0.5) * 2.5,
    rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15,
  }))
  const endTime = Date.now() + 3000
  let animId: number
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const remaining = endTime - Date.now()
    for (const p of particles) {
      p.y += p.vy; p.x += p.vx; p.rotation += p.rotSpeed
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.globalAlpha = remaining < 1000 ? Math.max(0, remaining / 1000) : 1
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore()
    }
    if (remaining > 0) animId = requestAnimationFrame(frame)
    else if (canvas.parentNode) canvas.remove()
  }
  animId = requestAnimationFrame(frame)
  return () => { cancelAnimationFrame(animId); if (canvas.parentNode) canvas.remove() }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChessGame() {
  const [stage,        setStage]        = useState<Stage>('setup')
  const [difficulty,   setDifficulty]   = useState<Difficulty>('easy')
  const [playerColor,  setPlayerColor]  = useState<ChessColor>('w')
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [selectedSq,   setSelectedSq]   = useState<string | null>(null)
  const [legalDests,   setLegalDests]   = useState<string[]>([])
  const [isThinking,   setIsThinking]   = useState(false)
  const [checkedSq,    setCheckedSq]    = useState<string | null>(null)
  const [gameResult,   setGameResult]   = useState<GameResult | null>(null)
  const [savedGame,    setSavedGame]    = useState<SavedGame | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timeControl,  setTimeControl]  = useState<TimeControl>('rapid')
  const [playerTime,   setPlayerTime]   = useState<number | null>(600)

  const [, setBoardVer] = useState(0)
  const bumpBoard = () => setBoardVer(v => v + 1)

  const chess         = useRef(new Chess())
  const containerRef  = useRef<HTMLDivElement>(null)
  const confettiRef   = useRef<(() => void) | null>(null)
  const aiTimer       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clockRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const playerTimeRef = useRef<number | null>(600)

  // ── Derived ────────────────────────────────────────────────────────────────

  const board   = chess.current.board()
  const history = chess.current.history()

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const raw = localStorage.getItem('chess_saved_game')
    if (raw) { try { setSavedGame(JSON.parse(raw)) } catch {} }
  }, [])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  useEffect(() => () => {
    confettiRef.current?.()
    if (aiTimer.current) clearTimeout(aiTimer.current)
    if (clockRef.current) clearInterval(clockRef.current)
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function stopClock() {
    if (clockRef.current !== null) { clearInterval(clockRef.current); clockRef.current = null }
  }

  function initClock(tc: TimeControl, pColor: ChessColor, pTime?: number | null) {
    stopClock()
    const pt = pTime !== undefined ? pTime : TIME_CFG[tc].seconds
    playerTimeRef.current = pt
    setPlayerTime(pt)
    if (pt === null) return  // unlimited — no countdown
    clockRef.current = setInterval(() => {
      if (chess.current.turn() !== pColor) return  // AI's turn — player clock paused
      const next = playerTimeRef.current !== null ? Math.max(0, playerTimeRef.current - 1) : null
      playerTimeRef.current = next; setPlayerTime(next)
      if (next === 0) {
        stopClock()
        localStorage.removeItem('chess_saved_game'); setSavedGame(null)
        setGameResult({ outcome: 'loss', reason: "Time's Up", totalMoves: chess.current.history().length })
        setStage('gameover')
      }
    }, 1000)
  }

  function persist(diff: Difficulty, pColor: ChessColor) {
    localStorage.setItem('chess_saved_game', JSON.stringify({
      fen: chess.current.fen(),
      difficulty: diff,
      playerColor: pColor,
      timeControl,
      playerTime: playerTimeRef.current,
    }))
  }

  function updateCheck() {
    if (chess.current.inCheck()) {
      const king = chess.current.board().flat().find(
        s => s?.type === 'k' && s.color === chess.current.turn()
      )
      setCheckedSq(king?.square ?? null)
    } else {
      setCheckedSq(null)
    }
  }

  function resolveGameOver(diff: Difficulty, pColor: ChessColor): boolean {
    const c = chess.current
    if (!c.isGameOver()) return false
    stopClock()
    const totalMoves = c.history().length
    localStorage.removeItem('chess_saved_game'); setSavedGame(null)
    if (c.isCheckmate()) {
      const playerWon = c.turn() !== pColor
      if (playerWon) { confettiRef.current?.(); confettiRef.current = triggerConfetti() }
      setGameResult({ outcome: playerWon ? 'win' : 'loss', reason: 'Checkmate', totalMoves })
    } else if (c.isStalemate()) {
      setGameResult({ outcome: 'draw', reason: 'Stalemate', totalMoves })
    } else if (c.isThreefoldRepetition()) {
      setGameResult({ outcome: 'draw', reason: 'Threefold Repetition', totalMoves })
    } else {
      setGameResult({ outcome: 'draw', reason: 'Draw', totalMoves })
    }
    setStage('gameover')
    return true
  }

  function doAIMove(diff: Difficulty, pColor: ChessColor) {
    const aiColor: ChessColor = pColor === 'w' ? 'b' : 'w'
    setIsThinking(true)
    aiTimer.current = setTimeout(() => {
      const move = pickMove(chess.current, diff, aiColor)
      if (move) {
        try { chess.current.move(move) } catch {}
        bumpBoard(); persist(diff, pColor); updateCheck(); resolveGameOver(diff, pColor)
      }
      setIsThinking(false)
    }, diff === 'hard' ? 400 : 300)
  }

  // ── Game flow ──────────────────────────────────────────────────────────────

  function startGame(diff: Difficulty, pColor: ChessColor, tc: TimeControl) {
    if (aiTimer.current) clearTimeout(aiTimer.current)
    confettiRef.current?.(); confettiRef.current = null
    chess.current = new Chess()
    setBoardVer(0); setSelectedSq(null); setLegalDests([])
    setCheckedSq(null); setGameResult(null); setIsThinking(false)
    setBoardFlipped(pColor === 'b')
    initClock(tc, pColor)
    setStage('playing')
    if (pColor === 'b') doAIMove(diff, pColor)
  }

  function resumeGame(saved: SavedGame) {
    if (aiTimer.current) clearTimeout(aiTimer.current)
    confettiRef.current?.(); confettiRef.current = null
    chess.current = new Chess()
    chess.current.load(saved.fen)
    setDifficulty(saved.difficulty); setPlayerColor(saved.playerColor)
    setBoardFlipped(saved.playerColor === 'b')
    bumpBoard(); setSelectedSq(null); setLegalDests([])
    setIsThinking(false); setGameResult(null)
    updateCheck()
    const tc = saved.timeControl ?? 'unlimited'
    const pt = saved.playerTime !== undefined ? saved.playerTime : TIME_CFG[tc].seconds
    setTimeControl(tc)
    initClock(tc, saved.playerColor, pt)
    setStage('playing')
    const aiColor: ChessColor = saved.playerColor === 'w' ? 'b' : 'w'
    if (chess.current.turn() === aiColor && !chess.current.isGameOver()) {
      doAIMove(saved.difficulty, saved.playerColor)
    }
  }

  function handleQuit() {
    if (aiTimer.current) clearTimeout(aiTimer.current)
    stopClock()
    setIsThinking(false)
    localStorage.removeItem('chess_saved_game'); setSavedGame(null)
    setGameResult({ outcome: 'resign', reason: 'Resigned', totalMoves: history.length })
    setStage('gameover')
  }

  // ── Board interaction ──────────────────────────────────────────────────────

  function handleSquareClick(sq: string) {
    if (stage !== 'playing' || isThinking || chess.current.turn() !== playerColor) return
    if (selectedSq === sq) { setSelectedSq(null); setLegalDests([]); return }
    if (selectedSq && legalDests.includes(sq)) {
      try {
        chess.current.move({ from: selectedSq, to: sq, promotion: 'q' })
        bumpBoard(); setSelectedSq(null); setLegalDests([])
        persist(difficulty, playerColor); updateCheck()
        if (!resolveGameOver(difficulty, playerColor)) doAIMove(difficulty, playerColor)
      } catch {
        setSelectedSq(null); setLegalDests([])
      }
      return
    }
    const piece = chess.current.get(sq as Square)
    if (piece?.color === playerColor) {
      const dests = chess.current
        .moves({ square: sq as Square, verbose: true })
        .map(m => m.to)
      setSelectedSq(sq); setLegalDests(dests)
    } else {
      setSelectedSq(null); setLegalDests([])
    }
  }

  function toggleFullscreen() {
    if (isFullscreen) document.exitFullscreen().catch(() => {})
    else (containerRef.current ?? document.documentElement).requestFullscreen().catch(() => {})
  }

  // ── Board helpers ──────────────────────────────────────────────────────────

  const displayRows = boardFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7]
  const displayCols = boardFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7]
  const FILES = 'abcdefgh'

  function sqBg(row: number, col: number, sq: string): string {
    if (sq === selectedSq) return 'bg-yellow-400/40'
    if (sq === checkedSq)  return 'bg-rose-600/70'
    return (row + col) % 2 === 0 ? 'bg-white/[0.07]' : 'bg-black/[0.15]'
  }

  // ── Status ─────────────────────────────────────────────────────────────────

  const inCheck     = chess.current.inCheck()
  const isMyTurn    = chess.current.turn() === playerColor
  const statusText  = isThinking ? 'AI is thinking…' : isMyTurn ? 'Your Turn' : "AI's Turn"
  const statusCls   = isThinking ? 'text-amber-400 animate-pulse' : isMyTurn ? 'text-emerald-400' : 'text-amber-400'

  function formatTime(t: number | null): string {
    if (t === null) return '∞'
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const opponentColor: ChessColor = playerColor === 'w' ? 'b' : 'w'
  const playerCaptured   = stage === 'playing' ? getCaptured(board, opponentColor) : []
  const aiCaptured       = stage === 'playing' ? getCaptured(board, playerColor) : []
  const materialAdvantage =
    playerCaptured.reduce((s, t) => s + PIECE_VALS[t], 0) -
    aiCaptured.reduce((s, t) => s + PIECE_VALS[t], 0)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-6 sm:py-10">
      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-3xl rounded-2xl bg-slate-700 p-5 dark:bg-slate-800 sm:p-8"
        style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 25px 50px rgba(0,0,0,0.4)' }}
      >
        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Title */}
        <div className="mb-8 flex items-center justify-center gap-2.5 border-b border-slate-500 pb-6">
          <Crown className="h-6 w-6 text-violet-400" />
          <h1 className="text-3xl font-bold text-white">Chess</h1>
        </div>

        {/* ── SETUP ─────────────────────────────────────────────────────── */}
        {stage === 'setup' && (
          <SetupScreen
            difficulty={difficulty}
            playerColor={playerColor}
            timeControl={timeControl}
            savedGame={savedGame}
            onDiff={setDifficulty}
            onColor={setPlayerColor}
            onTimeControl={setTimeControl}
            onStart={() => startGame(difficulty, playerColor, timeControl)}
            onResume={() => savedGame && resumeGame(savedGame)}
          />
        )}

        {/* ── PLAYING ───────────────────────────────────────────────────── */}
        {stage === 'playing' && (
          <div className="flex flex-col items-center">

            {/* AI's side — player pieces the AI captured */}
            <div className="mb-2 flex w-full max-w-[560px] flex-wrap gap-0.5 rounded-lg bg-slate-600/50 px-3 py-1.5 dark:bg-slate-700/50">
              {aiCaptured.map((t, i) => (
                <div key={i} style={{ width: 22, height: 22 }}>
                  <ChessPiece piece={`${playerColor}${t.toUpperCase()}`} size={22} />
                </div>
              ))}
            </div>

            {/* Board */}
            <div
              className="grid grid-cols-8"
              style={{
                width: 'min(560px, min(94vw, 62vh))',
                aspectRatio: '1',
                backgroundImage: 'url(/chess/boards/wood4.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {displayRows.flatMap(row =>
                displayCols.map(col => {
                  const sq     = FILES[col] + (8 - row)
                  const piece  = board[row][col]
                  const isDest = legalDests.includes(sq)
                  const isCap  = isDest && piece !== null
                  const isOwn  = piece?.color === playerColor
                  const isFirstCol = col === displayCols[0]
                  const isLastRow  = row === displayRows[displayRows.length - 1]

                  return (
                    <div
                      key={sq}
                      onClick={() => handleSquareClick(sq)}
                      className={[
                        'relative flex cursor-pointer select-none items-center justify-center',
                        sqBg(row, col, sq),
                        isCap ? 'ring-2 ring-inset ring-yellow-400/60' : '',
                      ].join(' ')}
                      style={{ aspectRatio: '1' }}
                    >
                      {/* Rank label */}
                      {isFirstCol && (
                        <span className="pointer-events-none absolute left-0.5 top-0.5 z-10 text-[9px] font-bold leading-none text-amber-200/70">
                          {8 - row}
                        </span>
                      )}
                      {/* File label */}
                      {isLastRow && (
                        <span className="pointer-events-none absolute bottom-0.5 right-0.5 z-10 text-[9px] font-bold leading-none text-amber-200/70">
                          {FILES[col]}
                        </span>
                      )}
                      {/* Legal move dot */}
                      {isDest && !piece && (
                        <div className="pointer-events-none h-[28%] w-[28%] rounded-full bg-black/30" />
                      )}
                      {/* Piece */}
                      {piece && (
                        <div
                          className={[
                            'pointer-events-none h-[86%] w-[86%]',
                            isOwn && !isThinking ? 'transition-transform hover:scale-110' : '',
                          ].join(' ')}
                        >
                          <ChessPiece
                            piece={`${piece.color}${piece.type.toUpperCase()}`}
                            size={64}
                          />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Player's side — AI pieces the player captured */}
            <div className="mt-2 flex w-full max-w-[560px] flex-wrap gap-0.5 rounded-lg bg-slate-600/50 px-3 py-1.5 dark:bg-slate-700/50">
              {playerCaptured.map((t, i) => (
                <div key={i} style={{ width: 22, height: 22 }}>
                  <ChessPiece piece={`${opponentColor}${t.toUpperCase()}`} size={22} />
                </div>
              ))}
            </div>

            {/* Status section */}
            <div className="mt-4 w-full max-w-[560px] rounded-xl bg-slate-600 p-4 dark:bg-slate-700">
              <p className={`text-center text-lg font-bold ${statusCls}`}>{statusText}</p>
              {inCheck && !isThinking && (
                <p className="mt-1 text-center text-sm font-bold text-rose-400">⚠️ You are in Check!</p>
              )}
              {/* Player clock */}
              {timeControl !== 'unlimited' && <div className="mt-3 text-center">
                <p className="mb-1 text-xs text-slate-400">Your Time</p>
                <div
                  className={[
                    'mx-auto rounded-lg px-6 py-3 font-mono font-bold text-2xl',
                    playerTime !== null && playerTime < 10
                      ? 'animate-pulse border border-rose-500 bg-slate-800 text-rose-400'
                      : playerTime === null
                        ? 'border border-slate-600 bg-slate-800 text-slate-400'
                        : 'border border-slate-600 bg-slate-800 text-white',
                  ].join(' ')}
                  style={{ display: 'inline-block', minWidth: 100, textAlign: 'center' }}
                >
                  {formatTime(playerTime)}
                </div>
              </div>}
            </div>

            {/* Quit button */}
            <button
              onClick={handleQuit}
              className="mt-4 block rounded-xl bg-zinc-600 px-8 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-500"
            >
              Quit Game
            </button>
          </div>
        )}

        {/* ── GAME OVER ─────────────────────────────────────────────────── */}
        {stage === 'gameover' && gameResult && (
          <GameOverScreen
            result={gameResult}
            difficulty={difficulty}
            playerColor={playerColor}
            onNewGame={() => {
              confettiRef.current?.(); confettiRef.current = null
              const raw = localStorage.getItem('chess_saved_game')
              setSavedGame(raw ? JSON.parse(raw) : null)
              setStage('setup')
            }}
            onPlaySame={() => startGame(difficulty, playerColor, timeControl)}
          />
        )}
      </div>
    </div>
  )
}

// ── SetupScreen ───────────────────────────────────────────────────────────────

function SetupScreen({
  difficulty, playerColor, timeControl, savedGame,
  onDiff, onColor, onTimeControl, onStart, onResume,
}: {
  difficulty:    Difficulty
  playerColor:   ChessColor
  timeControl:   TimeControl
  savedGame:     SavedGame | null
  onDiff:        (d: Difficulty) => void
  onColor:       (c: ChessColor) => void
  onTimeControl: (t: TimeControl) => void
  onStart:       () => void
  onResume:      () => void
}) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-3 border-l-4 border-violet-500 pl-3 text-sm font-semibold uppercase tracking-widest text-slate-200">
        Choose Difficulty
      </p>
      <div className="mb-10 grid grid-cols-3 gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
          const cfg = DIFF_CFG[d]
          return (
            <button
              key={d}
              onClick={() => onDiff(d)}
              className={[
                'flex flex-col items-center rounded-xl border px-3 py-3 text-sm font-medium transition-all',
                difficulty === d
                  ? cfg.sel
                  : 'border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
              ].join(' ')}
            >
              <span className="mb-1 text-xl">{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <span className="mt-0.5 text-[11px] opacity-70">{cfg.desc}</span>
            </button>
          )
        })}
      </div>

      <p className="mb-3 border-l-4 border-violet-500 pl-3 text-sm font-semibold uppercase tracking-widest text-slate-200">
        Choose Side
      </p>
      <div className="mb-10 grid grid-cols-2 gap-3">
        {(['w', 'b'] as ChessColor[]).map(c => (
          <button
            key={c}
            onClick={() => onColor(c)}
            className={[
              'flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-bold transition-all',
              playerColor === c
                ? c === 'w'
                  ? 'border-violet-500 bg-white text-zinc-900'
                  : 'border-violet-500 bg-zinc-900 text-white'
                : 'border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
            ].join(' ')}
          >
            <span className="text-2xl">{c === 'w' ? '♔' : '♚'}</span>
            {c === 'w' ? 'Play as White' : 'Play as Black'}
          </button>
        ))}
      </div>

      <p className="mb-3 border-l-4 border-violet-500 pl-3 text-sm font-semibold uppercase tracking-widest text-slate-200">
        Choose Time Control
      </p>
      <div className="mb-10 grid grid-cols-4 gap-2">
        {(['bullet', 'blitz', 'rapid', 'unlimited'] as TimeControl[]).map(tc => {
          const cfg = TIME_CFG[tc]
          const Icon = tc === 'bullet' ? Zap : tc === 'blitz' ? Flame : tc === 'rapid' ? Timer : InfinityIcon
          return (
            <button
              key={tc}
              onClick={() => onTimeControl(tc)}
              className={[
                'flex flex-col items-center rounded-xl border px-2 py-3 text-sm font-medium transition-all',
                timeControl === tc
                  ? cfg.sel
                  : 'border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
              ].join(' ')}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="text-xs font-semibold">{cfg.label}</span>
              <span className="mt-0.5 text-[10px] opacity-70">{cfg.sub}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-violet-500/30 transition-all hover:from-violet-500 hover:to-purple-500 active:scale-[0.98]"
      >
        <Play className="h-5 w-5" />
        Start Game
      </button>

      {savedGame && (
        <button
          onClick={onResume}
          className="mt-3 w-full rounded-xl bg-amber-500 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 active:scale-[0.98]"
        >
          Resume Saved Game
        </button>
      )}

      {/* How to Play */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowGuide(g => !g)}
          className="inline-flex cursor-pointer items-center gap-1 py-1 text-xs text-zinc-400 underline decoration-zinc-600 transition-colors hover:text-zinc-300 hover:decoration-zinc-300"
        >
          <BookOpen className="h-3 w-3" />
          <span>How to Play</span>
        </button>
        {showGuide && (
          <div className="mt-2 space-y-5 rounded-xl border border-zinc-600 bg-zinc-800/60 p-4 text-left text-sm">
            {/* The Basics */}
            <div>
              <h3 className="mb-3 font-semibold text-white">The Basics</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {([
                  { code: 'wK', name: 'King',   desc: '1 square, any direction' },
                  { code: 'wQ', name: 'Queen',  desc: 'Any direction, any distance' },
                  { code: 'wR', name: 'Rook',   desc: 'Horizontal or vertical' },
                  { code: 'wB', name: 'Bishop', desc: 'Diagonals only' },
                  { code: 'wN', name: 'Knight', desc: 'L-shape (2+1 squares)' },
                  { code: 'wP', name: 'Pawn',   desc: 'Forward 1 (or 2 from start)' },
                ] as { code: string; name: string; desc: string }[]).map(({ code, name, desc }) => (
                  <div key={code} className="flex items-center gap-2">
                    <div className="shrink-0" style={{ width: 24, height: 24 }}>
                      <ChessPiece piece={code} size={24} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-white">{name} </span>
                      <span className="text-xs text-zinc-400">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Beginner Guide */}
            <div>
              <h3 className="mb-2 font-semibold text-white">Beginner Guide</h3>
              <ol className="list-inside list-decimal space-y-1 text-zinc-300">
                <li>Control the center — push pawns to e4 / d4 early</li>
                <li>Develop knights and bishops before your queen</li>
                <li>Castle early to keep your king safe</li>
                <li>Connect your rooks on the back rank</li>
                <li>Keep pieces active and coordinated</li>
                <li>Always ask: what is my opponent threatening?</li>
              </ol>
            </div>

            {/* Advanced Tips */}
            <div>
              <h3 className="mb-2 font-semibold text-white">Advanced Tips</h3>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>Look 2–3 moves ahead before committing</li>
                <li>Avoid moving the same piece twice in the opening</li>
                <li>Trade pieces when you are ahead in material</li>
                <li>In the endgame, activate your king — it becomes a fighter</li>
              </ul>
            </div>

            {/* Special Moves */}
            <div>
              <h3 className="mb-2 font-semibold text-white">Special Moves</h3>
              <ul className="space-y-1.5 text-zinc-300">
                <li><span className="font-medium text-violet-300">Castling</span> — King moves 2 squares toward a rook; the rook jumps over</li>
                <li><span className="font-medium text-violet-300">En Passant</span> — A pawn can capture an adjacent pawn that just moved 2 squares</li>
                <li><span className="font-medium text-violet-300">Promotion</span> — A pawn reaching the last rank promotes to a queen (or any piece)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── GameOverScreen ────────────────────────────────────────────────────────────

function GameOverScreen({
  result, difficulty, playerColor, onNewGame, onPlaySame,
}: {
  result:      GameResult
  difficulty:  Difficulty
  playerColor: ChessColor
  onNewGame:   () => void
  onPlaySame:  () => void
}) {
  const emoji =
    result.outcome === 'win'    ? '🏆' :
    result.outcome === 'loss'   ? '😔' :
    result.outcome === 'resign' ? '🏳️' : '🤝'

  const heading =
    result.outcome === 'resign' ? 'You Resigned' : `${result.reason}!`

  const outcomeText =
    result.outcome === 'win'                              ? 'You Won!'              :
    result.outcome === 'loss' && result.reason === "Time's Up" ? 'You Lost on Time'     :
    result.outcome === 'loss'                             ? 'AI Wins'               :
    result.outcome === 'resign'                           ? 'AI wins by resignation' : "It's a Draw"

  const outcomeCls =
    result.outcome === 'win'    ? 'text-emerald-400' :
    result.outcome === 'loss'   ? 'text-rose-400'    :
    result.outcome === 'resign' ? 'text-amber-400'   : 'text-zinc-300'

  return (
    <div className="mx-auto max-w-sm py-8 text-center">
      <div className="mb-4 text-6xl">{emoji}</div>
      <h2 className="text-3xl font-bold text-white">{heading}</h2>
      <p className={`mt-2 text-2xl font-semibold ${outcomeCls}`}>{outcomeText}</p>

      <div className="mt-6 flex justify-center gap-6 text-sm text-slate-300">
        <span>{result.totalMoves} moves played</span>
        <span className="capitalize">{difficulty} difficulty</span>
        <span>{playerColor === 'w' ? 'White' : 'Black'}</span>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onNewGame}
          className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 font-bold text-white shadow-lg shadow-violet-500/30 transition-all hover:from-violet-500 hover:to-purple-500"
        >
          New Game
        </button>
        <button
          onClick={onPlaySame}
          className="flex-1 rounded-xl bg-slate-600 py-3 font-medium text-zinc-300 transition-colors hover:bg-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Play Same Settings
        </button>
      </div>
    </div>
  )
}
