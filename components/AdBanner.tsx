interface AdBannerProps {
  size?: 'leaderboard' | 'rectangle' | 'responsive'
  className?: string
}

const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true'

// Google AdSense — replace the inner div with your ad unit code for each size.
// Set NEXT_PUBLIC_ADS_ENABLED=true in .env.local to activate.
export default function AdBanner({ size = 'responsive', className = '' }: AdBannerProps) {
  if (!adsEnabled) return null

  if (size === 'leaderboard') {
    return (
      <div className={`mx-auto w-full max-w-[728px] ${className}`}>
        {/* AdSense Leaderboard 728×90 — insert ad unit here */}
      </div>
    )
  }

  if (size === 'rectangle') {
    return (
      <div className={className}>
        {/* AdSense Rectangle 300×250 — insert ad unit here */}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* AdSense Responsive — insert ad unit here */}
    </div>
  )
}
