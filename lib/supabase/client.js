import { createBrowserClient } from '@supabase/ssr';
import { trackSupabaseFetch } from './activity';
import { isDemoMode } from '@/supabase/demo/demo-mode';
import { createDemoClient } from '@/supabase/demo/demo-client';

// The app's single Supabase entry point. Everything else — flowClient(),
// utils/supabase/client — resolves back to here, so this one branch covers
// every table in every schema.
//
// While demo mode is on (the landing playground), callers get a fixture-backed
// client instead of a real one. That also means the landing page renders with
// no Supabase env at all, since createBrowserClient is never constructed.
export function createClient() {
  if (isDemoMode()) {
    return createDemoClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: trackSupabaseFetch,
      },
    }
  );
}
