'use client'

import { useRef, useEffect, useState, useMemo } from 'react'

export interface OnScreenKeyboardProps {
  pressedKeys: string[]
  highlightKeys: string[]
  wrongKeys?: string[]
  hintKeys?: string[]
  onKeyPress?: (key: string) => void
  interactive: boolean
  os: 'windows' | 'mac'
}

type KeyDef = {
  label: string
  key: string
  macLabel?: string
  macKey?: string
  w?: string
}

const ROWS: KeyDef[][] = [
  // Function row
  [
    { label: 'Esc', key: 'Esc' },
    { label: 'F1', key: 'F1' }, { label: 'F2', key: 'F2' }, { label: 'F3', key: 'F3' }, { label: 'F4', key: 'F4' },
    { label: 'F5', key: 'F5' }, { label: 'F6', key: 'F6' }, { label: 'F7', key: 'F7' }, { label: 'F8', key: 'F8' },
    { label: 'F9', key: 'F9' }, { label: 'F10', key: 'F10' }, { label: 'F11', key: 'F11' }, { label: 'F12', key: 'F12' },
    { label: 'PrtSc', key: 'PrtSc' },
  ],
  // Numbers row
  [
    { label: '`', key: '`' },
    { label: '1', key: '1' }, { label: '2', key: '2' }, { label: '3', key: '3' }, { label: '4', key: '4' },
    { label: '5', key: '5' }, { label: '6', key: '6' }, { label: '7', key: '7' }, { label: '8', key: '8' },
    { label: '9', key: '9' }, { label: '0', key: '0' }, { label: '-', key: '-' }, { label: '=', key: '=' },
    { label: 'Backspace', key: 'Backspace', w: 'min-w-[72px]' },
  ],
  // QWERTY row
  [
    { label: 'Tab', key: 'Tab', w: 'min-w-[60px]' },
    { label: 'Q', key: 'Q' }, { label: 'W', key: 'W' }, { label: 'E', key: 'E' }, { label: 'R', key: 'R' },
    { label: 'T', key: 'T' }, { label: 'Y', key: 'Y' }, { label: 'U', key: 'U' }, { label: 'I', key: 'I' },
    { label: 'O', key: 'O' }, { label: 'P', key: 'P' }, { label: '[', key: '[' }, { label: ']', key: ']' },
    { label: '\\', key: '\\' },
  ],
  // Home row
  [
    { label: 'CapsLock', key: 'CapsLock', w: 'min-w-[68px]' },
    { label: 'A', key: 'A' }, { label: 'S', key: 'S' }, { label: 'D', key: 'D' }, { label: 'F', key: 'F' },
    { label: 'G', key: 'G' }, { label: 'H', key: 'H' }, { label: 'J', key: 'J' }, { label: 'K', key: 'K' },
    { label: 'L', key: 'L' }, { label: ';', key: ';' }, { label: "'", key: "'" },
    { label: 'Enter', key: 'Enter', w: 'min-w-[80px]' },
  ],
  // Shift row
  [
    { label: 'Shift', key: 'Shift', w: 'min-w-[90px]' },
    { label: 'Z', key: 'Z' }, { label: 'X', key: 'X' }, { label: 'C', key: 'C' }, { label: 'V', key: 'V' },
    { label: 'B', key: 'B' }, { label: 'N', key: 'N' }, { label: 'M', key: 'M' },
    { label: ',', key: ',' }, { label: '.', key: '.' }, { label: '/', key: '/' },
    { label: 'Shift', key: 'Shift', w: 'min-w-[90px]' },
  ],
  // Bottom row
  [
    { label: 'Ctrl', key: 'Ctrl', w: 'min-w-[52px]' },
    { label: 'Win', key: 'Win', macLabel: '⌘', macKey: 'Cmd', w: 'min-w-[52px]' },
    { label: 'Alt', key: 'Alt', macLabel: 'Opt', macKey: 'Opt', w: 'min-w-[52px]' },
    { label: 'Space', key: 'Space', w: 'min-w-[240px]' },
    { label: 'Alt', key: 'Alt', macLabel: 'Opt', macKey: 'Opt', w: 'min-w-[52px]' },
    { label: 'Ctrl', key: 'Ctrl', w: 'min-w-[52px]' },
    { label: '←', key: 'Left' },
    { label: '↑', key: 'Up' },
    { label: '↓', key: 'Down' },
    { label: '→', key: 'Right' },
  ],
]

// Full-size dimensions (6 rows × 36px + 5 gaps × 4px)
const FULL_W = 680
const FULL_H = 236
// Compact dimensions for interactive/mobile
const COMPACT_W = 468
const COMPACT_H = 188

