export type KnowledgeCategory =
  'science' | 'history' | 'sports' |
  'entertainment' | 'finance' | 'health' | 'arts'

export type KnowledgeMode =
  'blitz' | 'arena' | 'suddendeath' | 'daily'

export type KnowledgeDifficulty =
  'easy' | 'medium' | 'hard'

export interface KnowledgeQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  category: KnowledgeCategory
  difficulty: KnowledgeDifficulty
}

export interface CategoryInfo {
  id: KnowledgeCategory
  name: string
  icon: string
  color: string
  textColor: string
  description: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'science',
    name: 'Science & Nature',
    icon: '🔬',
    color: 'bg-emerald-600',
    textColor: 'text-emerald-400',
    description: 'Physics, chemistry, biology and the natural world',
  },
  {
    id: 'history',
    name: 'History & World Events',
    icon: '🏛️',
    color: 'bg-amber-600',
    textColor: 'text-amber-400',
    description: 'Ancient civilisations to modern world events',
  },
  {
    id: 'sports',
    name: 'Sports & Athletes',
    icon: '🏆',
    color: 'bg-sky-600',
    textColor: 'text-sky-400',
    description: 'Records, legends and sporting moments',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Pop Culture',
    icon: '🎬',
    color: 'bg-pink-600',
    textColor: 'text-pink-400',
    description: 'Movies, TV, music and popular culture',
  },
  {
    id: 'finance',
    name: 'Finance & Business',
    icon: '💼',
    color: 'bg-violet-600',
    textColor: 'text-violet-400',
    description: 'Economics, companies and financial concepts',
  },
  {
    id: 'health',
    name: 'Health & Body',
    icon: '🏥',
    color: 'bg-rose-600',
    textColor: 'text-rose-400',
    description: 'Human body, medicine and wellness',
  },
  {
    id: 'arts',
    name: 'Art & Music',
    icon: '🎨',
    color: 'bg-indigo-600',
    textColor: 'text-indigo-400',
    description: 'Visual arts, music history and creative culture',
  },
]
