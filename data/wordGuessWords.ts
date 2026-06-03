import type { LetterState } from '@/types/wordGuess'

// ── 4-letter words (60) ───────────────────────────────────────────────────────
const WORDS_4: string[] = [
  'LION', 'FIRE', 'MOON', 'FROG', 'JADE', 'WIND', 'LAMP', 'DOOR', 'RUBY', 'KITE',
  'WOLF', 'GOLD', 'RAIN', 'STAR', 'FISH', 'BIRD', 'DARK', 'BLUE', 'ROSE', 'PINE',
  'BEAR', 'CAVE', 'DUSK', 'EDGE', 'FARM', 'GALE', 'HARP', 'IRIS', 'JOLT', 'KELP',
  'LARK', 'MALT', 'NEST', 'OPAL', 'PALM', 'QUIZ', 'REED', 'SAGE', 'TEAK', 'VEIL',
  'WREN', 'YARN', 'ZINC', 'ARCH', 'BULK', 'CLAM', 'DIME', 'EPIC', 'FLAG', 'GRIP',
  'HAWK', 'ISLE', 'JEST', 'KNOT', 'LEAF', 'MAZE', 'NOOK', 'OVAL', 'PEAR', 'REEF',
]

// ── 5-letter words (80) ───────────────────────────────────────────────────────
const WORDS_5: string[] = [
  'TIGER', 'BREAD', 'OCEAN', 'STORM', 'PIANO', 'EAGLE', 'FROST', 'BRAVE', 'CHESS', 'CRISP',
  'FLUTE', 'PRISM', 'QUILL', 'GROVE', 'SWIFT', 'BLAZE', 'CRANE', 'TROUT', 'AUDIO', 'BASIC',
  'CORAL', 'DEPTH', 'ELOPE', 'FLAME', 'GLOBE', 'HERBS', 'IDEAL', 'JOUST', 'KNAVE', 'LIGHT',
  'MERIT', 'NURSE', 'OPTIC', 'PLAID', 'QUEST', 'RAVEN', 'SCALP', 'THYME', 'UNITY', 'VIVID',
  'WALTZ', 'YACHT', 'ZEBRA', 'AMBER', 'BENCH', 'CLOAK', 'DRIFT', 'EXERT', 'FLANK', 'GRACE',
  'HEDGE', 'INFER', 'JEWEL', 'KARMA', 'LEMON', 'MAPLE', 'NIGHT', 'OXIDE', 'PLUMB', 'RIVET',
  'SALVE', 'ULTRA', 'VALVE', 'WITCH', 'AXIOM', 'BIRTH', 'CREST', 'DRAKE', 'EVENT', 'FARCE',
  'GAUZE', 'HEIST', 'INTER', 'JELLY', 'KHAKI', 'LYRIC', 'MAGIC', 'NOVEL', 'OCTET', 'PAINT',
]

// ── 6-letter words (60) ───────────────────────────────────────────────────────
const WORDS_6: string[] = [
  'BRIDGE', 'CASTLE', 'DRAGON', 'FOREST', 'PLANET', 'SILVER', 'TOMATO', 'WINTER', 'CANDLE', 'LOCKET',
  'MARBLE', 'ORCHID', 'PILLOW', 'QUARTZ', 'ROCKET', 'SUNSET', 'TROPHY', 'VALLEY', 'WISDOM', 'ANCHOR',
  'BARLEY', 'CIRCLE', 'DAGGER', 'EMPIRE', 'FALCON', 'GOBLIN', 'HAMPER', 'INSECT', 'JUNGLE', 'KERNEL',
  'LAGOON', 'MUFFIN', 'NEBULA', 'OYSTER', 'PEBBLE', 'RADISH', 'SADDLE', 'TEMPLE', 'UNFURL', 'VELVET',
  'WALRUS', 'YELLOW', 'ZIPPER', 'BATTLE', 'COBALT', 'DONKEY', 'ELIXIR', 'FAMINE', 'GARNET', 'HUNTER',
  'IODINE', 'JACKET', 'JIGSAW', 'KIPPER', 'LUSTER', 'MAGNET', 'NOODLE', 'OCELOT', 'PONDER', 'RACKET',
]

