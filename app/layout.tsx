import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { UserProvider } from '@/context/UserContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Antbreak — Browser Games',
  description: 'Play the best browser-based games on Antbreak. No downloads, no installs.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', sizes: '192x192', url: '/icon-192.png' },
      { rel: 'icon', sizes: '512x512', url: '/icon-512.png' },
    ],
  },
  openGraph: {
    title: 'Antbreak — Play Free Browser Games',
    description: 'Play 5+ free browser games instantly. No download, no login.',
    url: 'https://antbreak.com',
    siteName: 'Antbreak',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://antbreak.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Antbreak — Play Free Browser Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Antbreak — Play Free Browser Games',
    description: 'Play 5+ free browser games instantly. No download, no login.',
    images: ['https://antbreak.com/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="flex min-h-full flex-col bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
