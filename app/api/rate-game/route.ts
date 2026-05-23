// ── Supabase table setup (run once in the Supabase SQL editor) ──────────────
//
// CREATE TABLE game_ratings (
//   id          BIGSERIAL PRIMARY KEY,
//   slug        TEXT        NOT NULL,
//   game_title  TEXT,
//   rating      INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
//   created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   user_agent  TEXT
// );
// CREATE INDEX game_ratings_slug_idx ON game_ratings (slug);
//
// ────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ average: 0, count: 0 })
  }

  const { data, error } = await supabase
    .from('game_ratings')
    .select('rating')
    .eq('slug', slug)

  if (error || !data || data.length === 0) {
    return NextResponse.json({ average: 0, count: 0 })
  }

  const count   = data.length
  const average = data.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / count

  return NextResponse.json({ average: Math.round(average * 10) / 10, count })
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string
    rating?: number
    gameTitle?: string
  }

  const { slug, rating, gameTitle } = body

  if (!slug || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ ok: true })
  }

  const userAgent = request.headers.get('user-agent') ?? ''

  await supabase.from('game_ratings').insert({
    slug,
    game_title: gameTitle ?? null,
    rating,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
