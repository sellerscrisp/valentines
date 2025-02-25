// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// Client for browser usage (limited by RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client only for server-side usage
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Ensure supabaseAdmin is only used server-side
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
  throw new Error('supabaseAdmin can only be used server-side');
}
