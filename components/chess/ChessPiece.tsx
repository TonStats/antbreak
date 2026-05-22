import Image from 'next/image'

interface ChessPieceProps {
  piece: string  // e.g. 'wK', 'bQ', 'wP'
  size: number   // intrinsic size hint for Next.js optimisation
}

export function ChessPiece({ piece, size }: ChessPieceProps) {
  return (
    <Image
      src={`/chess/pieces/maestro/${piece}.svg`}
      alt={piece}
      width={size}
      height={size}
      className="select-none pointer-events-none"
      style={{ width: '100%', height: '100%' }}
      priority
    />
  )
}
