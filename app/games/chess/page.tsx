import type { Metadata } from 'next'
import ChessGame from './ChessGame'

export const metadata: Metadata = {
  title: 'Chess — Play Free Online Chess vs AI | Antbreak',
  description:
    'Play free online chess against an AI opponent. Choose Easy, Medium or Hard difficulty. No download, no signup required.',
}

export default function ChessPage() {
  return <ChessGame />
}
