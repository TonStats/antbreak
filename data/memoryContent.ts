import type { Difficulty, MemoryCard, DailyImage } from '@/types/memory'

export const EMOJI_THEMES: Record<string, string[]> = {
  animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦'],
  food:    ['🍎','🍊','🍋','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥝','🍅','🥑','🌽','🥕','🧅','🥦','🍄'],
  sports:  ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','⛳','🎯','🎳','🏹','🛹','🥌'],
  travel:  ['✈️','🚂','🚢','🚁','🏖️','🏔️','🗼','🏰','🗽','🎡','🌋','🏜️','🛕','⛩️','🏟️','🗺️','🧳','🌉'],
  nature:  ['🌸','🌺','🌻','🌹','🌷','🌼','🍀','🌿','🍃','🌱','🌳','🌲','🍂','🍁','🌾','🌵','🎋','🎍'],
  objects: ['💡','🔦','📱','💻','⌚','📷','🎸','🎺','🎹','🎨','📚','✏️','🔑','🔒','🎁','💎','🔭','🎭'],
}

export const DAILY_FLASH_SETS: DailyImage[] = [
  {
    id: 'day-01',
    emojis: ['🐶','🍎','⚽','✈️','🌸'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐱','🐶','🐰','🦊'], answer: '🐶' },
      { question: 'Which fruit appeared?', options: ['🍊','🍋','🍎','🍇'], answer: '🍎' },
      { question: 'Which sport appeared?', options: ['🏀','⚽','🏈','⚾'], answer: '⚽' },
      { question: 'Which travel emoji appeared?', options: ['🚂','🚢','✈️','🚁'], answer: '✈️' },
    ],
  },
  {
    id: 'day-02',
    emojis: ['🐱','🍊','🏀','🚂','🌺'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐶','🐱','🐭','🐹'], answer: '🐱' },
      { question: 'Which fruit appeared?', options: ['🍎','🍊','🍋','🍇'], answer: '🍊' },
      { question: 'Which sport appeared?', options: ['⚽','🏀','🏈','⚾'], answer: '🏀' },
      { question: 'Which transport appeared?', options: ['✈️','🚂','🚢','🚁'], answer: '🚂' },
    ],
  },
  {
    id: 'day-03',
    emojis: ['🐭','🍋','🏈','🚢','🌻'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐰','🦊','🐻','🐭'], answer: '🐭' },
      { question: 'Which fruit appeared?', options: ['🍎','🍊','🍋','🍒'], answer: '🍋' },
      { question: 'Which sport appeared?', options: ['⚽','🏀','🏈','⚾'], answer: '🏈' },
      { question: 'Which transport appeared?', options: ['✈️','🚂','🚢','🚁'], answer: '🚢' },
    ],
  },
  {
    id: 'day-04',
    emojis: ['🐹','🍇','⚾','🚁','🌹'],
    displayTime: 5000,
    questions: [
      { question: 'Which small animal appeared?', options: ['🐭','🐹','🐰','🦊'], answer: '🐹' },
      { question: 'Which fruit appeared?', options: ['🍎','🍊','🍋','🍇'], answer: '🍇' },
      { question: 'Which sport appeared?', options: ['⚽','🏀','🏈','⚾'], answer: '⚾' },
      { question: 'Which vehicle appeared?', options: ['✈️','🚂','🚢','🚁'], answer: '🚁' },
    ],
  },
  {
    id: 'day-05',
    emojis: ['🐰','🍓','🎾','🏖️','🌷'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐶','🐱','🐰','🐻'], answer: '🐰' },
      { question: 'Which berry appeared?', options: ['🫐','🍓','🍒','🍑'], answer: '🍓' },
      { question: 'Which sport appeared?', options: ['⚽','🏀','🎾','🏐'], answer: '🎾' },
      { question: 'Which vacation spot appeared?', options: ['🏔️','🏖️','🗼','🏰'], answer: '🏖️' },
    ],
  },
  {
    id: 'day-06',
    emojis: ['🦊','🫐','🏐','🏔️','🌼'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐶','🐱','🦊','🐻'], answer: '🦊' },
      { question: 'Which berry appeared?', options: ['🍓','🫐','🍒','🍑'], answer: '🫐' },
      { question: 'Which sport appeared?', options: ['⚽','🏀','🎾','🏐'], answer: '🏐' },
      { question: 'Which landscape appeared?', options: ['🏖️','🏔️','🗼','🏰'], answer: '🏔️' },
    ],
  },
  {
    id: 'day-07',
    emojis: ['🐻','🍒','🏉','🗼','🍀'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐼','🐨','🐻','🐯'], answer: '🐻' },
      { question: 'Which fruit appeared?', options: ['🍓','🫐','🍒','🍑'], answer: '🍒' },
      { question: 'Which sport appeared?', options: ['⚽','🏀','🏐','🏉'], answer: '🏉' },
      { question: 'Which landmark appeared?', options: ['🏖️','🏔️','🗼','🏰'], answer: '🗼' },
    ],
  },
  {
    id: 'day-08',
    emojis: ['🐼','🍑','🎱','🏰','🌿'],
    displayTime: 5000,
    questions: [
      { question: 'Which bear appeared?', options: ['🐻','🐼','🐨','🦁'], answer: '🐼' },
      { question: 'Which fruit appeared?', options: ['🍒','🍑','🥭','🍍'], answer: '🍑' },
      { question: 'Which game appeared?', options: ['🎾','🏐','🎱','🏓'], answer: '🎱' },
      { question: 'Which landmark appeared?', options: ['🗼','🏰','🗽','🎡'], answer: '🏰' },
    ],
  },
  {
    id: 'day-09',
    emojis: ['🐨','🥭','🏓','🗽','🍃'],
    displayTime: 5000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐻','🐼','🐨','🐯'], answer: '🐨' },
      { question: 'Which tropical fruit appeared?', options: ['🍑','🥭','🍍','🥝'], answer: '🥭' },
      { question: 'Which game appeared?', options: ['🎱','🏓','🏸','🥊'], answer: '🏓' },
      { question: 'Which statue appeared?', options: ['🗼','🏰','🗽','🎡'], answer: '🗽' },
    ],
  },
  {
    id: 'day-10',
    emojis: ['🐯','🍍','🏸','🎡','🌱'],
    displayTime: 5000,
    questions: [
      { question: 'Which big cat appeared?', options: ['🦁','🐯','🐻','🐼'], answer: '🐯' },
      { question: 'Which tropical fruit appeared?', options: ['🥭','🍍','🥝','🍅'], answer: '🍍' },
      { question: 'Which sport appeared?', options: ['🏓','🏸','🥊','🥋'], answer: '🏸' },
      { question: 'Which attraction appeared?', options: ['🗽','🏰','🎡','🌋'], answer: '🎡' },
    ],
  },
  {
    id: 'day-11',
    emojis: ['🦁','🥝','🥊','🌋','🌳'],
    displayTime: 5000,
    questions: [
      { question: 'Which big cat appeared?', options: ['🐯','🦁','🐻','🐮'], answer: '🦁' },
      { question: 'Which fruit appeared?', options: ['🍍','🥝','🍅','🥑'], answer: '🥝' },
      { question: 'Which combat sport appeared?', options: ['🏸','🥊','🥋','⛳'], answer: '🥊' },
      { question: 'Which natural wonder appeared?', options: ['🎡','🌋','🏜️','🛕'], answer: '🌋' },
    ],
  },
  {
    id: 'day-12',
    emojis: ['🐮','🍅','🥋','🏜️','🌲'],
    displayTime: 5000,
    questions: [
      { question: 'Which farm animal appeared?', options: ['🐷','🐮','🐸','🐵'], answer: '🐮' },
      { question: 'Which vegetable appeared?', options: ['🥝','🍅','🥑','🌽'], answer: '🍅' },
      { question: 'Which martial art appeared?', options: ['🥊','🥋','⛳','🎯'], answer: '🥋' },
      { question: 'Which landscape appeared?', options: ['🌋','🏜️','🛕','⛩️'], answer: '🏜️' },
    ],
  },
  {
    id: 'day-13',
    emojis: ['🐷','🥑','⛳','🛕','🍂'],
    displayTime: 5000,
    questions: [
      { question: 'Which farm animal appeared?', options: ['🐮','🐷','🐸','🐵'], answer: '🐷' },
      { question: 'Which green food appeared?', options: ['🍅','🥑','🌽','🥕'], answer: '🥑' },
      { question: 'Which outdoor sport appeared?', options: ['🥋','⛳','🎯','🎳'], answer: '⛳' },
      { question: 'Which temple appeared?', options: ['🏜️','🛕','⛩️','🏟️'], answer: '🛕' },
    ],
  },
  {
    id: 'day-14',
    emojis: ['🐸','🌽','🎯','⛩️','🍁'],
    displayTime: 5000,
    questions: [
      { question: 'Which amphibian appeared?', options: ['🐷','🐸','🐵','🐔'], answer: '🐸' },
      { question: 'Which vegetable appeared?', options: ['🥑','🌽','🥕','🧅'], answer: '🌽' },
      { question: 'Which target sport appeared?', options: ['⛳','🎯','🎳','🏹'], answer: '🎯' },
      { question: 'Which gate appeared?', options: ['🛕','⛩️','🏟️','🗺️'], answer: '⛩️' },
    ],
  },
  {
    id: 'day-15',
    emojis: ['🐵','🥕','🎳','🏟️','🌾'],
    displayTime: 5000,
    questions: [
      { question: 'Which primate appeared?', options: ['🐸','🐵','🐔','🐧'], answer: '🐵' },
      { question: 'Which root vegetable appeared?', options: ['🌽','🥕','🧅','🥦'], answer: '🥕' },
      { question: 'Which sport appeared?', options: ['🎯','🎳','🏹','🛹'], answer: '🎳' },
      { question: 'Which venue appeared?', options: ['⛩️','🏟️','🗺️','🧳'], answer: '🏟️' },
    ],
  },
  {
    id: 'day-16',
    emojis: ['🐔','🧅','🏹','🗺️','🌵'],
    displayTime: 5000,
    questions: [
      { question: 'Which bird appeared?', options: ['🐵','🐔','🐧','🐦'], answer: '🐔' },
      { question: 'Which vegetable appeared?', options: ['🥕','🧅','🥦','🍄'], answer: '🧅' },
      { question: 'Which weapon sport appeared?', options: ['🎳','🏹','🛹','🥌'], answer: '🏹' },
      { question: 'Which travel item appeared?', options: ['🏟️','🗺️','🧳','🌉'], answer: '🗺️' },
    ],
  },
  {
    id: 'day-17',
    emojis: ['🐧','🥦','🛹','🧳','🎋'],
    displayTime: 5000,
    questions: [
      { question: 'Which bird appeared?', options: ['🐔','🐧','🐦','🦁'], answer: '🐧' },
      { question: 'Which vegetable appeared?', options: ['🧅','🥦','🍄','🥑'], answer: '🥦' },
      { question: 'Which board sport appeared?', options: ['🏹','🛹','🥌','🎾'], answer: '🛹' },
      { question: 'Which travel item appeared?', options: ['🗺️','🧳','🌉','✈️'], answer: '🧳' },
    ],
  },
  {
    id: 'day-18',
    emojis: ['🐦','🍄','🥌','🌉','🎍'],
    displayTime: 5000,
    questions: [
      { question: 'Which bird appeared?', options: ['🐧','🐦','🦊','🐻'], answer: '🐦' },
      { question: 'Which fungi appeared?', options: ['🥦','🍄','🥕','🌽'], answer: '🍄' },
      { question: 'Which winter sport appeared?', options: ['🛹','🥌','🎾','🏐'], answer: '🥌' },
      { question: 'Which structure appeared?', options: ['🧳','🌉','🗺️','🏟️'], answer: '🌉' },
    ],
  },
  {
    id: 'day-19',
    emojis: ['🐶','🍊','🏀','🗼','🌸'],
    displayTime: 4000,
    questions: [
      { question: 'Which animal appeared?', options: ['🐱','🐶','🐭','🐹'], answer: '🐶' },
      { question: 'Which citrus appeared?', options: ['🍎','🍊','🍋','🍇'], answer: '🍊' },
      { question: 'Which ball sport appeared?', options: ['⚽','🏀','🏈','⚾'], answer: '🏀' },
      { question: 'Which tower appeared?', options: ['🏰','🗽','🗼','🎡'], answer: '🗼' },
    ],
  },
  {
    id: 'day-20',
    emojis: ['🐱','🍋','⚽','🏰','🌺'],
    displayTime: 4000,
    questions: [
      { question: 'Which pet appeared?', options: ['🐶','🐱','🐭','🦊'], answer: '🐱' },
      { question: 'Which citrus appeared?', options: ['🍊','🍋','🍇','🍓'], answer: '🍋' },
      { question: 'Which ball sport appeared?', options: ['🏀','⚽','🏈','🎾'], answer: '⚽' },
      { question: 'Which castle appeared?', options: ['🗼','🗽','🏰','🎡'], answer: '🏰' },
    ],
  },
  {
    id: 'day-21',
    emojis: ['🐻','🍓','🎾','🌋','🌻'],
    displayTime: 4000,
    questions: [
      { question: 'Which bear appeared?', options: ['🐼','🐻','🐨','🐯'], answer: '🐻' },
      { question: 'Which red fruit appeared?', options: ['🍎','🍒','🍓','🍅'], answer: '🍓' },
      { question: 'Which racket sport appeared?', options: ['🏓','🏸','🎾','🥊'], answer: '🎾' },
      { question: 'Which volcano appeared?', options: ['🏔️','🌋','🏜️','⛰️'], answer: '🌋' },
    ],
  },
  {
    id: 'day-22',
    emojis: ['🦁','🥭','🥊','🏖️','🌹'],
    displayTime: 4000,
    questions: [
      { question: 'Which big cat appeared?', options: ['🐯','🦁','🐻','🐼'], answer: '🦁' },
      { question: 'Which tropical fruit appeared?', options: ['🍍','🥭','🥝','🍑'], answer: '🥭' },
      { question: 'Which combat sport appeared?', options: ['🥋','🥊','⛳','🎱'], answer: '🥊' },
      { question: 'Which beach appeared?', options: ['🏔️','🏖️','🌋','🏜️'], answer: '🏖️' },
    ],
  },
  {
    id: 'day-23',
    emojis: ['🐮','🍍','🏸','🗽','🌷'],
    displayTime: 4000,
    questions: [
      { question: 'Which farm animal appeared?', options: ['🐷','🐮','🐸','🦁'], answer: '🐮' },
      { question: 'Which tropical fruit appeared?', options: ['🥭','🍍','🥝','🍋'], answer: '🍍' },
      { question: 'Which racket sport appeared?', options: ['🎾','🏓','🏸','🎱'], answer: '🏸' },
      { question: 'Which statue appeared?', options: ['🗼','🏰','🗽','🎡'], answer: '🗽' },
    ],
  },
  {
    id: 'day-24',
    emojis: ['🐷','🥝','🎱','🎡','🍀'],
    displayTime: 4000,
    questions: [
      { question: 'Which farm animal appeared?', options: ['🐮','🐷','🐸','🐵'], answer: '🐷' },
      { question: 'Which fruit appeared?', options: ['🍍','🥝','🍅','🥑'], answer: '🥝' },
      { question: 'Which table game appeared?', options: ['🏸','🎱','🏓','🥊'], answer: '🎱' },
      { question: 'Which fairground ride appeared?', options: ['🗽','🏰','🎡','🌋'], answer: '🎡' },
    ],
  },
  {
    id: 'day-25',
    emojis: ['🐸','🌽','🏹','⛩️','🍃'],
    displayTime: 4000,
    questions: [
      { question: 'Which amphibian appeared?', options: ['🐵','🐸','🐔','🐧'], answer: '🐸' },
      { question: 'Which vegetable appeared?', options: ['🥕','🌽','🥦','🧅'], answer: '🌽' },
      { question: 'Which archery appeared?', options: ['🎯','🎳','🏹','🛹'], answer: '🏹' },
      { question: 'Which gate appeared?', options: ['🛕','⛩️','🏟️','🗺️'], answer: '⛩️' },
    ],
  },
  {
    id: 'day-26',
    emojis: ['🐵','🥕','🎳','🏟️','🌱'],
    displayTime: 4000,
    questions: [
      { question: 'Which primate appeared?', options: ['🐸','🐵','🐔','🦁'], answer: '🐵' },
      { question: 'Which root vegetable appeared?', options: ['🌽','🥕','🧅','🥑'], answer: '🥕' },
      { question: 'Which sport appeared?', options: ['🏹','🎳','🛹','🥌'], answer: '🎳' },
      { question: 'Which sports venue appeared?', options: ['⛩️','🛕','🏟️','🗼'], answer: '🏟️' },
    ],
  },
  {
    id: 'day-27',
    emojis: ['🐔','🥦','🛹','🧳','🌳'],
    displayTime: 3500,
    questions: [
      { question: 'Which bird appeared?', options: ['🐧','🐦','🐔','🦊'], answer: '🐔' },
      { question: 'Which green vegetable appeared?', options: ['🥕','🥦','🧅','🍄'], answer: '🥦' },
      { question: 'Which board sport appeared?', options: ['🎳','🛹','🥌','🏹'], answer: '🛹' },
      { question: 'Which luggage appeared?', options: ['🗺️','🧳','🌉','✈️'], answer: '🧳' },
    ],
  },
  {
    id: 'day-28',
    emojis: ['🐧','🍄','🥌','🌉','🍂'],
    displayTime: 3500,
    questions: [
      { question: 'Which flightless bird appeared?', options: ['🐔','🐦','🐧','🦁'], answer: '🐧' },
      { question: 'Which fungi appeared?', options: ['🥦','🍄','🥕','🌽'], answer: '🍄' },
      { question: 'Which winter sport appeared?', options: ['🛹','🏹','🥌','🎳'], answer: '🥌' },
      { question: 'Which bridge appeared?', options: ['🧳','🌉','🗺️','⛩️'], answer: '🌉' },
    ],
  },
  {
    id: 'day-29',
    emojis: ['🐦','🥑','🏓','🗺️','🌾'],
    displayTime: 3500,
    questions: [
      { question: 'Which bird appeared?', options: ['🐧','🐔','🐦','🐻'], answer: '🐦' },
      { question: 'Which green food appeared?', options: ['🍄','🥑','🌽','🥦'], answer: '🥑' },
      { question: 'Which table sport appeared?', options: ['🎱','🏸','🏓','🥊'], answer: '🏓' },
      { question: 'Which map appeared?', options: ['🌉','🧳','🗺️','🏟️'], answer: '🗺️' },
    ],
  },
  {
    id: 'day-30',
    emojis: ['🦊','🍒','🏉','🏜️','🌺'],
    displayTime: 3500,
    questions: [
      { question: 'Which canine appeared?', options: ['🐶','🐱','🦊','🐻'], answer: '🦊' },
      { question: 'Which red fruit appeared?', options: ['🍓','🍒','🍅','🍎'], answer: '🍒' },
      { question: 'Which ball appeared?', options: ['⚽','🏀','🏈','🏉'], answer: '🏉' },
      { question: 'Which desert appeared?', options: ['🌋','🏔️','🏜️','🏖️'], answer: '🏜️' },
    ],
  },
]

export function getDailySet(): DailyImage {
  const day = new Date().getDate() - 1
  return DAILY_FLASH_SETS[day % DAILY_FLASH_SETS.length]
}

export function getGridCards(difficulty: Difficulty, theme: string): MemoryCard[] {
  const emojiPool = EMOJI_THEMES[theme] ?? EMOJI_THEMES.animals
  const pairCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : difficulty === 'hard' ? 15 : 18
  const selected = emojiPool.slice(0, pairCount)
  const pairs = [...selected, ...selected]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((emoji, i) => ({
    id: `card-${i}`,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
}

export function getSequenceEmojis(level: number): string[] {
  const all = Object.values(EMOJI_THEMES).flat()
  const length = Math.min(3 + level, 12)
  const seed = level * 17 + 3
  const result: string[] = []
  for (let i = 0; i < length; i++) {
    result.push(all[(seed * (i + 1) * 31) % all.length])
  }
  return result
}
