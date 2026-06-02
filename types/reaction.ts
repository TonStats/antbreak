export type ReactionTestType =
  'color' | 'aim' | 'number' | 'rhythm'

export type ReactionStage =
  'setup' | 'waiting' | 'active' |
  'roundResult' | 'summary'

export interface ReactionRound {
  reactionMs: number
  accurate: boolean
  falseStart: boolean
}

export interface ReactionResult {
  testType: ReactionTestType
  rounds: ReactionRound[]
  averageMs: number
  bestMs: number
  accuracy: number
  score: number
  date: string
}

export interface ReactionGrade {
  label: string
  description: string
  color: string
  emoji: string
}

export function getGrade(
  avgMs: number,
  testType: ReactionTestType
): ReactionGrade {
  if (testType === 'color' ||
      testType === 'aim') {
    if (avgMs < 150) return {
      label: 'Superhuman',
      description: 'Top 1% of all players',
      color: 'text-yellow-400',
      emoji: '⚡'
    }
    if (avgMs < 200) return {
      label: 'Elite',
      description: 'Faster than 95% of players',
      color: 'text-cyan-400',
      emoji: '🏆'
    }
    if (avgMs < 250) return {
      label: 'Pro',
      description: 'Faster than 75% of players',
      color: 'text-green-400',
      emoji: '🎯'
    }
    if (avgMs < 300) return {
      label: 'Average',
      description: 'Typical human reaction time',
      color: 'text-blue-400',
      emoji: '👍'
    }
    if (avgMs < 400) return {
      label: 'Developing',
      description: 'Keep practising',
      color: 'text-orange-400',
      emoji: '📈'
    }
    return {
      label: 'Slow',
      description: 'Try again when rested',
      color: 'text-zinc-400',
      emoji: '😴'
    }
  }
  // Number and Rhythm use different thresholds
  if (avgMs < 400) return {
    label: 'Excellent',
    description: 'Very fast processing speed',
    color: 'text-yellow-400',
    emoji: '⚡'
  }
  if (avgMs < 600) return {
    label: 'Good',
    description: 'Above average processing',
    color: 'text-green-400',
    emoji: '🎯'
  }
  if (avgMs < 800) return {
    label: 'Average',
    description: 'Normal processing speed',
    color: 'text-blue-400',
    emoji: '👍'
  }
  return {
    label: 'Keep Practising',
    description: 'Focus and try again',
    color: 'text-orange-400',
    emoji: '📈'
  }
}

export const COMPARISON_DATA = {
  color: {
    average: 284,
    description:
      'Average human visual reaction time'
  },
  aim: {
    average: 320,
    description:
      'Average aimed click reaction time'
  },
  number: {
    average: 580,
    description:
      'Average number recognition time'
  },
  rhythm: {
    average: 45,
    description:
      'Average rhythm deviation in ms'
  }
}
