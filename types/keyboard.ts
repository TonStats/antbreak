export interface Shortcut {
  id: string
  action: string
  keys: { windows: string[]; mac: string[] }
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
}

export interface ShortcutCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  shortcuts: Shortcut[]
}
