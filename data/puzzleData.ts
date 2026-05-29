import type {
  SequencePuzzle, LogicPuzzle, OddOneOutPuzzle,
  RebusPuzzle, SpatialPuzzle, AnyPuzzle, PuzzleDifficulty, PuzzleType,
} from '../types/puzzle'

// ─── Sequence Puzzles (20: 7 easy, 7 medium, 6 hard) ─────────────────────────

export const SEQUENCE_PUZZLES: SequencePuzzle[] = [
  // Easy
  {
    type: 'sequence', id: 'sq1',
    sequence: [2, 4, 6, 8, '?'], missingIndex: 4,
    answer: '10',
    explanation: 'Each number increases by 2.',
    difficulty: 'easy',
  },
  {
    type: 'sequence', id: 'sq2',
    sequence: [1, 3, 9, 27, '?'], missingIndex: 4,
    answer: '81',
    explanation: 'Each number multiplies by 3.',
    difficulty: 'easy',
  },
  {
    type: 'sequence', id: 'sq3',
    sequence: ['A', 'C', 'E', 'G', '?'], missingIndex: 4,
    answer: 'I',
    explanation: 'Every other letter of the alphabet (skip one each time).',
    difficulty: 'easy',
  },
  {
    type: 'sequence', id: 'sq4',
    sequence: [10, 20, 30, 40, '?'], missingIndex: 4,
    answer: '50',
    explanation: 'Each number increases by 10.',
    difficulty: 'easy',
  },
  {
    type: 'sequence', id: 'sq5',
    sequence: [5, 10, 15, 20, '?'], missingIndex: 4,
    answer: '25',
    explanation: 'Each number increases by 5.',
    difficulty: 'easy',
  },
  {
    type: 'sequence', id: 'sq6',
    sequence: [1, 2, 4, 8, '?'], missingIndex: 4,
    answer: '16',
    explanation: 'Each number doubles (multiplies by 2).',
    difficulty: 'easy',
  },
  {
    type: 'sequence', id: 'sq7',
    sequence: ['Z', 'Y', 'X', 'W', '?'], missingIndex: 4,
    answer: 'V',
    explanation: 'The alphabet in reverse order.',
    difficulty: 'easy',
  },
  // Medium
  {
    type: 'sequence', id: 'sq8',
    sequence: [1, 1, 2, 3, 5, 8, '?'], missingIndex: 6,
    answer: '13',
    explanation: 'Fibonacci sequence: each number is the sum of the previous two.',
    difficulty: 'medium',
  },
  {
    type: 'sequence', id: 'sq9',
    sequence: [2, 6, 12, 20, 30, '?'], missingIndex: 5,
    answer: '42',
    explanation: 'Differences increase by 2 each time: 4, 6, 8, 10, 12.',
    difficulty: 'medium',
  },
  {
    type: 'sequence', id: 'sq10',
    sequence: [3, 6, 11, 18, 27, '?'], missingIndex: 5,
    answer: '38',
    explanation: 'Differences increase by 2 each time: 3, 5, 7, 9, 11.',
    difficulty: 'medium',
  },
  {
    type: 'sequence', id: 'sq11',
    sequence: [1, 2, 4, 7, 11, '?'], missingIndex: 5,
    answer: '16',
    explanation: 'Differences increase by 1 each time: 1, 2, 3, 4, 5.',
    difficulty: 'medium',
  },
  {
    type: 'sequence', id: 'sq12',
    sequence: [100, 91, 83, 76, 70, '?'], missingIndex: 5,
    answer: '65',
    explanation: 'Differences decrease by 1 each time: 9, 8, 7, 6, 5.',
    difficulty: 'medium',
  },
  {
    type: 'sequence', id: 'sq13',
    sequence: ['A', 'B', 'D', 'G', 'K', '?'], missingIndex: 5,
    answer: 'P',
    explanation: 'Gaps between letters increase by 1: +1, +2, +3, +4, +5. K is the 11th letter; P is the 16th.',
    difficulty: 'medium',
  },
  {
    type: 'sequence', id: 'sq14',
    sequence: [2, 3, 5, 7, 11, 13, '?'], missingIndex: 6,
    answer: '17',
    explanation: 'Prime numbers in order.',
    difficulty: 'medium',
  },
  // Hard
  {
    type: 'sequence', id: 'sq15',
    sequence: [1, 4, 9, 16, 25, '?'], missingIndex: 5,
    answer: '36',
    explanation: 'Perfect squares: 1², 2², 3², 4², 5², 6².',
    difficulty: 'hard',
  },
  {
    type: 'sequence', id: 'sq16',
    sequence: [0, 1, 3, 6, 10, 15, '?'], missingIndex: 6,
    answer: '21',
    explanation: 'Triangular numbers: differences increase by 1 each time (1, 2, 3, 4, 5, 6).',
    difficulty: 'hard',
  },
  {
    type: 'sequence', id: 'sq17',
    sequence: [2, 5, 11, 23, 47, '?'], missingIndex: 5,
    answer: '95',
    explanation: 'Each number is the previous number multiplied by 2 and plus 1.',
    difficulty: 'hard',
  },
  {
    type: 'sequence', id: 'sq18',
    sequence: [1, 8, 27, 64, 125, '?'], missingIndex: 5,
    answer: '216',
    explanation: 'Cube numbers: 1³, 2³, 3³, 4³, 5³, 6³.',
    difficulty: 'hard',
  },
  {
    type: 'sequence', id: 'sq19',
    sequence: [3, 7, 15, 31, 63, '?'], missingIndex: 5,
    answer: '127',
    explanation: 'Each term follows the pattern 2ⁿ − 1: 4−1, 8−1, 16−1, 32−1, 64−1, 128−1.',
    difficulty: 'hard',
  },
  {
    type: 'sequence', id: 'sq20',
    sequence: [1, 3, 7, 13, 21, 31, '?'], missingIndex: 6,
    answer: '43',
    explanation: 'Differences increase by 2 each time: 2, 4, 6, 8, 10, 12.',
    difficulty: 'hard',
  },
]

