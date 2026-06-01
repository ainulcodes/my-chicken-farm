import { createClient } from '@supabase/supabase-js';

// Kredensial diambil dari env (lihat .env.local).
// Gunakan ANON key di frontend (BUKAN service_role). Keamanan ditegakkan oleh RLS.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '❌ REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY belum diset di .env.local'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
