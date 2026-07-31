import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

/**
 * Get a Supabase client for server-side operations.
 *
 * The app uses its own signed cookie sessions instead of Supabase Auth
 * sessions. Server database operations must use the service role key,
 * otherwise Supabase sees writes as anonymous and RLS rejects them.
 *
 * Get it from: Supabase Dashboard -> Settings -> API -> service_role key.
 */
export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase environment variables are missing. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    )
  }

  supabaseInstance = createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  console.info('Using Supabase service_role key for server database operations')

  return supabaseInstance
}
