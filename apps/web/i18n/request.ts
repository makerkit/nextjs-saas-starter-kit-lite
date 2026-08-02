/**
 * App-specific i18n request configuration.
 * Loads translation messages from the app's messages directory.
 *
 * Namespaces live in separate files under `messages/${locale}/`, so adding a
 * namespace means adding a file here and an entry in `namespaces` below.
 */
import { getRequestConfig } from 'next-intl/server';

import { routing } from '@kit/i18n/routing';

// Define the namespaces to load
const namespaces = [
  'common',
  'auth',
  'account',
  'teams',
  'billing',
  'marketing',
] as const;

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * The locale is resolved **statically**, to `routing.defaultLocale`.
 *
 * This deliberately does not read the `lang` cookie or the `accept-language`
 * header. Both are request data, and reading either here makes every route that
 * renders a translation request-bound, which defeats the static shell that Cache
 * Components builds. It is the same mistake the i18next server instance this
 * replaced used to make. next-intl's own `requestLocale` is a lazy getter that
 * calls `headers()` on first read, so it is not touched either.
 *
 * Other kits resolve the locale from a `[locale]` route segment via
 * `next/root-params`, which is request data the router already knows statically.
 * This kit has no locale segment, so there is nothing to read.
 *
 * Out of the box this costs nothing: `locales` ships with a single entry, so the
 * cookie always resolved to the default anyway. If you add locales, either put
 * the locale in the URL so it can be a route param, or accept that non-default
 * translations arrive with the client bundle.
 */
export default getRequestConfig(async () => {
  const locale = routing.defaultLocale;

  // Load all namespace files and merge them
  const messages = await loadMessages(locale);

  return {
    locale,
    messages,
    timeZone: 'UTC',
    onError(error) {
      if (isDevelopment) {
        // Missing translations are expected and should only log an error
        console.warn(`[Dev Only] i18n error: ${error.message}`);
      }
    },
    getMessageFallback(info) {
      return info.key;
    },
  };
});

/**
 * Loads translation messages for all namespaces.
 * Each namespace is loaded from a separate file for better code splitting.
 */
async function loadMessages(locale: string) {
  const loadedMessages: Record<string, unknown> = {};

  // Load each namespace file
  await Promise.all(
    namespaces.map(async (namespace) => {
      try {
        const namespaceMessages = await import(
          `./messages/${locale}/${namespace}.json`
        );

        loadedMessages[namespace] = namespaceMessages.default;
      } catch (error) {
        console.warn(
          `Failed to load namespace "${namespace}" for locale "${locale}":`,
          error,
        );

        // Set empty object as fallback
        loadedMessages[namespace] = {};
      }
    }),
  );

  return loadedMessages;
}
