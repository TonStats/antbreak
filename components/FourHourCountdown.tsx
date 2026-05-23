'use client'

import { useState, useEffect } from 'react'

function getTimeUntilNextRotation() {
  const now = new Date()
  const currentHour = now.getHours()
  const nextRotationHour = (Math.floor(currentHour / 4) + 1) * 4
  const hoursLeft = nextRotationHour - now.getHours() - 1
  const minsLeft  = 59 - now.getMinutes()
  const secsLeft  = 59 - now.getSeconds()
  return { hoursLeft, minsLeft, secsLeft }
}

export default function FourHourCountdown() {
  const [time, setTime] = useState<{ hoursLeft: number; minsLeft: number; secsLeft: number } | null>(null)

  useEffect(() => {
    setTime(getTimeUntilNextRotation())
    const id = setInterval(() => setTime(getTimeUntilNextRotation()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  const hh = String(time.hoursLeft).padStart(2, '0')
  const mm = String(time.minsLeft).padStart(2, '0')
  const ss = String(time.secsLeft).padStart(2, '0')

  return (
    <span className="font-mono text-3xl font-extrabold tabular-nums text-brand-600 dark:text-brand-400">
      {hh}:{mm}:{ss}
    </span>
  )
}