// ─── Logic Puzzles (15: 5 easy, 5 medium, 5 hard) ────────────────────────────

export const LOGIC_PUZZLES: LogicPuzzle[] = [
  // Easy
  {
    type: 'logic', id: 'lg1',
    question: 'Alice, Bob, and Carol each have a different pet: a cat, a dog, and a fish. Alice does not have the cat. Bob has the dog. Who has the fish?',
    clues: ['Alice does not have the cat', 'Bob has the dog'],
    options: ['Alice', 'Bob', 'Carol', 'Unknown'],
    answer: 'Alice',
    explanation: 'Bob has the dog. Alice cannot have the cat, so Alice has the fish. Carol gets the cat.',
    difficulty: 'easy',
  },
  {
    type: 'logic', id: 'lg2',
    question: 'Five houses stand in a row numbered 1 to 5. The red house is #1. The blue house is immediately to the right of the red house. What number is the blue house?',
    clues: ['Red house is #1', 'Blue house is immediately to the right of the red house'],
    options: ['1', '2', '3', '4'],
    answer: '2',
    explanation: 'Red is #1. Immediately to the right means the very next number: #2.',
    difficulty: 'easy',
  },
  {
    type: 'logic', id: 'lg3',
    question: 'If today is Wednesday, what day will it be in 3 days?',
    clues: ['Today is Wednesday', 'Count forward 3 days'],
    options: ['Friday', 'Saturday', 'Sunday', 'Monday'],
    answer: 'Saturday',
    explanation: 'Wednesday + 1 = Thursday, + 2 = Friday, + 3 = Saturday.',
    difficulty: 'easy',
  },
  {
    type: 'logic', id: 'lg4',
    question: 'Tom is taller than Sam. Sam is taller than Jake. Is Tom definitely taller than Jake?',
    clues: ['Tom is taller than Sam', 'Sam is taller than Jake'],
    options: ['Yes', 'No', 'Cannot tell', 'They are the same height'],
    answer: 'Yes',
    explanation: 'If Tom > Sam and Sam > Jake, then by transitivity Tom > Jake.',
    difficulty: 'easy',
  },
  {
    type: 'logic', id: 'lg5',
    question: 'All squares are rectangles. All rectangles are quadrilaterals. Is a square definitely a quadrilateral?',
    clues: ['All squares are rectangles', 'All rectangles are quadrilaterals'],
    options: ['Yes', 'No', 'Sometimes', 'Cannot tell'],
    answer: 'Yes',
    explanation: 'Square → Rectangle → Quadrilateral by transitivity. All squares must be quadrilaterals.',
    difficulty: 'easy',
  },
  // Medium
  {
    type: 'logic', id: 'lg6',
    question: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?',
    clues: ['All Bloops are Razzies', 'All Razzies are Lazzies'],
    options: ['Yes', 'No', 'Sometimes', 'Cannot tell'],
    answer: 'Yes',
    explanation: 'If every A is a B and every B is a C, then every A must be a C. Transitive logic.',
    difficulty: 'medium',
  },
  {
    type: 'logic', id: 'lg7',
    question: 'Four runners finish a race. Anna finishes before Beth. Beth finishes before Carol. Carol finishes before Diana. Who finishes last?',
    clues: ['Anna before Beth', 'Beth before Carol', 'Carol before Diana'],
    options: ['Anna', 'Beth', 'Carol', 'Diana'],
    answer: 'Diana',
    explanation: 'The order is Anna → Beth → Carol → Diana. Diana finishes last.',
    difficulty: 'medium',
  },
  {
    type: 'logic', id: 'lg8',
    question: 'Maria has 3 children. The oldest is 12, which is three times the age of the youngest. The middle child is 2 years older than the youngest. How old is the middle child?',
    clues: ['Oldest = 12', 'Oldest = 3 × youngest', 'Middle = youngest + 2'],
    options: ['4', '5', '6', '7'],
    answer: '6',
    explanation: 'Youngest = 12 ÷ 3 = 4. Middle = 4 + 2 = 6.',
    difficulty: 'medium',
  },
  {
    type: 'logic', id: 'lg9',
    question: 'Five runners finish a race. Alex is 1st, Ben is 2nd, Carlos is 3rd. Dana finishes after Eli. Eli finishes after Carlos. Who finishes 4th?',
    clues: ['Alex 1st, Ben 2nd, Carlos 3rd', 'Eli finishes after Carlos', 'Dana finishes after Eli'],
    options: ['Alex', 'Ben', 'Eli', 'Dana'],
    answer: 'Eli',
    explanation: 'Carlos is 3rd. Eli comes after Carlos, so Eli is 4th. Dana comes after Eli, so Dana is 5th.',
    difficulty: 'medium',
  },
  {
    type: 'logic', id: 'lg10',
    question: 'Three numbers add up to 30. The second number is twice the first. The third number is three times the first. What is the first number?',
    clues: ['n1 + n2 + n3 = 30', 'n2 = 2 × n1', 'n3 = 3 × n1'],
    options: ['3', '4', '5', '6'],
    answer: '5',
    explanation: 'n1 + 2n1 + 3n1 = 6n1 = 30, so n1 = 5.',
    difficulty: 'medium',
  },
  // Hard
  {
    type: 'logic', id: 'lg11',
    question: 'On an island, knights always tell the truth and knaves always lie. Person A says: "At least one of us is a knave." What are A and B?',
    clues: ['Knights always tell the truth', 'Knaves always lie', 'A says "At least one of us is a knave"'],
    options: ['Both knights', 'A knight, B knave', 'A knave, B knight', 'Both knaves'],
    answer: 'A knight, B knave',
    explanation: 'If A were a knave, the statement would be false — meaning neither is a knave, contradicting A being a knave. So A must be a knight telling the truth, meaning at least one is a knave: that must be B.',
    difficulty: 'hard',
  },
  {
    type: 'logic', id: 'lg12',
    question: 'In logic, P is True and Q is False. What is the truth value of the statement "P AND (NOT Q)"?',
    clues: ['P = True', 'Q = False', 'Evaluate: P AND NOT Q'],
    options: ['True', 'False', 'Cannot determine', 'Both'],
    answer: 'True',
    explanation: 'NOT Q = NOT False = True. Then P AND True = True AND True = True.',
    difficulty: 'hard',
  },
  {
    type: 'logic', id: 'lg13',
    question: 'A thief is one of four suspects. The thief is the shortest. Alex is shorter than Beth but taller than Dana. Carol is the tallest. Dana is shorter than Alex. Who is the thief?',
    clues: ['Thief is the shortest', 'Alex shorter than Beth, taller than Dana', 'Carol is tallest', 'Dana shorter than Alex'],
    options: ['Alex', 'Beth', 'Carol', 'Dana'],
    answer: 'Dana',
    explanation: 'Heights in order: Carol > Beth > Alex > Dana. Dana is the shortest, so Dana is the thief.',
    difficulty: 'hard',
  },
  {
    type: 'logic', id: 'lg14',
    question: 'A project has tasks A, B, C, D, E. B must start after A finishes. C must start after B. D can start any time. E must start after both C and D. Tasks take 1 hour each. What is the earliest hour E can finish?',
    clues: ['B starts after A finishes', 'C starts after B finishes', 'D can start at hour 0', 'E starts after both C and D finish'],
    options: ['3', '4', '5', '6'],
    answer: '4',
    explanation: 'A: hour 0→1. B: 1→2. C: 2→3. D: 0→1. E starts at hour 3 (after C), finishes at hour 4.',
    difficulty: 'hard',
  },
  {
    type: 'logic', id: 'lg15',
    question: 'In a group of 100 people, 70 own a phone, 80 own a laptop, and 60 own both. How many own neither?',
    clues: ['100 people total', '70 have phones', '80 have laptops', '60 have both'],
    options: ['0', '5', '10', '15'],
    answer: '10',
    explanation: 'Phone OR laptop = 70 + 80 − 60 = 90 (by inclusion-exclusion). Neither = 100 − 90 = 10.',
    difficulty: 'hard',
  },
]

