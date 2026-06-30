import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase environment variables are missing. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    )
  }

  supabaseInstance = createClient<Database>(url, key)
  return supabaseInstance
}