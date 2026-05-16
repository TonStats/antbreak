'use client'

import { useState, useEffect } from 'react'

function secondsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
}

function fmt(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function MidnightCountdown() {
  // null on server / first render — avoids hydration mismatch with clock reads
  const [secs, setSecs] = useState<number | null>(null)

  useEffect(() => {
    setSecs(secondsUntilMidnight())
    const id = setInterval(() => setSecs(secondsUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-3xl font-extrabold tabular-nums text-brand-600 dark:text-brand-400">
      {secs === null ? '--:--:--' : fmt(secs)}
    </span>
  )
}
