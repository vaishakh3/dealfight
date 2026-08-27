import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('Supabase storage is not connected. Add the server-only project URL and secret key, then redeploy.');
    this.name = 'DatabaseUnavailableError';
  }
}

let client: SupabaseClient<Database> | null = null;

export function getDatabase() {
  const projectUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!projectUrl || !secretKey) throw new DatabaseUnavailableError();

  if (!client) {
    client = createClient<Database>(projectUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return client;
}

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof DatabaseUnavailableError;
}
