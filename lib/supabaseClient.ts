// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase instance for the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Only create admin client on the server
export const createAdminClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in the browser');
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for admin operations');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
