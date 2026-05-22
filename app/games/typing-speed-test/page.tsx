import type { Metadata } from 'next'
import TypingGame from './TypingGame'

export const metadata: Metadata = {
  title: 'Typing Speed Test — Check Your WPM Free | Antbreak',
  description:
    'Free online typing speed test. Check your WPM in real time, beat your personal best, and track your accuracy. No signup required.',
}

export default function TypingSpeedTestPage() {
  return <TypingGame />
}