// ─── Odd One Out Puzzles (20: 7 easy, 7 medium, 6 hard) ──────────────────────

export const ODD_ONE_OUT_PUZZLES: OddOneOutPuzzle[] = [
  // Easy
  {
    type: 'oddoneout', id: 'oo1',
    items: ['Apple', 'Banana', 'Carrot', 'Grape'],
    answer: 'Carrot',
    explanation: 'Carrot is a vegetable. Apple, Banana, and Grape are all fruits.',
    difficulty: 'easy',
  },
  {
    type: 'oddoneout', id: 'oo2',
    items: ['Piano', 'Guitar', 'Violin', 'Trumpet'],
    answer: 'Piano',
    explanation: 'Piano is a keyboard instrument played at a fixed position. Guitar, Violin, and Trumpet are all handheld instruments.',
    difficulty: 'easy',
  },
  {
    type: 'oddoneout', id: 'oo3',
    items: ['Dog', 'Cat', 'Hamster', 'Eagle'],
    answer: 'Eagle',
    explanation: 'Eagle is a bird. Dog, Cat, and Hamster are all mammals.',
    difficulty: 'easy',
  },
  {
    type: 'oddoneout', id: 'oo4',
    items: ['Red', 'Blue', 'Green', 'Yellow'],
    answer: 'Green',
    explanation: 'Red, Blue, and Yellow are the three primary colours. Green is a secondary colour (made by mixing Blue and Yellow).',
    difficulty: 'easy',
  },
  {
    type: 'oddoneout', id: 'oo5',
    items: ['Square', 'Circle', 'Triangle', 'Sphere'],
    answer: 'Sphere',
    explanation: 'Sphere is a 3D shape. Square, Circle, and Triangle are all 2D shapes.',
    difficulty: 'easy',
  },
  {
    type: 'oddoneout', id: 'oo6',
    items: ['January', 'March', 'July', 'September'],
    answer: 'September',
    explanation: 'January, March, and July all have 31 days. September has only 30 days.',
    difficulty: 'easy',
  },
  {
    type: 'oddoneout', id: 'oo7',
    items: ['Venus', 'Earth', 'Mars', 'Moon'],
    answer: 'Moon',
    explanation: 'Venus, Earth, and Mars are planets. The Moon is Earth\'s natural satellite, not a planet.',
    difficulty: 'easy',
  },
  // Medium
  {
    type: 'oddoneout', id: 'oo8',
    items: ['Twitter', 'Instagram', 'WhatsApp', 'YouTube'],
    answer: 'YouTube',
    explanation: 'YouTube is primarily a video hosting platform. Twitter, Instagram, and WhatsApp are primarily social networking or messaging apps.',
    difficulty: 'medium',
  },
  {
    type: 'oddoneout', id: 'oo9',
    items: ['Paris', 'Rome', 'Barcelona', 'Sydney'],
    answer: 'Sydney',
    explanation: 'Paris, Rome, and Barcelona are all European cities. Sydney is in Australia.',
    difficulty: 'medium',
  },
  {
    type: 'oddoneout', id: 'oo10',
    items: ['Nurse', 'Doctor', 'Teacher', 'Surgeon'],
    answer: 'Teacher',
    explanation: 'Nurse, Doctor, and Surgeon are medical healthcare professionals. Teacher works in education.',
    difficulty: 'medium',
  },
  {
    type: 'oddoneout', id: 'oo11',
    items: ['Hammer', 'Nail', 'Screwdriver', 'Wrench'],
    answer: 'Nail',
    explanation: 'Hammer, Screwdriver, and Wrench are tools used to do work. A Nail is a fastener — the thing you work on, not the tool.',
    difficulty: 'medium',
  },
  {
    type: 'oddoneout', id: 'oo12',
    items: ['Whale', 'Dolphin', 'Seal', 'Shark'],
    answer: 'Shark',
    explanation: 'Whales, Dolphins, and Seals are marine mammals (warm-blooded, breathe air). Sharks are fish.',
    difficulty: 'medium',
  },
  {
    type: 'oddoneout', id: 'oo13',
    items: ['Oak', 'Pine', 'Maple', 'Cactus'],
    answer: 'Cactus',
    explanation: 'Oak, Pine, and Maple are trees. Cactus is a succulent plant — not a tree.',
    difficulty: 'medium',
  },
  {
    type: 'oddoneout', id: 'oo14',
    items: ['Football', 'Basketball', 'Tennis', 'Cricket'],
    answer: 'Tennis',
    explanation: 'Football, Basketball, and Cricket are team sports played with large teams. Tennis is typically a 1v1 or 2v2 individual sport.',
    difficulty: 'medium',
  },
  // Hard
  {
    type: 'oddoneout', id: 'oo15',
    items: ['EVIL', 'LIVE', 'VEIL', 'FILE'],
    answer: 'FILE',
    explanation: 'EVIL, LIVE, and VEIL are all anagrams of each other — they all contain the letters E, I, L, V. FILE uses F instead of V, so it does not belong.',
    difficulty: 'hard',
  },
  {
    type: 'oddoneout', id: 'oo16',
    items: ['NOON', 'LEVEL', 'CIVIC', 'STARS'],
    answer: 'STARS',
    explanation: 'NOON, LEVEL, and CIVIC are palindromes — they read the same forwards and backwards. STARS reversed is RATS, which is different.',
    difficulty: 'hard',
  },
  {
    type: 'oddoneout', id: 'oo17',
    items: ['Mercury', 'Venus', 'Earth', 'Pluto'],
    answer: 'Pluto',
    explanation: 'Mercury, Venus, and Earth are official planets in the Solar System. Pluto was reclassified as a dwarf planet in 2006.',
    difficulty: 'hard',
  },
  {
    type: 'oddoneout', id: 'oo18',
    items: ['6', '28', '496', '100'],
    answer: '100',
    explanation: '6, 28, and 496 are perfect numbers — each equals the sum of all its proper divisors. The divisors of 100 sum to 117, not 100.',
    difficulty: 'hard',
  },
  {
    type: 'oddoneout', id: 'oo19',
    items: ['2', '3', '5', '9'],
    answer: '9',
    explanation: '2, 3, and 5 are prime numbers. 9 is not prime — it equals 3 × 3.',
    difficulty: 'hard',
  },
  {
    type: 'oddoneout', id: 'oo20',
    items: ['Java', 'Python', 'Ruby', 'HTML'],
    answer: 'HTML',
    explanation: 'Java, Python, and Ruby are programming languages. HTML is a markup language used to structure documents, not to write logic.',
    difficulty: 'hard',
  },
]

