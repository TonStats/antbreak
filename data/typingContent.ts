export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export const EASY_WORDS: string[] = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'they', 'she', 'been', 'from', 'will', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which',
  'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
  'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
  'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
  'most', 'us', 'great', 'between', 'need', 'large', 'often', 'hand', 'high', 'place',
  'hold', 'turn', 'here', 'why', 'help', 'put', 'different', 'away', 'again', 'off',
  'play', 'small', 'number', 'always', 'move', 'night', 'live', 'point', 'city', 'game',
  'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood',
  'main', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk',
  'example', 'ease', 'paper', 'group', 'music', 'those', 'both', 'mark', 'book', 'letter',
  'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'enough', 'plain', 'girl',
  'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk',
  'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure',
  'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen',
  'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece',
  'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best',
]

export const MEDIUM_SENTENCES: string[] = [
  'The quick brown fox jumps over the lazy dog.',
  'Learning a new skill takes patience and consistent practice.',
  'The morning sun cast long shadows across the empty street.',
  'She opened the window and felt the cool breeze on her face.',
  'Technology has changed the way people communicate with each other.',
  'The library was quiet except for the soft sound of turning pages.',
  'He finished his work early and decided to take a long walk.',
  'Every great journey begins with a single small step forward.',
  'The children played happily in the park until sunset.',
  'Reading books every day is one of the best habits to develop.',
  'The old house at the end of the road had been empty for years.',
  'She smiled and waved as the train pulled slowly out of the station.',
  'The coffee shop on the corner opened early every morning.',
  'Practice makes perfect, but it also requires patience and focus.',
  'The mountain trail was steep but the view from the top was worth it.',
  'He had never seen so many stars in the sky before that night.',
  'The garden was full of colorful flowers blooming in the spring.',
  'A good book can take you to places you have never been before.',
  'The team worked together and finished the project ahead of schedule.',
  'She wrote letters every week to her grandmother who lived far away.',
  'The museum was filled with fascinating artifacts from ancient times.',
  'He learned to play the guitar by practicing for one hour each day.',
  'The waves crashed gently against the shore as the sun went down.',
  "A warm cup of tea on a cold morning is one of life's simple pleasures.",
  'The city lights twinkled like stars as they drove across the bridge.',
]

export const HARD_SNIPPETS: string[] = [
  'const add = (a, b) => a + b;',
  'for (let i = 0; i < 10; i++) { console.log(i); }',
  "function greet(name) { return 'Hello ' + name; }",
  'const arr = [1, 2, 3].map(x => x * 2);',
  "if (score > 100) { grade = 'S'; } else { grade = 'A'; }",
  'div { display: flex; align-items: center; gap: 1rem; }',
  'SELECT * FROM users WHERE active = true LIMIT 10;',
  "import { useState } from 'react';",
  "const obj = { name: 'Alex', age: 25, city: 'NYC' };",
  "document.getElementById('btn').addEventListener('click', fn);",
  'try { fetch(url) } catch (error) { console.error(error); }',
  'background: linear-gradient(135deg, #667eea, #764ba2);',
  'return array.filter(item => item.active).length;',
  "git commit -m 'Fix: resolve merge conflict in main branch'",
  'npm install react react-dom next tailwindcss --save',
]

