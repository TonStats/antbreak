import type { Game } from '@/types/game'

export const GAMES: Game[] = [
  {
    id: 'hex-chain',
    name: 'Hex Chain',
    slug: 'hex-chain',
    category: 'puzzle-logic',
    subcategory: 'matching',
    description:
      'Connect hexagonal tiles to form chains and clear the board before it fills up. ' +
      'Each chain you complete sends a ripple across the grid, setting off satisfying ' +
      'cascades that can clear dozens of tiles at once. With procedurally generated boards ' +
      'and five escalating difficulty levels, no two games play the same way.',
    howToPlay: [
      'Click any hexagon to start a chain, then click adjacent hexagons of the same color to extend it',
      'Complete a chain of 3 or more to clear those tiles and earn points',
      'Longer chains multiply your score — a chain of 6 earns 3× the base points',
      'New tiles drop from the top whenever a chain is cleared',
      'The game ends when the board fills completely and no valid chains remain',
    ],
    tips: [
      'Work from the bottom up — clearing lower tiles gives falling tiles more room to form new chains',
      'Plan two moves ahead to set up cascade combos',
      'A single long chain beats multiple short ones for both score and board space',
      'The color distribution shifts as you level up — keep an eye on which colors are most common',
    ],
    thumbnail: '/thumbnails/hex-chain.jpg',
    gameUrl: '/play/hex-chain',
    playCount: 14832,
    featured: true,
    isOriginal: true,
    dateAdded: '2025-11-01',
    tags: ['matching', 'casual', 'hex', 'colorful', 'strategy'],
    iframeSettings: { width: 800, height: 600, allowFullscreen: true },
  },
  {
    id: 'word-ladder',
    name: 'Word Ladder',
    slug: 'word-ladder',
    category: 'word-language',
    description:
      'Transform one word into another by changing a single letter at a time, with every ' +
      'intermediate step forming a valid English word. Invented by Lewis Carroll in 1877, ' +
      "Word Ladder is deceptively simple and endlessly replayable. Today's puzzle resets " +
      'at midnight and is the same for all players worldwide.',
    howToPlay: [
      'You are given a start word and a target word of the same length',
      'Change exactly one letter per step',
      'Every word you form must appear in the standard dictionary',
      'Reach the target word — the fewer steps you take, the higher your score',
      "Share your result with friends after completing today's ladder",
    ],
    tips: [
      'Look for common vowel swaps — changing a single vowel often unlocks a chain of possibilities',
      "Work backwards from the target word if you're stuck on the last few steps",
      'Three- and four-letter words tend to have more neighbors, making them easier waypoints',
      'The par score is shown after completion — try to beat it tomorrow',
    ],
    thumbnail: '/thumbnails/word-ladder.jpg',
    gameUrl: '/play/word-ladder',
    playCount: 9241,
    featured: true,
    isOriginal: false,
    dateAdded: '2025-10-15',
    tags: ['daily', 'words', 'vocabulary', 'classic', 'puzzle'],
    iframeSettings: { width: 640, height: 720, allowFullscreen: false },
  },
  {
    id: 'speed-sudoku',
    name: 'Speed Sudoku',
    slug: 'speed-sudoku',
    category: 'numbers-math',
    subcategory: 'classic',
    description:
      'Classic Sudoku with a twist — race against the clock across four difficulty levels. ' +
      'Every board is computer-generated with a unique solution, rated for solve-time by ' +
      'a neural network trained on millions of human-played games. Your best times are ' +
      'logged and compared to the global leaderboard.',
    howToPlay: [
      'Fill every cell in the 9×9 grid with a digit from 1 to 9',
      'Each row, column, and 3×3 box must contain every digit exactly once',
      'Select a cell and press a number key, or tap a digit on the on-screen pad',
      'Use the pencil mode to jot candidate digits without committing',
      'Complete the board before the timer hits zero to post your time',
    ],
    tips: [
      'Start with rows, columns, or boxes that already have the most digits filled in',
      'Naked pairs: if two cells in a unit share the same two candidates, eliminate those candidates from all other cells in the unit',
      'X-Wing patterns can eliminate candidates across rows and columns simultaneously',
      'Hard and Expert boards often require chaining — keep a scratch column of forced moves',
    ],
    thumbnail: '/thumbnails/speed-sudoku.jpg',
    gameUrl: '/play/speed-sudoku',
    playCount: 22570,
    featured: true,
    isOriginal: false,
    dateAdded: '2025-09-20',
    tags: ['sudoku', 'numbers', 'logic', 'timed', 'classic'],
    iframeSettings: { width: 600, height: 700, allowFullscreen: false },
  },
  {
    id: 'trivia-rush',
    name: 'Trivia Rush',
    slug: 'trivia-rush',
    category: 'trivia-knowledge',
    description:
      '10 questions, 10 seconds each. Trivia Rush pulls from a pool of over 2,000 hand-written ' +
      'questions spanning science, history, pop culture, geography, and sports. Answer fast ' +
      'for a speed bonus — but a wrong answer resets your streak multiplier. Can you crack ' +
      'the daily top 10?',
    howToPlay: [
      'Each round consists of 10 randomly selected questions from five categories',
      'You have 10 seconds to answer each question — the timer counts down visually',
      'Choose from four multiple-choice options; only one is correct',
      'A speed bonus up to 50 points is added for answers under 3 seconds',
      'Your final score is posted to the daily leaderboard at the end of the round',
    ],
    tips: [
      "Trust your first instinct — research shows your initial guess is right more often than not",
      'Eliminate obviously incorrect answers to improve your odds if you must guess',
      "Questions about dates often contain decade clues — even a rough era narrows the choices",
      "Your streak multiplier maxes out at 5× — protecting it in the back half is key",
    ],
    thumbnail: '/thumbnails/trivia-rush.jpg',
    gameUrl: '/play/trivia-rush',
    playCount: 18904,
    featured: true,
    isOriginal: false,
    dateAdded: '2025-10-01',
    tags: ['trivia', 'quiz', 'knowledge', 'timed', 'multiplayer'],
    iframeSettings: { width: 700, height: 600, allowFullscreen: false },
  },
  {
    id: 'pixel-racer',
    name: 'Pixel Racer',
    slug: 'pixel-racer',
    category: 'sports-racing',
    description:
      'A retro pixel-art top-down racing game inspired by the golden age of arcade cabinets. ' +
      'Weave through oncoming traffic at 200 km/h, collect nitro canisters for explosive ' +
      'speed bursts, and post the fastest three-lap time on the global board. ' +
      'Eight tracks unlock progressively as your lap times improve.',
    howToPlay: [
      'Use the arrow keys or WASD to steer your car',
      'Tap Space or Z to activate a nitro burst when the gauge is charged',
      'Avoid collisions — three crashes end the run and post your partial time',
      'Blue nitro canisters charge your boost; gold coins add to your lap bonus',
      'Complete all 3 laps cleanly to submit your time to the leaderboard',
    ],
    tips: [
      'Hug the inside apex of every corner — a perfect racing line shaves up to 2 seconds per lap',
      'Save your nitro for the long final straight on each track, not the corners',
      'Opponent cars follow fixed patrol lines — memorize them after a few runs to avoid blind collisions',
      'Rain tracks make the car oversteer; lift off the throttle slightly before turning',
    ],
    thumbnail: '/thumbnails/pixel-racer.jpg',
    gameUrl: '/play/pixel-racer',
    playCount: 7318,
    featured: false,
    isOriginal: false,
    dateAdded: '2025-11-10',
    tags: ['racing', 'retro', 'pixel-art', 'arcade', 'top-down'],
    iframeSettings: { width: 800, height: 600, allowFullscreen: true },
  },
]
