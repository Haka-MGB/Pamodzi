import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

/**
 * Get a Supabase client for server-side operations.
 * 
 * IMPORTANT: This uses the service_role key if available (bypasses RLS).
 * For server-side operations, you should set SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 
 * Get it from: Supabase Dashboard → Settings → API → service_role key (secret)
 */
export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  // Try service_role key first (for server-side operations that bypass RLS)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Fall back to anon key (requires proper RLS policies)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const key = serviceRoleKey || anonKey

  if (!url || !key) {
    throw new Error(
      'Supabase environment variables are missing. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY (recommended for server) or NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    )
  }

  supabaseInstance = createClient<Database>(url, key, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  
  if (serviceRoleKey) {
    console.info('✓ Using Supabase service_role key (bypasses RLS)')
  } else {
    console.warn('⚠ Using Supabase anon key - ensure RLS policies are properly configured')
  }
  
  return supabaseInstance
}