export const EXPERT_PROSE: string[] = [
  'The Amazon rainforest spans more than five and a half million square kilometres across nine countries in South America, making it the largest tropical rainforest on Earth. Scientists estimate that it contains around ten percent of all species living on our planet, many of which have never been studied or formally named. The forest generates its own rainfall through a process called transpiration, where trees release vast quantities of water vapour that condense into clouds and fall back as rain. This cycle sustains the ecosystem and influences weather patterns across the entire continent. Despite its importance, large sections of the Amazon have been cleared for agriculture and cattle ranching, threatening the delicate balance that took millions of years to develop.',
  'The deep ocean remains one of the least explored environments on Earth. Below a depth of two hundred metres, sunlight cannot penetrate, and the water becomes permanently cold and dark. Yet life thrives here in forms that seem almost alien. Many creatures produce their own light through a process called bioluminescence, using chemical reactions within their bodies to attract prey or communicate with potential mates. The anglerfish uses a glowing lure dangling above its jaws to draw smaller fish close enough to strike. The pressure at the greatest ocean depths is more than a thousand times greater than at the surface, yet bacteria, worms, and even some fish have adapted remarkably to survive in these extreme conditions.',
  'The Sahara is the world\'s largest hot desert, stretching across eleven countries in northern Africa and covering an area roughly comparable to the continental United States. Contrary to the popular image of endless sand dunes, only about a quarter of the Sahara consists of ergs, which are large sandy regions. The remainder is made up of rocky plateaus, gravel plains, and dry valleys carved by rivers that flowed thousands of years ago. Archaeological evidence suggests that parts of the Sahara were green and fertile as recently as six thousand years ago, supporting human settlements, cattle herding, and an abundance of wildlife including hippos and crocodiles near ancient lakes and rivers that have long since dried up.',
  'The human brain contains approximately eighty six billion neurons, each capable of forming thousands of connections with neighbouring cells. These connections, called synapses, transmit electrical and chemical signals that underpin every thought, memory, emotion, and bodily function we experience. Unlike a computer, which processes information in a fixed sequence, the brain operates in parallel across multiple regions simultaneously, allowing it to integrate sensory data, plan future actions, and regulate internal organs all at once. Perhaps most remarkably, the brain is highly adaptable. When one region is damaged through injury or disease, neighbouring areas can sometimes reorganise themselves to take over lost functions. This capacity for change, known as neuroplasticity, continues throughout life and forms the basis of all learning.',
  'Our solar system formed approximately four and a half billion years ago from a vast cloud of gas and dust that began to collapse under its own gravity. As the cloud contracted, most of the material fell toward the centre, heating up until nuclear fusion ignited and the Sun was born. The remaining material flattened into a spinning disc, and within this disc, particles gradually clumped together to form the planets, moons, asteroids, and comets we observe today. The rocky inner planets, including Earth and Mars, formed close to the Sun where temperatures were too high for ice to survive. The outer planets grew much larger because they could accumulate not only rock but also vast quantities of frozen gases and water.',
  'The Great Barrier Reef stretches for over two thousand three hundred kilometres along the northeastern coast of Australia, making it the largest living structure on Earth. It is composed of more than two thousand nine hundred individual reefs and nine hundred islands, built up over thousands of years by tiny coral polyps that secrete calcium carbonate skeletons. These skeletal structures accumulate to form complex architecture that supports extraordinary diversity, including more than fifteen hundred species of fish, four thousand types of mollusc, and numerous species of sea turtle and shark. Rising ocean temperatures have caused repeated mass bleaching events in recent decades, weakening the coral and threatening the long-term survival of this irreplaceable and ancient ecosystem.',
  'Volcanoes are openings in the Earth\'s crust through which molten rock, ash, and gases escape from the mantle below. They form most commonly along the boundaries of tectonic plates, where the movement of these massive sections of the Earth\'s outer layer creates conditions favourable for magma to rise to the surface. The Ring of Fire, a horseshoe-shaped zone encircling the Pacific Ocean, accounts for approximately seventy five percent of all volcanic eruptions on Earth and is also responsible for the majority of the world\'s earthquakes. While eruptions are among the most destructive natural events, they also play a crucial role in building new land, replenishing soil with minerals, and cycling materials through the Earth\'s crust over vast geological timescales.',
  'The Arctic was one of the last regions on Earth to be thoroughly explored by humans, largely due to its extreme cold, months of continuous darkness, and the unpredictable movement of sea ice. Early expeditions in the sixteenth and seventeenth centuries sought a northern sea route to Asia, but most were defeated by the ice-choked waters of what became known as the Northwest Passage. It was not until 1906 that Norwegian explorer Roald Amundsen successfully navigated the entire passage, completing a journey that had claimed the lives of many earlier explorers. Today, warming temperatures are melting Arctic sea ice at an unprecedented rate, opening new shipping routes and raising urgent questions about the future of this fragile and remarkable region.',
]

export function generateText(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': {
      const words: string[] = []
      let length = 0
      while (length < 380) {
        const word = EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)]
        words.push(word)
        length += word.length + 1
      }
      return words.join(' ')
    }
    case 'medium': {
      const shuffled = [...MEDIUM_SENTENCES].sort(() => Math.random() - 0.5)
      let result = ''
      for (const sentence of shuffled) {
        result += (result ? ' ' : '') + sentence
        if (result.length >= 350) break
      }
      return result
    }
    case 'hard': {
      const shuffled = [...HARD_SNIPPETS].sort(() => Math.random() - 0.5)
      let result = ''
      for (const snippet of shuffled) {
        result += (result ? '  ' : '') + snippet
        if (result.length >= 300) break
      }
      return result
    }
    case 'expert': {
      return EXPERT_PROSE[Math.floor(Math.random() * EXPERT_PROSE.length)]
    }
  }
}
