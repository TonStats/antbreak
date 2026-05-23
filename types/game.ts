export interface IframeSettings {
  width: number
  height: number
  allowFullscreen: boolean
  aspectRatio?: string
  paddingTop?: string
}

export interface Game {
  id: string | number
  name: string
  slug: string
  category: string
  subcategory?: string
  description: string
  howToPlay: string[]
  tips: string[]
  thumbnail: string
  gameUrl: string
  playCount: number
  featured: boolean
  isOriginal: boolean
  source?: 'gamedistribution' | 'selfhosted' | 'original' | 'gamemonetize'
  dateAdded: string
  tags: string[]
  iframeSettings: IframeSettings
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  textColor: string
}