// ── 7-letter words (50) ───────────────────────────────────────────────────────
const WORDS_7: string[] = [
  'CAPTAIN', 'DIAMOND', 'ECHIDNA', 'FEATHER', 'GLACIER', 'HARVEST', 'JOURNEY', 'LANTERN', 'MUSTARD', 'NETWORK',
  'PERFECT', 'RAINBOW', 'STATION', 'THUNDER', 'UNIFORM', 'VERBOSE', 'WESTERN', 'EXTRACT', 'FANTASY', 'GENUINE',
  'IMAGINE', 'JUSTICE', 'KITCHEN', 'LEATHER', 'MIRACLE', 'NATURAL', 'OUTDOOR', 'PACKAGE', 'QUARTER', 'READING',
  'SCIENCE', 'THEATER', 'UPGRADE', 'VERSION', 'WARNING', 'EXAMPLE', 'BALANCE', 'CABINET', 'DISPLAY', 'FIGHTER',
  'GRAMMAR', 'HEALTHY', 'INSTALL', 'LULLABY', 'MAXIMUM', 'NOTHING', 'PREPARE', 'QUALITY', 'RESTORE', 'SANDBAR',
]

// ── 8-letter words (30) ───────────────────────────────────────────────────────
const WORDS_8: string[] = [
  'BACKBONE', 'CALENDAR', 'CHAMPION', 'DAUGHTER', 'ELEPHANT', 'FRACTURE', 'GARDENIA', 'HOLOGRAM', 'INFANTRY', 'JEALOUSY',
  'KEYBOARD', 'LANDMARK', 'MOMENTUM', 'NITROGEN', 'OBSTACLE', 'PARADISE', 'QUANTITY', 'REGIMENT', 'TRIANGLE', 'UMBRELLA',
  'VOLCANIC', 'WARDROBE', 'ABSOLUTE', 'BIRTHDAY', 'CARDINAL', 'DOORSTEP', 'ENVELOPE', 'FESTIVAL', 'GEOMETRY', 'HANDMADE',
]

// ── 9-letter words (10) ───────────────────────────────────────────────────────
const WORDS_9: string[] = [
  'ADVENTURE', 'BLUEPRINT', 'CELEBRATE', 'DISCOVERY', 'EVERGREEN',
  'FREQUENCY', 'KNOWLEDGE', 'MESSENGER', 'NIGHTMARE', 'PATCHWORK',
]

// ── 10-letter words (10) ──────────────────────────────────────────────────────
const WORDS_10: string[] = [
  'ACCOMPLISH', 'BIRTHPLACE', 'CREATIVITY', 'EXCELLENCE', 'FOUNDATION',
  'GENERATION', 'HELICOPTER', 'ILLUMINATE', 'MOTIVATION', 'UNDERSTAND',
]

export const WORD_LIST: string[] = [
  ...WORDS_4,
  ...WORDS_5,
  ...WORDS_6,
  ...WORDS_7,
  ...WORDS_8,
  ...WORDS_9,
  ...WORDS_10,
]

// ── Helper functions ──────────────────────────────────────────────────────────

export function getRandomWord(): string {
  const idx = Math.floor(Math.random() * WORD_LIST.length)
  return WORD_LIST[idx]
}

export function getWordByLength(minLen: number, maxLen: number): string {
  const filtered = WORD_LIST.filter(
    w => w.length >= minLen && w.length <= maxLen,
  )
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export function getMaxAttempts(wordLength: number): number {
  if (wordLength <= 5) return 6
  if (wordLength <= 7) return 8
  return 10
}

export function getSpeedWords(count: number): string[] {
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function checkGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = new Array(guess.length).fill('incorrect')
  const answerArr = answer.split('')
  const guessArr  = guess.split('')
  const used      = new Array(answer.length).fill(false)

  // First pass: correct positions
  for (let i = 0; i < guess.length; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'correct'
      used[i]   = true
    }
  }

  // Second pass: wrong positions
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue
    for (let j = 0; j < answer.length; j++) {
      if (!used[j] && guessArr[i] === answerArr[j]) {
        result[i] = 'wrong-position'
        used[j]   = true
        break
      }
    }
  }

  return result
}
