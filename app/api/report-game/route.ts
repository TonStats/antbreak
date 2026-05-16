import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { slug, description } = (await request.json()) as {
    slug?: string
    description?: string
  }
  console.log('[Antbreak] Game report received:', {
    slug,
    description,
    timestamp: new Date().toISOString(),
  })
  return NextResponse.json({ ok: true })
}
