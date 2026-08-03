import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware navigation utilities.
 *
 * Note that this kit has no `[locale]` route segment, so `routing` sets
 * `localePrefix: 'never'` — see `routing.ts`. These helpers therefore behave
 * like their `next/navigation` counterparts and passing `{ locale }` to
 * `router.replace`/`push` does not change the URL. They exist so that a kit
 * which adds a locale segment can switch on them without rewriting call sites.
 */
export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing);
