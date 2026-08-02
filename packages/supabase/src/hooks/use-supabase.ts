import { useMemo } from 'react';

import { getSupabaseBrowserClient } from '../clients/browser-client';
import { Database } from '../database.types';

let cachedClient: object | undefined;

function resolveClient() {
  cachedClient ??= getSupabaseBrowserClient() as object;

  return cachedClient;
}

/**
 * Builds the client on first property access rather than on creation.
 *
 * `createBrowserClient` seeds a storage key with `Math.random()`, which Cache
 * Components rejects as an unstable value during a prerender. Creating it in
 * render meant every client component holding this hook blocked its route's
 * static shell, and 18 hooks and components call it.
 *
 * Nothing touches a property while rendering: consumers use the client inside
 * mutation functions, query functions and event handlers, all of which run
 * after hydration. So during a prerender the proxy is handed out and no client
 * is ever built, which is correct regardless. A browser client has no reason to
 * exist during a server render.
 */
function createLazyClient<Db>() {
  return new Proxy({} as ReturnType<typeof getSupabaseBrowserClient<Db>>, {
    get(_target, property) {
      const client = resolveClient() as Record<string | symbol, unknown>;
      const value = client[property];

      return typeof value === 'function' ? value.bind(client) : value;
    },
    has(_target, property) {
      return property in resolveClient();
    },
  });
}

/**
 * @name useSupabase
 * @description Use Supabase in a React component
 */
export function useSupabase<Db = Database>() {
  return useMemo(() => createLazyClient<Db>(), []);
}
