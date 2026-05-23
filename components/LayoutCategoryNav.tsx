'use client'

import { usePathname } from 'next/navigation'
import CategoryNav from '@/components/CategoryNav'

export default function LayoutCategoryNav() {
  const pathname = usePathname()
  if (pathname === '/' || /^\/games\/[^/]+$/.test(pathname)) return null
  return (
    <div className="sticky top-14 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <CategoryNav />
    </div>
  )
}
