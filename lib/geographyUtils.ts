import { COUNTRIES } from '@/data/geography'
import type { Country, GameMode, Difficulty, QuizQuestion } from '@/types/geography'

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed
  return function () {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Internal shuffle (takes explicit rand fn) ─────────────────────────────────

function shuffle<T>(array: T[], rand: () => number): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Public shuffle ────────────────────────────────────────────────────────────

export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const rand = seed !== undefined ? mulberry32(seed) : Math.random
  return shuffle(array, rand)
}

// ── Option display helper ─────────────────────────────────────────────────────

export function getOptionDisplay(country: Country, mode: GameMode): string {
  return mode === 'capitals' ? country.capital : country.name
}

// ── Wrong-option picker ───────────────────────────────────────────────────────

function pickWrong(correct: Country, pool: Country[], rand: () => number, n = 3): Country[] {
  const sameContinent = shuffle(
    pool.filter(c => c.code !== correct.code && c.continent === correct.continent),
    rand,
  )
  const other = shuffle(
    pool.filter(c => c.code !== correct.code && c.continent !== correct.continent),
    rand,
  )
  return [...sameContinent, ...other].slice(0, n)
}

// ── Build one question ────────────────────────────────────────────────────────

type NonDailyMode = Exclude<GameMode, 'daily'>

function buildQuestion(
  mode: NonDailyMode,
  country: Country,
  pool: Country[],
  rand: () => number,
): QuizQuestion {
  if (mode === 'map') {
    return {
      country,
      correctAnswer: country.code,
      questionText:  `Click on ${country.name}`,
      mode,
    }
  }

  if (mode === 'population') {
    const others  = shuffle(pool.filter(c => c.code !== country.code), rand)
    const opponent = others[0]
    const bigger   = country.population >= opponent.population ? country : opponent
    return {
      country,
      options:       [country, opponent],
      correctAnswer: bigger.name,
      questionText:  'Which country has more people?',
      mode,
    }
  }

  const wrong   = pickWrong(country, pool, rand)
  const options = shuffle([country, ...wrong], rand)

  if (mode === 'flags') {
    return {
      country,
      options,
      correctAnswer: country.name,
      questionText:  'Which country does this flag belong to?',
      mode,
    }
  }

  // capitals
  return {
    country,
    options,
    correctAnswer: country.capital,
    questionText:  `What is the capital of ${country.name}?`,
    mode,
  }
}

// ── Pool by difficulty ────────────────────────────────────────────────────────

function poolFor(difficulty: Difficulty): Country[] {
  if (difficulty === 'hard')   return COUNTRIES
  if (difficulty === 'medium') return COUNTRIES.filter(c => c.difficulty !== 'hard')
  return COUNTRIES.filter(c => c.difficulty === 'easy')
}

// ── generateQuestions ─────────────────────────────────────────────────────────

export function generateQuestions(
  mode: GameMode,
  difficulty: Difficulty,
  count: number,
): QuizQuestion[] {
  const rand           = Math.random
  const pool           = poolFor(difficulty)
  const selected       = shuffle(pool, rand).slice(0, Math.min(count, pool.length))
  const effectiveMode: NonDailyMode = mode === 'daily' ? 'flags' : mode

  return selected.map(country => buildQuestion(effectiveMode, country, pool, rand))
}

// ── getDailyQuestions ─────────────────────────────────────────────────────────

const DAILY_MODE_SEQUENCE: NonDailyMode[] = [
  'flags', 'capitals', 'map', 'population',
  'flags', 'capitals', 'map', 'population',
  'flags', 'capitals',
]

export function getDailyQuestions(): QuizQuestion[] {
  const now  = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rand = mulberry32(seed)

  const selected = shuffle(COUNTRIES, rand).slice(0, 10)
  return selected.map((country, i) =>
    buildQuestion(DAILY_MODE_SEQUENCE[i], country, COUNTRIES, rand),
  )
}
