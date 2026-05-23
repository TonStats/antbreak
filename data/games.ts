import type { Game } from '@/types/game'

export const GAMES: Game[] = [
  {
    id: 'chess',
    name: 'Chess',
    slug: 'chess',
    category: 'original-games',
    description:
      'Play chess against an AI opponent with three difficulty levels. Easy for beginners, ' +
      'Medium for casual players, Hard for a real challenge. Track your moves, undo mistakes, ' +
      'and save your game automatically.',
    howToPlay: [
      'Select difficulty and choose to play as White or Black',
      'Click a piece to select it and see legal moves highlighted',
      'Click a highlighted square to move your piece',
      'Capture the opponent king to win — checkmate ends the game',
      'Use Undo Move to take back your last move if needed',
    ],
    tips: [
      'Control the center — place pawns and knights on d4, d5, e4, e5',
      'Develop your pieces early — get knights and bishops out before the queen',
      'King safety is critical — castle early to protect your king',
    ],
    thumbnail: '/thumbnails/chess.webp',
    gameUrl: '/games/chess',
    playCount: 0,
    featured: true,
    isOriginal: true,
    dateAdded: '2026-05-22',
    tags: ['chess', 'strategy', 'board', 'ai', 'classic'],
    iframeSettings: { width: 960, height: 600, allowFullscreen: true },
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    slug: 'sudoku',
    category: 'original-games',
    description:
      'Classic Sudoku puzzle game with three difficulty levels and a daily puzzle challenge. ' +
      'Fill the 9×9 grid so every row, column and 3×3 box contains the digits 1 to 9. ' +
      'Use notes mode, hints and undo to solve even the hardest puzzles.',
    howToPlay: [
      'Select a difficulty and choose Classic or Daily Puzzle mode',
      'Click any empty cell then use the number pad or keyboard to enter digits',
      'Every row, column and 3×3 box must contain 1 to 9 with no repeats',
      'Use Notes mode to pencil in candidate numbers',
      'Complete all 81 cells correctly to solve the puzzle',
    ],
    tips: [
      'Start with cells that can only be one number — called naked singles',
      'Use Notes mode to track candidates in difficult cells',
      'Save hints for cells where you are completely stuck',
    ],
    thumbnail: '/thumbnails/sudoku.webp',
    gameUrl: '/games/sudoku',
    playCount: 0,
    featured: true,
    isOriginal: true,
    dateAdded: '2026-05-22',
    tags: ['sudoku', 'puzzle', 'numbers', 'logic', 'daily'],
    iframeSettings: { width: 960, height: 700, allowFullscreen: true },
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed Test',
    slug: 'typing-speed-test',
    category: 'original-games',
    description:
      'Test and improve your typing speed with real-time WPM tracking. Choose from Easy words, ' +
      'Medium sentences, Hard code snippets, or Expert prose. Track your accuracy and challenge your personal best.',
    howToPlay: [
      'Select your difficulty and timer duration',
      'Click the typing area or start typing to begin the timer',
      'Type the displayed text as accurately and quickly as possible',
      'See your WPM, accuracy and time left update in real time',
      'Review your results and grade when the timer ends',
    ],
    tips: [
      'Focus on accuracy first — errors hurt your WPM more than slowness',
      'Keep your eyes on the reference text, not your keyboard',
      'Start with Easy mode to build muscle memory before moving to Medium',
    ],
    thumbnail: '/thumbnails/typing-speed-test.webp',
    gameUrl: '/games/typing-speed-test',
    playCount: 0,
    featured: true,
    isOriginal: true,
    dateAdded: '2026-05-22',
    tags: ['typing', 'wpm', 'speed', 'keyboard', 'skill', 'words'],
    iframeSettings: { width: 960, height: 600, allowFullscreen: false },
  },
]