const COMPACT_WIDTHS: Record<string, string> = {
  'min-w-[240px]': 'min-w-[120px]',
  'min-w-[90px]':  'min-w-[60px]',
  'min-w-[80px]':  'min-w-[60px]',
  'min-w-[72px]':  'min-w-[48px]',
  'min-w-[68px]':  'min-w-[48px]',
  'min-w-[60px]':  'min-w-[44px]',
  'min-w-[52px]':  'min-w-[40px]',
}

const MODIFIERS = new Set(['Ctrl', 'Cmd', 'Win', 'Alt', 'Opt', 'Shift'])

export default function OnScreenKeyboard({
  pressedKeys,
  highlightKeys,
  wrongKeys  = [],
  hintKeys   = [],
  onKeyPress,
  interactive,
  os,
}: OnScreenKeyboardProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const [scale, setScale]           = useState(1)
  const [toggledMods, setToggledMods] = useState<string[]>([])
  const [pulseOn, setPulseOn]       = useState(false)

  const naturalW = interactive ? COMPACT_W : FULL_W
  const naturalH = interactive ? COMPACT_H : FULL_H

  const keyH    = interactive ? 'h-7'         : 'h-9'
  const keyPx   = interactive ? 'px-1'        : 'px-2'
  const keyText = interactive ? 'text-[10px]' : 'text-xs'
  const defaultW = interactive ? 'min-w-[28px]' : 'min-w-[36px]'

  function getKeyW(def: KeyDef): string {
    if (!interactive || !def.w) return def.w ?? defaultW
    return COMPACT_WIDTHS[def.w] ?? defaultW
  }

  useEffect(() => {
    if (highlightKeys.length === 0) return
    setPulseOn(true)
    const t = setTimeout(() => setPulseOn(false), 500)
    return () => clearTimeout(t)
  }, [highlightKeys])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / naturalW))
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [naturalW])

  function handlePress(rawKey: string) {
    if (!interactive) return
    if (MODIFIERS.has(rawKey)) {
      setToggledMods(prev =>
        prev.includes(rawKey) ? prev.filter(k => k !== rawKey) : [...prev, rawKey]
      )
      onKeyPress?.(rawKey)
    } else {
      onKeyPress?.(rawKey)
      setToggledMods([])
    }
  }

  const pressedSet   = useMemo(
    () => new Set([...pressedKeys, ...toggledMods].map(k => k.toLowerCase())),
    [pressedKeys, toggledMods],
  )
  const highlightSet = useMemo(() => new Set(highlightKeys.map(k => k.toLowerCase())), [highlightKeys])
  const wrongSet     = useMemo(() => new Set(wrongKeys.map(k => k.toLowerCase())), [wrongKeys])
  const hintSet      = useMemo(() => new Set(hintKeys.map(k => k.toLowerCase())), [hintKeys])

  return (
    <div ref={containerRef} className="w-full" style={{ height: `${Math.round(scale * naturalH)}px`, overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${naturalW}px` }}>
        <div className="flex flex-col gap-1">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((def, ki) => {
                const effectiveKey   = (os === 'mac' && def.macKey)   ? def.macKey   : def.key
                const effectiveLabel = (os === 'mac' && def.macLabel) ? def.macLabel : def.label
                const ek = effectiveKey.toLowerCase()

                const isWrong      = wrongSet.has(ek)
                const isHighlighted = !isWrong && highlightSet.has(ek)
                const isHint       = !isWrong && !isHighlighted && hintSet.has(ek)
                const isPressed    = !isWrong && !isHighlighted && !isHint && pressedSet.has(ek)

                let cls = 'bg-zinc-800 border-zinc-600 text-zinc-300'
                if (isWrong)            cls = 'bg-rose-900 border-rose-600 text-rose-300'
                else if (isHighlighted) cls = `bg-green-900 border-2 border-green-400 text-green-300 font-bold ${pulseOn ? 'animate-pulse' : ''}`
                else if (isHint)        cls = 'bg-amber-900 border border-amber-600 text-amber-400 font-bold'
                else if (isPressed)     cls = 'bg-green-700 border-green-500 text-white scale-95'

                const base = `flex items-center justify-center ${keyH} ${keyPx} rounded-md border ${keyText} font-mono transition-all duration-75 select-none ${getKeyW(def)} ${cls}`

                if (interactive) {
                  return (
                    <button key={ki} type="button" className={base} onPointerDown={() => handlePress(effectiveKey)}>
                      {effectiveLabel}
                    </button>
                  )
                }
                return <div key={ki} className={base}>{effectiveLabel}</div>
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
