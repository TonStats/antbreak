'use client'

import { useState, useEffect, useRef } from 'react'
import { Zap, Maximize2, X } from 'lucide-react'
import { BOSS_PATTERNS } from '@/types/dodgeMaster'
import type { DodgeMode, Obstacle } from '@/types/dodgeMaster'

// ── Constants ──────────────────────────────────────────────────────────────
const CANVAS_WIDTH  = 600
const CANVAS_HEIGHT = 400
const LANE_COUNT    = 5
const LANE_W        = CANVAS_WIDTH / LANE_COUNT
const LANE_CENTERS  = Array.from({ length: LANE_COUNT }, (_, i) => LANE_W * i + LANE_W / 2)

const OBS_COLORS = ['#f97316', '#3b82f6', '#a855f7', '#22c55e', '#eab308', '#06b6d4']
const OBS_SHAPES: Obstacle['shape'][] = ['circle', 'square', 'diamond']

const BOSS_FIRE_INTERVALS: Record<number, number> = { 1: 24, 2: 120, 3: 12, 4: 36, 5: 55 }

const DODGE_CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${2 + Math.random() * 96}%`,
  width: `${4 + Math.random() * 5}px`,
  height: `${6 + Math.random() * 8}px`,
  bg: ['#ec4899', '#06b6d4', '#a855f7', '#f97316', '#fbbf24'][i % 5],
  delay: `${(Math.random() * 0.8).toFixed(2)}s`,
  dur: `${(2 + Math.random() * 2).toFixed(2)}s`,
}))

// ── Types ──────────────────────────────────────────────────────────────────
type Difficulty = 'easy' | 'normal' | 'hard'
type Stage = 'setup' | 'countdown' | 'playing' | 'results'

interface GS {
  player: { x: number; y: number; size: number; invincible: boolean; invincibleTimer: number; laneX: number }
  obstacles: Obstacle[]
  timeAlive: number
  lastSpawnTime: number
  lives: number
  isAlive: boolean
  currentLane: number
  frameCount: number
  // boss
  currentBoss: number
  bossTimer: number
  bossesDefeated: number
  bossPatternTimer: number
  bossAngleOffset: number
  bossDefeatedTimer: number
  showBossDefeated: boolean
}

interface ResultsData {
  time: number; score: number; mode: DodgeMode; diff: Difficulty
  bossesDefeated: number; isWin: boolean; isNewBest: boolean
}

const DIFF: Record<Difficulty, { speedMult: number; spawnMult: number }> = {
  easy:   { speedMult: 0.7, spawnMult: 1.4 },
  normal: { speedMult: 1.0, spawnMult: 1.0 },
  hard:   { speedMult: 1.4, spawnMult: 0.7 },
}
const DIFF_STYLES: Record<Difficulty, string> = {
  easy:   'bg-green-900/30 border-green-700 text-green-400',
  normal: 'bg-pink-900/30 border-pink-700 text-pink-400',
  hard:   'bg-rose-900/30 border-rose-700 text-rose-400',
}
const MODES = [
  { id: 'classic' as DodgeMode, emoji: '⚡', name: 'CLASSIC DODGE', desc: 'Survive as long as possible' },
  { id: 'lane'    as DodgeMode, emoji: '🔲', name: 'LANE DODGE',    desc: '5 lanes. Falling obstacles. React.' },
  { id: 'boss'    as DodgeMode, emoji: '👾', name: 'BOSS RUSH',     desc: '5 bosses. 3 lives. Good luck.' },
]

// ── Grade ──────────────────────────────────────────────────────────────────
function getGrade(s: number) {
  if (s < 10)  return { label: 'ROOKIE',   emoji: '💀', color: 'text-zinc-400' }
  if (s < 30)  return { label: 'SURVIVOR', emoji: '⚡', color: 'text-blue-400' }
  if (s < 60)  return { label: 'VETERAN',  emoji: '🔥', color: 'text-orange-400' }
  if (s < 120) return { label: 'MASTER',   emoji: '⭐', color: 'text-yellow-400' }
  return { label: 'LEGEND', emoji: '👑', color: 'text-pink-400' }
}

// ── Spawn helpers ──────────────────────────────────────────────────────────
function spawnClassic(gs: GS, ts: number, d: Difficulty) {
  const edge = Math.floor(Math.random() * 4)
  const speed = (2.5 + (gs.timeAlive / 30) * 0.5) * DIFF[d].speedMult
  const size  = 8 + Math.random() * 12
  const cx = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 160
  const cy = CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 120
  let x = 0, y = 0
  if      (edge === 0) { x = Math.random() * CANVAS_WIDTH; y = -size }
  else if (edge === 1) { x = CANVAS_WIDTH + size; y = Math.random() * CANVAS_HEIGHT }
  else if (edge === 2) { x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + size }
  else                 { x = -size; y = Math.random() * CANVAS_HEIGHT }
  const dist = Math.hypot(cx - x, cy - y)
  gs.obstacles.push({ id: `c-${ts}-${Math.random()}`, x, y, width: size, height: size, speedX: ((cx-x)/dist)*speed, speedY: ((cy-y)/dist)*speed, color: OBS_COLORS[Math.floor(Math.random()*OBS_COLORS.length)], shape: OBS_SHAPES[Math.floor(Math.random()*OBS_SHAPES.length)] })
  gs.lastSpawnTime = ts
}

function spawnLane(gs: GS, ts: number, d: Difficulty) {
  const lane  = Math.floor(Math.random() * LANE_COUNT)
  const speed = (2.5 + (gs.timeAlive / 20) * 0.4) * DIFF[d].speedMult
  gs.obstacles.push({ id: `l-${ts}-${Math.random()}`, x: LANE_CENTERS[lane], y: -20, width: LANE_W - 10, height: 22, speedX: 0, speedY: speed, color: OBS_COLORS[Math.floor(gs.timeAlive/5)%OBS_COLORS.length], shape: 'square' })
  gs.lastSpawnTime = ts
}

function fireBossAttack(gs: GS, ts: number, boss: number, d: Difficulty) {
  const sm = DIFF[d].speedMult
  if (boss === 1) {
    // Scatter: 8 circles in 180° downward arc from center-top
    // angle 0=right, π/2=straight down, π=left — sin(a)>=0 means all go downward
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (i / 7)
      const sp = 3.5 * sm
      gs.obstacles.push({ id: `sc-${ts}-${i}`, x: CANVAS_WIDTH/2, y: -10, width: 9, height: 9, speedX: (Math.cos(a) - 0.5) * sp * 2, speedY: Math.max(0.5, Math.sin(a)) * sp, color: '#ef4444', shape: 'circle' })
    }
  } else if (boss === 2) {
    // Wall: 10 segments with one gap
    const SEGS = 10, SW = CANVAS_WIDTH / SEGS
    const gap = Math.floor(Math.random() * SEGS)
    for (let i = 0; i < SEGS; i++) {
      if (i === gap) continue
      gs.obstacles.push({ id: `w2-${ts}-${i}`, x: i*SW + SW/2, y: -15, width: SW-3, height: 28, speedX: 0, speedY: 3*sm, color: '#f97316', shape: 'square' })
    }
  } else if (boss === 3) {
    // Spiral: rotating from top-center
    const x = CANVAS_WIDTH/2 + Math.cos(gs.bossAngleOffset) * 200
    gs.bossAngleOffset += 0.3
    gs.obstacles.push({ id: `sp3-${ts}`, x: Math.max(20, Math.min(CANVAS_WIDTH-20, x)), y: -20, width: 14, height: 14, speedX: 0, speedY: 3.5*sm, color: '#a855f7', shape: 'diamond' })
  } else if (boss === 4) {
    // Hunter: aimed at player
    const sx = Math.random() * CANVAS_WIDTH, sy = -20
    const dx = gs.player.x - sx, dy = gs.player.y - sy
    const dist = Math.hypot(dx, dy)
    const sp = 4 * sm
    gs.obstacles.push({ id: `h4-${ts}`, x: sx, y: sy, width: 12, height: 12, speedX: (dx/dist)*sp, speedY: (dy/dist)*sp, color: '#3b82f6', shape: 'circle' })
  } else if (boss === 5) {
    // Chaos: two random patterns from 1-4
    const picks = [1,2,3,4].sort(() => Math.random()-0.5).slice(0,2)
    for (const p of picks) fireBossAttack(gs, ts + Math.random(), p, d)
  }
}

// ── Drawing helpers ────────────────────────────────────────────────────────
function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(236,72,153,0.08)'; ctx.lineWidth = 1
  for (let x = 0; x <= CANVAS_WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,CANVAS_HEIGHT); ctx.stroke() }
  for (let y = 0; y <= CANVAS_HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_WIDTH,y); ctx.stroke() }
}

function drawLaneDividers(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(236,72,153,0.12)'; ctx.lineWidth = 1
  for (let i = 1; i < LANE_COUNT; i++) { ctx.beginPath(); ctx.moveTo(i*LANE_W,0); ctx.lineTo(i*LANE_W,CANVAS_HEIGHT); ctx.stroke() }
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = obs.color; ctx.fillStyle = obs.color
  if (obs.shape === 'circle') { ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.width/2, 0, Math.PI*2); ctx.fill() }
  else if (obs.shape === 'square') { ctx.fillRect(obs.x-obs.width/2, obs.y-obs.height/2, obs.width, obs.height) }
  else { ctx.translate(obs.x, obs.y); ctx.rotate(Math.PI/4); ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height) }
  ctx.restore()
}

function drawPlayerShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = '#ec4899'; ctx.fillStyle = '#ec4899'
  ctx.translate(x,y); ctx.rotate(Math.PI/4); ctx.fillRect(-size/2,-size/2,size,size); ctx.restore()
}

function drawHUD(ctx: CanvasRenderingContext2D, timeAlive: number) {
  ctx.save(); ctx.font = '13px monospace'; ctx.fillStyle = 'rgba(236,72,153,0.8)'
  ctx.fillText(`TIME: ${Math.floor(timeAlive)}s`, 10, 20)
  ctx.fillText(`SCORE: ${Math.floor(timeAlive*10)}`, 10, 38); ctx.restore()
}

function drawBossHUD(ctx: CanvasRenderingContext2D, gs: GS) {
  const boss = BOSS_PATTERNS[gs.currentBoss - 1]
  ctx.save()
  // Boss name top-center
  ctx.font = '12px monospace'; ctx.fillStyle = 'rgba(236,72,153,0.75)'; ctx.textAlign = 'center'
  ctx.fillText(`BOSS ${gs.currentBoss}/5 — ${boss.name.toUpperCase()}`, CANVAS_WIDTH/2, 16)
  // Lives top-right
  ctx.textAlign = 'left'; ctx.font = '14px monospace'
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < gs.lives ? '#ec4899' : '#3f3f46'
    ctx.fillText(i < gs.lives ? '♥' : '♡', CANVAS_WIDTH - 56 + i*18, 16)
  }
  // Timer bar bottom
  const frac = Math.max(0, gs.bossTimer / 30)
  const barC = frac > 0.5 ? '#ec4899' : frac > 0.33 ? '#f97316' : '#ef4444'
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, CANVAS_HEIGHT-5, CANVAS_WIDTH, 5)
  ctx.shadowBlur = 6; ctx.shadowColor = barC; ctx.fillStyle = barC
  ctx.fillRect(0, CANVAS_HEIGHT-5, CANVAS_WIDTH*frac, 5)
  ctx.restore()
}

function drawBossDefeated(ctx: CanvasRenderingContext2D, timer: number) {
  ctx.save()
  ctx.fillStyle = `rgba(34,197,94,${(0.22*(timer/60)).toFixed(2)})`
  ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
  ctx.textAlign = 'center'; ctx.shadowBlur = 20; ctx.shadowColor = '#22c55e'
  ctx.fillStyle = '#22c55e'; ctx.font = 'bold 36px monospace'
  ctx.fillText('BOSS DEFEATED!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2); ctx.restore()
}

// ── Share badge ────────────────────────────────────────────────────────────
function downloadBadge(time: number, score: number, grade: string, mode: string) {
  const W = 600, H = 300
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); if (!ctx) return
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H)
  ctx.strokeStyle = 'rgba(236,72,153,0.1)'; ctx.lineWidth = 1
  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
  for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
  ctx.strokeStyle = 'rgba(236,72,153,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(1,1,W-2,H-2)
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(236,72,153,0.5)'; ctx.font = '13px monospace'
  ctx.fillText('ANTBREAK — DODGE MASTER', W/2, 36)
  ctx.fillStyle = 'rgba(236,72,153,0.3)'; ctx.font = '11px monospace'
  ctx.fillText(mode.toUpperCase(), W/2, 54)
  ctx.shadowBlur = 24; ctx.shadowColor = '#ec4899'; ctx.fillStyle = '#ec4899'
  ctx.font = 'bold 88px monospace'; ctx.fillText(`${time}s`, W/2, 162)
  ctx.shadowBlur = 10; ctx.font = 'bold 26px monospace'; ctx.fillText(grade, W/2, 204)
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(236,72,153,0.35)'; ctx.font = '12px monospace'
  ctx.fillText('antbreak.com', W/2, 282); ctx.textAlign = 'left'
  const a = document.createElement('a')
  a.download = `antbreak-dodge-${grade.toLowerCase()}-${time}s.png`
  a.href = c.toDataURL('image/png'); a.click()
}

// ── Component ──────────────────────────────────────────────────────────────
export default function DodgeMasterGame() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const gsRef        = useRef<GS | null>(null)
  const keysRef      = useRef<Record<string, boolean>>({})
  const mouseRef     = useRef({ x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2 })
  const touchXRef    = useRef<number | null>(null)
  const modeRef      = useRef<DodgeMode>('classic')
  const diffRef      = useRef<Difficulty>('normal')
  const handlersRef  = useRef<{
    keyDown?:(e:KeyboardEvent)=>void; keyUp?:(e:KeyboardEvent)=>void
    mouseMove?:(e:MouseEvent)=>void; touchStart?:(e:Event)=>void
    touchEnd?:(e:Event)=>void; touchMove?:(e:Event)=>void
  }>({})

  const [scale,        setScale]        = useState(1)
  const [stage,        setStage]        = useState<Stage>('setup')
  const [mode,         setMode]         = useState<DodgeMode>('classic')
  const [diff,         setDiff]         = useState<Difficulty>('normal')
  const [countdown,    setCountdown]    = useState(3)
  const [results,      setResults]      = useState<ResultsData | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [best,         setBest]         = useState({ classic: 0, lane: 0, boss: 0 })
  const [showHowTo,    setShowHowTo]    = useState(false)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { diffRef.current = diff }, [diff])

  useEffect(() => {
    setBest({
      classic: Number(localStorage.getItem('dodge_best_classic') ?? 0),
      lane:    Number(localStorage.getItem('dodge_best_lane')    ?? 0),
      boss:    Number(localStorage.getItem('dodge_best_boss')    ?? 0),
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setScale(Math.min(width/CANVAS_WIDTH, height/CANVAS_HEIGHT, 1))
    })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  // Countdown chain
  useEffect(() => {
    if (stage !== 'countdown') return
    if (countdown > 0) {
      const id = setTimeout(() => setCountdown(c => c-1), 1000)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => { startGame(); setStage('playing') }, 400)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, countdown])

  // Hide confetti after 4s
  useEffect(() => {
    if (!showConfetti) return
    const id = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(id)
  }, [showConfetti])

  useEffect(() => () => stopGame(), []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop ──────────────────────────────────────────────
  function stopGame() {
    cancelAnimationFrame(animFrameRef.current)
    const h = handlersRef.current; const canvas = canvasRef.current
    if (h.keyDown)   window.removeEventListener('keydown', h.keyDown)
    if (h.keyUp)     window.removeEventListener('keyup',   h.keyUp)
    if (canvas) {
      if (h.mouseMove)  canvas.removeEventListener('mousemove',  h.mouseMove)
      if (h.touchStart) canvas.removeEventListener('touchstart', h.touchStart)
      if (h.touchEnd)   canvas.removeEventListener('touchend',   h.touchEnd)
      if (h.touchMove)  canvas.removeEventListener('touchmove',  h.touchMove)
    }
    handlersRef.current = {}
  }

  // ── Kill player ────────────────────────────────────────
  function killPlayer(gs: GS, ctx: CanvasRenderingContext2D, currentMode: DodgeMode, currentDiff: Difficulty) {
    gs.isAlive = false; stopGame()
    const t = Math.floor(gs.timeAlive); let isNewBest = false
    if (currentMode === 'boss') {
      const prev = Number(localStorage.getItem('dodge_best_boss') ?? 0)
      if (gs.bossesDefeated > prev) { localStorage.setItem('dodge_best_boss', String(gs.bossesDefeated)); setBest(b => ({ ...b, boss: gs.bossesDefeated })); isNewBest = true }
    } else {
      const key = `dodge_best_${currentMode}`; const prev = Number(localStorage.getItem(key) ?? 0)
      if (t > prev) { localStorage.setItem(key, String(t)); setBest(b => ({ ...b, [currentMode]: t })); isNewBest = true }
    }
    setResults({ time: t, score: Math.floor(gs.timeAlive*10), mode: currentMode, diff: currentDiff, bossesDefeated: gs.bossesDefeated, isWin: false, isNewBest })
    if (currentMode !== 'boss' && t >= 120) setShowConfetti(true)
    // Death flash
    ctx.fillStyle = 'rgba(239,68,68,0.35)'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    ctx.save(); ctx.textAlign = 'center'; ctx.shadowBlur = 20; ctx.shadowColor = '#ef4444'
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 52px monospace'; ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2)
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(236,72,153,0.7)'; ctx.font = '15px monospace'
    ctx.fillText(`${t}s survived`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2+36); ctx.restore()
    setTimeout(() => setStage('results'), 1500)
  }

  // ── Start game ─────────────────────────────────────────
  function startGame() {
    stopGame()
    const currentMode = modeRef.current; const currentDiff = diffRef.current
    const sx = currentMode === 'lane' ? LANE_CENTERS[2] : CANVAS_WIDTH/2
    const sy = currentMode === 'lane' ? CANVAS_HEIGHT-40 : CANVAS_HEIGHT/2
    const gs: GS = {
      player: { x: sx, y: sy, size: 16, invincible: false, invincibleTimer: 0, laneX: sx },
      obstacles: [], timeAlive: 0, lastSpawnTime: 0,
      lives: currentMode === 'boss' ? 3 : 1,
      isAlive: true, currentLane: 2, frameCount: 0,
      currentBoss: 1, bossTimer: 30, bossesDefeated: 0,
      bossPatternTimer: 0, bossAngleOffset: 0, bossDefeatedTimer: 0, showBossDefeated: false,
    }
    gsRef.current = gs

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true
      if (modeRef.current === 'lane' && gsRef.current) {
        const s = gsRef.current
        if ((e.key==='ArrowLeft'||e.key==='a') && s.currentLane>0) { s.currentLane--; e.preventDefault() }
        if ((e.key==='ArrowRight'||e.key==='d') && s.currentLane<LANE_COUNT-1) { s.currentLane++; e.preventDefault() }
      }
    }
    const onKeyUp     = (e: KeyboardEvent) => { keysRef.current[e.key] = false }
    const onMouseMove = (e: MouseEvent) => {
      const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect()
      mouseRef.current = { x: (e.clientX-r.left)*(CANVAS_WIDTH/r.width), y: (e.clientY-r.top)*(CANVAS_HEIGHT/r.height) }
    }
    const onTouchStart: (e:Event)=>void = (e) => {
      const te = e as TouchEvent; touchXRef.current = te.touches[0].clientX
      if (modeRef.current !== 'lane') {
        const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect()
        mouseRef.current = { x: (te.touches[0].clientX-r.left)*(CANVAS_WIDTH/r.width), y: (te.touches[0].clientY-r.top)*(CANVAS_HEIGHT/r.height) }
      }
    }
    const onTouchEnd: (e:Event)=>void = (e) => {
      const te = e as TouchEvent
      if (modeRef.current==='lane' && touchXRef.current!==null && gsRef.current) {
        const dx = te.changedTouches[0].clientX - touchXRef.current; const s = gsRef.current
        if (Math.abs(dx)>30) { if (dx<0&&s.currentLane>0) s.currentLane--; if (dx>0&&s.currentLane<LANE_COUNT-1) s.currentLane++ }
      }
      touchXRef.current = null
    }
    const onTouchMove: (e:Event)=>void = (e) => {
      if (modeRef.current!=='lane') {
        const te = e as TouchEvent; const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect()
        mouseRef.current = { x: (te.touches[0].clientX-r.left)*(CANVAS_WIDTH/r.width), y: (te.touches[0].clientY-r.top)*(CANVAS_HEIGHT/r.height) }
      }
    }
    handlersRef.current = { keyDown:onKeyDown, keyUp:onKeyUp, mouseMove:onMouseMove, touchStart:onTouchStart, touchEnd:onTouchEnd, touchMove:onTouchMove }
    const canvas = canvasRef.current
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp)
    if (canvas) {
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('touchstart', onTouchStart, { passive:true })
      canvas.addEventListener('touchend',   onTouchEnd,   { passive:true })
      canvas.addEventListener('touchmove',  onTouchMove,  { passive:true })
    }

    // ── Game loop ──────────────────────────────────────
    const loop = (timestamp: number) => {
      const state = gsRef.current; if (!state?.isAlive) return
      const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return
      const lm = modeRef.current; const ld = diffRef.current

      ctx.fillStyle = '#000'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
      drawGrid(ctx); if (lm==='lane') drawLaneDividers(ctx)
      state.timeAlive += 1/60

      // Boss mode update
      let freeze = false
      if (lm === 'boss') {
        if (state.showBossDefeated) {
          freeze = true
          state.bossDefeatedTimer--
          if (state.bossDefeatedTimer <= 0) {
            state.showBossDefeated = false
            state.bossesDefeated++
            if (state.bossesDefeated >= 5) {
              // WIN
              state.isAlive = false; stopGame()
              const t = Math.floor(state.timeAlive)
              const prev = Number(localStorage.getItem('dodge_best_boss') ?? 0)
              if (5 > prev) { localStorage.setItem('dodge_best_boss','5'); setBest(b => ({ ...b, boss: 5 })) }
              setResults({ time: t, score: Math.floor(state.timeAlive*10), mode: lm, diff: ld, bossesDefeated: 5, isWin: true, isNewBest: 5>prev })
              setShowConfetti(true)
              setTimeout(() => setStage('results'), 400)
              return
            }
            state.currentBoss++; state.bossTimer = 30; state.obstacles = []; state.bossPatternTimer = 0
          }
        } else {
          state.bossTimer -= 1/60
          if (state.bossTimer <= 0) { state.showBossDefeated = true; state.bossDefeatedTimer = 60 }
          else {
            state.bossPatternTimer++
            const interval = BOSS_FIRE_INTERVALS[state.currentBoss] ?? 60
            if (state.bossPatternTimer >= interval) { state.bossPatternTimer = 0; fireBossAttack(state, timestamp, state.currentBoss, ld) }
          }
        }
      }

      // Spawn (non-boss)
      if (lm !== 'boss') {
        const interval = Math.max(300, 1200-state.timeAlive*8)*DIFF[ld].spawnMult
        if (timestamp-state.lastSpawnTime > interval) { if (lm==='lane') spawnLane(state,timestamp,ld); else spawnClassic(state,timestamp,ld) }
      }

      if (!freeze) {
        // Move obstacles
        for (const o of state.obstacles) { o.x+=o.speedX; o.y+=o.speedY }
        state.obstacles = state.obstacles.filter(o => o.x>-60&&o.x<CANVAS_WIDTH+60&&o.y>-60&&o.y<CANVAS_HEIGHT+60)

        // Move player
        if (lm === 'lane') {
          const tx = LANE_CENTERS[state.currentLane]
          state.player.laneX += (tx-state.player.laneX)*0.18
          state.player.x = state.player.laneX; state.player.y = CANVAS_HEIGHT-40
        } else {
          const k = keysRef.current
          const hasKey = k['ArrowLeft']||k['a']||k['ArrowRight']||k['d']||k['ArrowUp']||k['w']||k['ArrowDown']||k['s']
          if (hasKey) {
            const sp = 3.5
            if (k['ArrowLeft']||k['a']) state.player.x -= sp; if (k['ArrowRight']||k['d']) state.player.x += sp
            if (k['ArrowUp']||k['w'])   state.player.y -= sp; if (k['ArrowDown']||k['s'])  state.player.y += sp
          } else {
            state.player.x += (mouseRef.current.x-state.player.x)*0.15
            state.player.y += (mouseRef.current.y-state.player.y)*0.15
          }
          state.player.x = Math.max(state.player.size, Math.min(CANVAS_WIDTH-state.player.size, state.player.x))
          state.player.y = Math.max(state.player.size, Math.min(CANVAS_HEIGHT-state.player.size, state.player.y))
        }

        // Invincibility
        if (state.player.invincible) { state.player.invincibleTimer--; if (state.player.invincibleTimer<=0) state.player.invincible=false }

        // Collision
        if (!state.player.invincible) {
          for (const obs of state.obstacles) {
            if (Math.hypot(state.player.x-obs.x, state.player.y-obs.y) < (state.player.size+obs.width)/2-4) {
              if (lm==='boss') {
                state.lives--
                if (state.lives<=0) { killPlayer(state,ctx,lm,ld); break }
                state.player.invincible=true; state.player.invincibleTimer=120; break
              } else { killPlayer(state,ctx,lm,ld); break }
            }
          }
        }
      }

      // Draw
      for (const obs of state.obstacles) drawObstacle(ctx, obs)
      const showP = !state.player.invincible || Math.floor(state.player.invincibleTimer/6)%2===0
      if (showP) drawPlayerShape(ctx, state.player.x, state.player.y, state.player.size)
      if (lm==='boss') { drawBossHUD(ctx, state); if (state.showBossDefeated) drawBossDefeated(ctx, state.bossDefeatedTimer) }
      else drawHUD(ctx, state.timeAlive)

      state.frameCount++
      if (state.isAlive) animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)
  }

  function handleQuit()  { stopGame(); gsRef.current=null; setResults(null); setShowConfetti(false); setStage('setup'); setCountdown(3) }
  function handleStart() { setResults(null); setShowConfetti(false); setCountdown(3); setStage('countdown') }

  function toggleFullscreen() {
    const el = cardRef.current; if (!el) return
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{})
    else el.requestFullscreen().catch(()=>{})
  }

  return (
    <div ref={cardRef} id="original-game-card"
      className="flex flex-col rounded-2xl overflow-hidden dodge-master-card"
      style={{ height:'calc(100vh - 100px)', minHeight:'580px', background:'#000',
        boxShadow:'0 0 0 1px rgba(236,72,153,0.5), 0 0 40px rgba(236,72,153,0.15), 0 0 80px rgba(236,72,153,0.05), 0 25px 50px rgba(0,0,0,0.8)' }}>

      {/* Title row */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0">
        <Zap className="h-5 w-5 text-pink-400 shrink-0" />
        <span className="font-bold text-2xl font-mono uppercase tracking-widest flex-1 text-pink-400">
          DODGE MASTER<span className="animate-pulse text-cyan-400 ml-1">_</span>
        </span>
        {stage !== 'setup' && (
          <button type="button" onClick={handleQuit} title="Quit"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-pink-900/50 text-pink-800 hover:text-pink-400 hover:border-pink-400/50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="button" onClick={toggleFullscreen} title="Fullscreen"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-pink-900/50 text-pink-800 hover:text-pink-400 hover:border-pink-400/50 transition-colors">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="border-t border-pink-900/30 shrink-0" />

      {/* Game area */}
      <div ref={containerRef} className="flex-1 scanlines overflow-hidden relative">
        {/* Canvas */}
        <div className="absolute inset-0 flex items-start justify-center">
          <div style={{ transform:`scale(${scale})`, transformOrigin:'top center', width:CANVAS_WIDTH, height:CANVAS_HEIGHT, flexShrink:0 }}>
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display:'block', touchAction:'none' }} />
          </div>
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {DODGE_CONFETTI.map(p => (
              <div key={p.id} className="confetti-piece"
                style={{ left:p.left, width:p.width, height:p.height, background:p.bg, animationDelay:p.delay, animationDuration:p.dur }} />
            ))}
          </div>
        )}

        {stage === 'setup' && (
          <div className="absolute inset-0 z-20">
            <SetupScreen mode={mode} difficulty={diff} best={best} showHowTo={showHowTo}
              onSelectMode={setMode} onSelectDifficulty={setDiff}
              onToggleHowTo={() => setShowHowTo(v=>!v)} onStart={handleStart} />
          </div>
        )}

        {stage === 'countdown' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75">
            <span key={countdown} className="text-8xl font-mono font-bold text-pink-400"
              style={{ textShadow:'0 0 40px rgba(236,72,153,0.9)' }}>
              {countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
        )}

        {stage === 'results' && results && (
          <ResultsScreen results={results} onPlayAgain={handleStart} onChangeMode={handleQuit} />
        )}
      </div>
    </div>
  )
}

// ── Results screen ─────────────────────────────────────────────────────────
function ResultsScreen({ results, onPlayAgain, onChangeMode }: { results: ResultsData; onPlayAgain:()=>void; onChangeMode:()=>void }) {
  const grade = getGrade(results.time)
  const btns = (
    <div className="flex gap-3 mt-1">
      <button type="button" onClick={onPlayAgain}
        className="bg-pink-600 hover:bg-pink-500 text-black font-bold font-mono text-sm py-2 px-6 rounded-xl border border-pink-400 shadow-lg shadow-pink-500/30 transition-colors">
        ▶ PLAY AGAIN
      </button>
      <button type="button" onClick={onChangeMode}
        className="bg-zinc-950 border border-pink-800/50 text-pink-700 hover:text-pink-500 hover:border-pink-600/70 font-mono text-sm py-2 px-6 rounded-xl transition-colors">
        CHANGE MODE
      </button>
    </div>
  )

  if (results.mode === 'boss') {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 px-6 text-center">
        <p className="text-pink-400 font-mono text-3xl font-bold mb-1"
          style={{ textShadow:'0 0 30px rgba(236,72,153,0.8)' }}>
          {results.isWin ? 'YOU WIN!' : 'BOSS RUSH OVER'}
        </p>
        {results.isWin && <p className="text-pink-300 font-mono text-xs tracking-[0.3em] mb-2">DODGE MASTER ACHIEVED!</p>}
        <p className="text-pink-800/70 font-mono text-sm mb-3">BOSSES DEFEATED: {results.bossesDefeated}/5</p>
        <div className="space-y-1.5 mb-5 text-left">
          {BOSS_PATTERNS.map((boss, i) => {
            const n = i+1
            const defeated = n <= results.bossesDefeated
            const failed   = n === results.bossesDefeated+1 && !results.isWin
            return (
              <p key={boss.id} className={`font-mono text-xs flex items-center gap-2 ${defeated?'text-green-400':failed?'text-red-400':'text-zinc-700'}`}>
                <span className="w-3">{defeated?'✓':failed?'✗':'·'}</span>
                <span style={{ color: boss.color }}>{boss.name}</span>
                <span className="text-zinc-700 text-[10px]">— {boss.description}</span>
              </p>
            )
          })}
        </div>
        {btns}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 px-6 text-center">
      <p className="text-pink-800/60 text-xs font-mono uppercase tracking-widest mb-1">TIME SURVIVED</p>
      <p className="font-mono font-bold text-pink-400 leading-none mb-2"
        style={{ fontSize:'80px', textShadow:'0 0 40px rgba(236,72,153,0.8)' }}>
        {results.time}s
      </p>
      <p className={`font-mono text-2xl font-bold mb-1 ${grade.color}`}>{grade.emoji} {grade.label}</p>
      {results.isNewBest && <p className="text-pink-400 font-bold font-mono text-sm mb-1">⚡ NEW RECORD!</p>}
      <p className="text-pink-800/50 font-mono text-xs mb-4">SCORE: {results.score}</p>
      {btns}
      <button type="button"
        onClick={() => downloadBadge(results.time, results.score, grade.label, results.mode)}
        className="text-pink-900/50 text-xs font-mono underline mt-3">
        share badge
      </button>
    </div>
  )
}

// ── Setup screen ───────────────────────────────────────────────────────────
function SetupScreen({ mode, difficulty, best, showHowTo, onSelectMode, onSelectDifficulty, onToggleHowTo, onStart }: {
  mode:DodgeMode; difficulty:Difficulty; best:{classic:number;lane:number;boss:number}
  showHowTo:boolean; onSelectMode:(m:DodgeMode)=>void; onSelectDifficulty:(d:Difficulty)=>void
  onToggleHowTo:()=>void; onStart:()=>void
}) {
  return (
    <div className="flex flex-col justify-center h-full overflow-y-auto px-5 py-4"
      style={{ background:'#000', backgroundImage:'linear-gradient(rgba(236,72,153,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(236,72,153,0.05) 1px,transparent 1px)', backgroundSize:'40px 40px' }}>
      <p className="text-pink-800/60 text-xs font-mono uppercase tracking-[0.4em] text-center mb-4">CHOOSE YOUR CHALLENGE</p>
      <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
        {MODES.map(m => (
          <button key={m.id} type="button" onClick={() => onSelectMode(m.id)}
            className={['flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-150',
              mode===m.id ? 'bg-pink-950/30 border-2 border-pink-500 shadow-lg shadow-pink-500/20'
                          : 'bg-zinc-950 border border-pink-900/30 hover:border-pink-500/50 hover:bg-pink-950/10'].join(' ')}>
            <span className="text-3xl">{m.emoji}</span>
            <div>
              <p className="text-pink-300 font-mono font-bold text-sm uppercase">{m.name}</p>
              <p className="text-pink-800/60 text-xs font-mono">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
      {mode !== 'boss' && (
        <>
          <p className="text-pink-800/50 text-xs font-mono uppercase tracking-widest text-center mt-4 mb-2">DIFFICULTY</p>
          <div className="flex gap-2 justify-center">
            {(['easy','normal','hard'] as Difficulty[]).map(d => (
              <button key={d} type="button" onClick={() => onSelectDifficulty(d)}
                className={['px-4 py-1.5 rounded-full border text-xs font-mono font-bold transition-all duration-150',
                  difficulty===d ? DIFF_STYLES[d] : 'bg-zinc-950 border-zinc-700 text-zinc-600'].join(' ')}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="text-pink-900/60 text-xs font-mono text-center mt-3">
        {mode==='boss' ? `BOSSES DEFEATED: ${best.boss}/5` : `BEST: ${best[mode]}s on ${mode.toUpperCase()}`}
      </p>
      <div className="max-w-md mx-auto w-full mt-5">
        <button type="button" onClick={onStart}
          className="bg-pink-600 hover:bg-pink-500 text-black font-bold font-mono text-sm w-full py-3 rounded-xl border border-pink-400 shadow-lg shadow-pink-500/30 transition-colors">
          ▶ START
        </button>
      </div>
      <button type="button" onClick={onToggleHowTo}
        className="text-pink-900/50 text-xs font-mono underline mt-2 text-center mx-auto block">
        {showHowTo ? 'hide guide' : 'how to play'}
      </button>
      {showHowTo && (
        <div className="max-w-md mx-auto w-full mt-2 bg-zinc-950 border border-pink-900/20 rounded-xl p-4 text-xs text-pink-800/70 font-mono space-y-1.5">
          <p>⚡ CLASSIC: Mouse or arrow keys. Obstacles from all sides.</p>
          <p>🔲 LANE: 5 lanes. Arrow keys or swipe. Obstacles fall from top.</p>
          <p>👾 BOSS RUSH: Survive 5 patterns × 30s each. 3 lives.</p>
          <p>— Score = time × 10. Obstacles accelerate over time.</p>
          <p>— Grades: 💀 Rookie / ⚡ Survivor / 🔥 Veteran / ⭐ Master / 👑 Legend</p>
        </div>
      )}
    </div>
  )
}
