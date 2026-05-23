import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

// Returns null when env vars aren't configured yet — API routes handle this gracefully.
export const supabase = url && key ? createClient(url, key) : null
