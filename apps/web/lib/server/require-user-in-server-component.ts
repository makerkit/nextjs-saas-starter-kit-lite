import 'server-only';

import { cache } from 'react';

import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * @name requireUserInServerComponent
 * @description Require the user to be authenticated in a server component.
 * We reuse this function in multiple server components - it is cached so that the data is only fetched once per request.
 * Use this instead of `requireUser` in server components, so you don't need to hit the database multiple times in a single request.
 */
export const requireUserInServerComponent = cache(async () => {
  /**
   * Marks everything below as per-request. The Supabase server client seeds a
   * value with `Math.random()`, and an unstable value is not fixed by wrapping
   * the caller in `<Suspense>` the way uncached data is. The session is genuinely
   * per-request, so opting into request-time rendering is correct here rather
   * than trying to cache it.
   *
   * It must be awaited. `connection()` stalls a prerender by returning a promise
   * that never resolves, so `void connection()` does nothing at all.
   */
  await connection();

  const client = getSupabaseServerClient();
  const result = await requireUser(client);

  if (result.error) {
    redirect(result.redirectTo);
  }

  return result.data;
});
