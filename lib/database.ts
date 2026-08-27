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
  const privilegedKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const databaseSecret = process.env.DEALFIGHT_DATABASE_SECRET;
  const apiKey = privilegedKey ?? publishableKey;

  if (!projectUrl || !apiKey || (!privilegedKey && !databaseSecret)) {
    throw new DatabaseUnavailableError();
  }

  if (!client) {
    client = createClient<Database>(projectUrl, apiKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      ...(databaseSecret ? {
        global: {
          headers: { 'x-dealfight-secret': databaseSecret },
        },
      } : {}),
    });
  }

  return client;
}

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof DatabaseUnavailableError;
}
