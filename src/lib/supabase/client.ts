import { createClient } from '@supabase/supabase-js'

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 15) + '...')

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)