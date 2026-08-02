import { defineRouting } from 'next-intl/routing';

import { defaultLocale } from './default-locale';
import { locales } from './locales';

/**
 * The routing configuration for next-intl.
 *
 * This kit does not prefix routes with the locale and does not detect the
 * locale from the request — `apps/web/i18n/request.ts` resolves it statically so
 * that routes can prerender. `defineRouting` is used for the locale list and the
 * `Locale` type; the navigation helpers it would normally power are not needed
 * without a locale segment.
 */
export const routing = defineRouting({
  // All supported locales
  locales,

  // Default locale
  defaultLocale,

  // No locale prefix: there is no `[locale]` segment in this kit
  localePrefix: 'never',

  // The locale is resolved statically, not from headers or cookies
  localeDetection: false,
});

// Export locale types for TypeScript
export type Locale = (typeof routing.locales)[number];
