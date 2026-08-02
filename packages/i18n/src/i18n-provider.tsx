'use client';

import type { InitOptions, i18n } from 'i18next';

import { initializeI18nClient } from './i18n.client';

let i18nInstance: i18n;

type Resolver = (
  lang: string,
  namespace: string,
) => Promise<Record<string, string>>;

export function I18nProvider({
  settings,
  children,
  resolver,
}: React.PropsWithChildren<{
  settings: InitOptions;
  resolver: Resolver;
}>) {
  useI18nClient(settings, resolver);

  return children;
}

/**
 * @name useI18nClient
 * @description A hook that initializes the i18n client.
 * @param settings
 * @param resolver
 */
function useI18nClient(settings: InitOptions, resolver: Resolver) {
  if (!isInstanceReady(settings)) {
    throw loadI18nInstance(settings, resolver);
  }

  return i18nInstance;
}

/**
 * The resolved language is not always `settings.lng`. When the app supports
 * more than one language, the client detects the language from the `lang`
 * cookie, so comparing against `settings.lng` would never match and the
 * provider would re-suspend on every render. Accept any supported language in
 * that case.
 */
function isInstanceReady(settings: InitOptions) {
  if (!i18nInstance) {
    return false;
  }

  if (i18nInstance.options.ns?.length !== settings.ns?.length) {
    return false;
  }

  const supported = settings.supportedLngs || [];

  if (supported.length > 1) {
    return supported.includes(i18nInstance.language);
  }

  return i18nInstance.language === settings.lng;
}

async function loadI18nInstance(settings: InitOptions, resolver: Resolver) {
  i18nInstance = await initializeI18nClient(settings, resolver);
}
