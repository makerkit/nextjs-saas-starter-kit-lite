'use client';

import { useEffect } from 'react';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { getSupabaseBrowserClient } from '../clients/browser-client';

/**
 * @name PRIVATE_PATH_PREFIXES
 * @description A list of private path prefixes
 */
const PRIVATE_PATH_PREFIXES = ['/home', '/update-password'];

/**
 * @name AUTH_PATHS
 * @description A list of auth paths
 */
const AUTH_PATHS = ['/auth'];

/**
 * @name useAuthChangeListener
 * @param privatePathPrefixes - A list of private path prefixes
 * @param appHomePath - The path to redirect to when the user is signed out
 * @param onEvent - Callback function to be called when an auth event occurs
 */
export function useAuthChangeListener({
  privatePathPrefixes = PRIVATE_PATH_PREFIXES,
  appHomePath,
  onEvent,
}: {
  appHomePath: string;
  privatePathPrefixes?: string[];
  onEvent?: (event: AuthChangeEvent, user: Session | null) => void;
}) {
  useEffect(() => {
    // The browser client is created here rather than during render. It seeds a
    // storage key with Math.random(), which Cache Components rejects as an
    // unstable value during a prerender, and this hook sits in a provider that
    // wraps every route. It is only ever used inside this effect anyway.
    const client = getSupabaseBrowserClient();

    // keep this running for the whole session unless the component was unmounted
    const listener = client.auth.onAuthStateChange((event, user) => {
      // Read the path when the event fires rather than capturing usePathname()
      // during render. usePathname() is URL data, so reading it here would
      // require a Suspense boundary above this provider, which would mean
      // suspending the whole app. It is also more correct: what matters is
      // where the user is when they sign out, not where they were on mount.
      const pathName = window.location.pathname;

      if (onEvent) {
        onEvent(event, user);
      }

      // log user out if user is falsy
      // and if the current path is a private route
      const shouldRedirectUser =
        !user && isPrivateRoute(pathName, privatePathPrefixes);

      if (shouldRedirectUser) {
        // send user away when signed out
        window.location.assign('/');

        return;
      }

      // revalidate user session when user signs in or out
      if (event === 'SIGNED_OUT') {
        // sometimes Supabase sends SIGNED_OUT event
        // but in the auth path, so we ignore it
        if (AUTH_PATHS.some((path) => pathName.startsWith(path))) {
          return;
        }

        window.location.reload();
      }
    });

    // destroy listener on un-mounts
    return () => listener.data.subscription.unsubscribe();
  }, [appHomePath, privatePathPrefixes, onEvent]);
}

/**
 * Determines if a given path is a private route.
 */
function isPrivateRoute(path: string, privatePathPrefixes: string[]) {
  return privatePathPrefixes.some((prefix) => path.startsWith(prefix));
}