// ─── Rebus Puzzles (15: 5 easy, 5 medium, 5 hard) ────────────────────────────

export const REBUS_PUZZLES: RebusPuzzle[] = [
  // Easy
  {
    type: 'rebus', id: 'rb1',
    parts: [
      { content: '👁️', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🍎', type: 'emoji' },
    ],
    options: ['Eye Apple', 'I Apple', 'iPad', 'iMac'],
    answer: 'iPad',
    explanation: '👁️ = "I", 🍎 = Apple (the brand) → iPad',
    difficulty: 'easy',
  },
  {
    type: 'rebus', id: 'rb2',
    parts: [
      { content: '👁️', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '❤️', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🐑', type: 'emoji' },
    ],
    options: ['I love sheep', 'I love you', 'Eye heart ewe', 'I heart sheep'],
    answer: 'I love you',
    explanation: '👁️ = "I", ❤️ = "love", 🐑 = "ewe" (sounds like "you") → I love you',
    difficulty: 'easy',
  },
  {
    type: 'rebus', id: 'rb3',
    parts: [
      { content: '🐝', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🍃', type: 'emoji' },
    ],
    options: ['Bee Leaf', 'Belief', 'Be Leaf', 'Believe'],
    answer: 'Belief',
    explanation: '🐝 = "Bee", 🍃 = "leaf" → Belief',
    difficulty: 'easy',
  },
  {
    type: 'rebus', id: 'rb4',
    parts: [
      { content: '☀️', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🌸', type: 'emoji' },
    ],
    options: ['Sunshine', 'Sunflower', 'Flower Power', 'Daisy'],
    answer: 'Sunflower',
    explanation: '☀️ = "Sun", 🌸 = "flower" → Sunflower',
    difficulty: 'easy',
  },
  {
    type: 'rebus', id: 'rb5',
    parts: [
      { content: '🔑', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🪨', type: 'emoji' },
    ],
    options: ['Keystone', 'Rockstar', 'Key Rock', 'Pebble Key'],
    answer: 'Keystone',
    explanation: '🔑 = "Key", 🪨 = "stone" → Keystone',
    difficulty: 'easy',
  },
  // Medium
  {
    type: 'rebus', id: 'rb6',
    parts: [
      { content: '🌙', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '💡', type: 'emoji' },
    ],
    options: ['Moonlight', 'Night light', 'Enlighten', 'Moonshine'],
    answer: 'Moonlight',
    explanation: '🌙 = "Moon", 💡 = "light" → Moonlight',
    difficulty: 'medium',
  },
  {
    type: 'rebus', id: 'rb7',
    parts: [
      { content: '🌲', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🏠', type: 'emoji' },
    ],
    options: ['Greenhouse', 'Treehouse', 'Woodhouse', 'Forest Home'],
    answer: 'Treehouse',
    explanation: '🌲 = "Tree", 🏠 = "house" → Treehouse',
    difficulty: 'medium',
  },
  {
    type: 'rebus', id: 'rb8',
    parts: [
      { content: '📚', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🐛', type: 'emoji' },
    ],
    options: ['Library Bug', 'Bookworm', 'Caterpillar Books', 'Wormhole'],
    answer: 'Bookworm',
    explanation: '📚 = "Book", 🐛 = "worm" → Bookworm (a dedicated reader)',
    difficulty: 'medium',
  },
  {
    type: 'rebus', id: 'rb9',
    parts: [
      { content: '🧠', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🌪️', type: 'emoji' },
    ],
    options: ['Brainstorm', 'Mind Twister', 'Hurricane Brain', 'Mindblown'],
    answer: 'Brainstorm',
    explanation: '🧠 = "Brain", 🌪️ = "storm" → Brainstorm',
    difficulty: 'medium',
  },
  {
    type: 'rebus', id: 'rb10',
    parts: [
      { content: '🌧️', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🏹', type: 'emoji' },
    ],
    options: ['Rainbow', 'Storm Arrow', 'Rain Bow', 'Archer Rain'],
    answer: 'Rainbow',
    explanation: '🌧️ = "Rain", 🏹 = "bow" → Rainbow',
    difficulty: 'medium',
  },
  // Hard
  {
    type: 'rebus', id: 'rb11',
    parts: [
      { content: '🔥', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🦊', type: 'emoji' },
    ],
    options: ['Wildfire', 'Firefox', 'Red Fox', 'Firestarter'],
    answer: 'Firefox',
    explanation: '🔥 = "Fire", 🦊 = "fox" → Firefox (the web browser)',
    difficulty: 'hard',
  },
  {
    type: 'rebus', id: 'rb12',
    parts: [
      { content: '🏄', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🕸️', type: 'emoji' },
    ],
    options: ['World Wide Web', 'Surfing the web', 'Spider-Man', 'Ocean Network'],
    answer: 'Surfing the web',
    explanation: '🏄 = "Surfing", 🕸️ = "the web" → Surfing the web (browsing the internet)',
    difficulty: 'hard',
  },
  {
    type: 'rebus', id: 'rb13',
    parts: [
      { content: '🧈', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🪰', type: 'emoji' },
    ],
    options: ['Butterfingers', 'Buttered fly', 'Butterfly', 'Greased Lightning'],
    answer: 'Butterfly',
    explanation: '🧈 = "Butter", 🪰 = "fly" → Butterfly',
    difficulty: 'hard',
  },
  {
    type: 'rebus', id: 'rb14',
    parts: [
      { content: '👦', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '⚡', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '🧙', type: 'emoji' },
    ],
    options: ['Lightning Wizard', 'Harry Potter', 'Storm Boy', 'Thunder Magic'],
    answer: 'Harry Potter',
    explanation: '👦 = a boy (Harry), ⚡ = lightning bolt scar, 🧙 = wizard (Potter) → Harry Potter',
    difficulty: 'hard',
  },
  {
    type: 'rebus', id: 'rb15',
    parts: [
      { content: '🌍', type: 'emoji' },
      { content: '+', type: 'symbol' },
      { content: '📖', type: 'emoji' },
    ],
    options: ['World Book', 'Google', 'Encyclopedia', 'Atlas'],
    answer: 'Atlas',
    explanation: '🌍 = world/globe, 📖 = book of maps → Atlas (a book of maps of the world)',
    difficulty: 'hard',
  },
]

// ─── Spatial Puzzles (15: 5 easy, 5 medium, 5 hard) ──────────────────────────

export const SPATIAL_PUZZLES: SpatialPuzzle[] = [
  // Easy
  {
    type: 'spatial', id: 'sp1',
    question: 'A clock shows 3:00. The hour hand points to the RIGHT. You rotate the entire clock 90° clockwise. Which direction does the hour hand now point?',
    shapeDescription: 'clock face rotated 90° clockwise',
    options: ['Up', 'Down', 'Left', 'Right'],
    answer: 'Down',
    explanation: 'At 3:00 the hand points right. Rotating 90° clockwise turns right → down.',
    difficulty: 'easy',
  },
  {
    type: 'spatial', id: 'sp2',
    question: 'What letter do you see when you hold the letter "b" up to a mirror (flip it horizontally, left to right)?',
    shapeDescription: 'letter b mirrored horizontally',
    options: ['d', 'p', 'q', 'b'],
    answer: 'd',
    explanation: 'A horizontal mirror flip of "b" swaps its left and right sides, producing "d".',
    difficulty: 'easy',
  },
  {
    type: 'spatial', id: 'sp3',
    question: 'On a standard die, opposite faces always add up to 7. You can see the faces showing 1, 2, and 3. What is the sum of the three hidden faces?',
    shapeDescription: 'die showing three faces',
    options: ['12', '14', '15', '18'],
    answer: '15',
    explanation: 'Each pair of opposite faces sums to 7. Hidden faces = (7−1) + (7−2) + (7−3) = 6 + 5 + 4 = 15.',
    difficulty: 'easy',
  },
  {
    type: 'spatial', id: 'sp4',
    question: 'A square piece of paper is folded in half (top to bottom), then folded in half again (left to right). How many layers of paper are there?',
    shapeDescription: 'square paper folded twice',
    options: ['2', '3', '4', '8'],
    answer: '4',
    explanation: 'Each fold doubles the layers: 1 → 2 (first fold) → 4 (second fold).',
    difficulty: 'easy',
  },
  {
    type: 'spatial', id: 'sp5',
    question: 'A 2×2×2 cube is assembled from 8 smaller unit cubes, then the outside is painted red. How many of the small cubes have NO paint on any face?',
    shapeDescription: '2×2×2 painted cube',
    options: ['0', '1', '2', '4'],
    answer: '0',
    explanation: 'In a 2×2×2 cube every small cube sits on the surface. There is no interior cube hidden from the outside, so all 8 cubes get paint.',
    difficulty: 'easy',
  },
  // Medium
  {
    type: 'spatial', id: 'sp6',
    question: 'How many squares of ALL sizes are there in a 3×3 grid?',
    shapeDescription: '3×3 grid of squares',
    options: ['9', '12', '14', '16'],
    answer: '14',
    explanation: '9 small (1×1) squares + 4 medium (2×2) squares + 1 large (3×3) square = 14 total.',
    difficulty: 'medium',
  },
  {
    type: 'spatial', id: 'sp7',
    question: 'A triangle is pointing UP. You rotate it exactly 180°. Which direction does it point now?',
    shapeDescription: 'triangle rotated 180°',
    options: ['Up', 'Down', 'Left', 'Right'],
    answer: 'Down',
    explanation: 'A 180° rotation flips the triangle upside-down — it now points down.',
    difficulty: 'medium',
  },
  {
    type: 'spatial', id: 'sp8',
    question: 'A rectangular piece of paper is folded exactly in half. A hole is punched through both layers in the middle of the folded sheet. When the paper is unfolded, how many holes are there?',
    shapeDescription: 'folded paper with hole punched through both layers',
    options: ['1', '2', '3', '4'],
    answer: '2',
    explanation: 'Punching through two folded layers creates one hole per layer. Unfolded, there are 2 holes.',
    difficulty: 'medium',
  },
  {
    type: 'spatial', id: 'sp9',
    question: 'A rectangle is divided into 4 equal smaller rectangles by one horizontal line and one vertical line. How many rectangles of ALL sizes are there in total?',
    shapeDescription: '2×2 rectangle grid',
    options: ['4', '7', '9', '12'],
    answer: '9',
    explanation: '4 small (1×1) + 2 wide horizontal (2×1) + 2 tall vertical (1×2) + 1 full (2×2) = 9 rectangles.',
    difficulty: 'medium',
  },
  {
    type: 'spatial', id: 'sp10',
    question: 'You are facing North. You turn right 90°, then turn left 180°, then turn right 90°. Which direction are you now facing?',
    shapeDescription: 'compass direction turns',
    options: ['North', 'South', 'East', 'West'],
    answer: 'North',
    explanation: 'North → right 90° → East → left 180° → West → right 90° → North.',
    difficulty: 'medium',
  },
  // Hard
  {
    type: 'spatial', id: 'sp11',
    question: 'How many squares of ALL sizes are there in a 4×4 grid?',
    shapeDescription: '4×4 grid of squares',
    options: ['16', '25', '30', '40'],
    answer: '30',
    explanation: '1×1: 16 squares + 2×2: 9 squares + 3×3: 4 squares + 4×4: 1 square = 30 total.',
    difficulty: 'hard',
  },
  {
    type: 'spatial', id: 'sp12',
    question: 'A 3×3×3 cube (27 smaller cubes) has all its outer faces painted. How many of the small cubes have paint on exactly 2 faces?',
    shapeDescription: '3×3×3 painted cube cut apart',
    options: ['8', '12', '16', '24'],
    answer: '12',
    explanation: 'Cubes along edges (but not corners) have exactly 2 painted faces. A 3×3×3 cube has 12 edges, each with 1 non-corner cube = 12 cubes.',
    difficulty: 'hard',
  },
  {
    type: 'spatial', id: 'sp13',
    question: 'An "L" shape is made of 3 squares: one on top, one below it, and one to the right of the bottom square. How many visually distinct orientations exist when you rotate this L-shape?',
    shapeDescription: 'L-shaped tromino rotated',
    options: ['2', '3', '4', '8'],
    answer: '4',
    explanation: 'The L-shape is asymmetric, so each 90° rotation produces a different-looking shape: 0°, 90°, 180°, and 270° are all distinct = 4 orientations.',
    difficulty: 'hard',
  },
  {
    type: 'spatial', id: 'sp14',
    question: 'A square piece of paper is folded in half 3 times (always folding the left side over the right). One hole is then punched through all layers. When fully unfolded, how many holes are there?',
    shapeDescription: 'paper folded 3 times, hole punched',
    options: ['4', '6', '8', '16'],
    answer: '8',
    explanation: 'Each fold doubles the number of holes produced. 1 hole × 2 × 2 × 2 = 8 holes when fully unfolded.',
    difficulty: 'hard',
  },
  {
    type: 'spatial', id: 'sp15',
    question: 'Starting at position (0, 0), you move 3 units along the X-axis and 4 units along the Y-axis. What is the straight-line distance back to your starting point?',
    shapeDescription: 'coordinate grid movement',
    options: ['5', '6', '7', '8'],
    answer: '5',
    explanation: 'Distance = √(3² + 4²) = √(9 + 16) = √25 = 5. This is the classic 3-4-5 right triangle.',
    difficulty: 'hard',
  },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getPuzzles(count: number, difficulty: PuzzleDifficulty): AnyPuzzle[] {
  const all: AnyPuzzle[] = [
    ...SEQUENCE_PUZZLES,
    ...LOGIC_PUZZLES,
    ...ODD_ONE_OUT_PUZZLES,
    ...REBUS_PUZZLES,
    ...SPATIAL_PUZZLES,
  ]
  const byDiff = all.filter(p => p.difficulty === difficulty)
  const shuffled = [...byDiff].sort(() => Math.random() - 0.5)

  const types: PuzzleType[] = ['sequence', 'logic', 'oddoneout', 'rebus', 'spatial']
  const byType: Partial<Record<PuzzleType, AnyPuzzle[]>> = {}
  for (const t of types) {
    byType[t] = shuffled.filter(p => p.type === t)
  }

  const result: AnyPuzzle[] = []
  let round = 0
  while (result.length < count) {
    let addedThisRound = false
    for (const t of types) {
      if (result.length >= count) break
      const pool = byType[t]!
      if (round < pool.length) {
        result.push(pool[round])
        addedThisRound = true
      }
    }
    round++
    if (!addedThisRound) break
  }
  return result
}

export function getDailyPuzzles(): AnyPuzzle[] {
  const day = new Date().getDate() - 1
  const all: AnyPuzzle[] = [
    ...SEQUENCE_PUZZLES,
    ...LOGIC_PUZZLES,
    ...ODD_ONE_OUT_PUZZLES,
    ...REBUS_PUZZLES,
    ...SPATIAL_PUZZLES,
  ]
  const seed = day * 7
  const result: AnyPuzzle[] = []
  const types: PuzzleType[] = ['sequence', 'logic', 'oddoneout', 'rebus', 'spatial']
  for (let i = 0; i < types.length; i++) {
    const pool = all.filter(p => p.type === types[i])
    result.push(pool[(seed + i * 3) % pool.length])
  }
  return result
}
