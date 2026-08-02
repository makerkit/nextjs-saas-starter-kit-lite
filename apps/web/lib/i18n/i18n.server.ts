import { cache } from 'react';

import { initializeServerI18n } from '@kit/i18n/server';

import { getI18nSettings } from '~/lib/i18n/i18n.settings';

import { i18nResolver } from './i18n.resolver';

/**
 * @name createI18nServerInstance
 * @description Creates an instance of the i18n server for the default language.
 *
 * This deliberately does NOT read the language cookie or the accept-language
 * header. Both are request data, and reading either here makes every route that
 * renders a `<Trans>` request-bound, which defeats the static shell that Cache
 * Components builds. The server renders the default language, and `I18nProvider`
 * switches the client to the user's language on hydration.
 *
 * `languages` ships with a single entry, so out of the box the server and the
 * client resolve to the same language and nothing re-renders. If you add
 * languages, either put the language in the URL so it can be a route param, or
 * accept that non-default translations arrive with the client bundle.
 */
async function createInstance() {
  const settings = getI18nSettings(undefined);

  return initializeServerI18n(settings, i18nResolver);
}

export const createI18nServerInstance = cache(createInstance);
