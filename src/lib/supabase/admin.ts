
// src/lib/supabase/server-admin.ts
import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SERVICE_ROLE_KEY!;
  return createClient(url, service, { db: { schema: 'public' }, auth: { persistSession: false } });
}
