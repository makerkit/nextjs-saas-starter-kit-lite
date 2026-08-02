'use client';

import type { ReactNode } from 'react';

import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';

const isDevelopment = process.env.NODE_ENV === 'development';

interface I18nClientProviderProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
  timeZone?: string;
}

/**
 * Client-side provider for next-intl.
 * Wraps the application and provides translation context to all client components.
 */
export function I18nClientProvider({
  locale,
  messages,
  timeZone = 'UTC',
  children,
}: I18nClientProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      getMessageFallback={(info) => {
        // simply fallback to the key as is
        return info.key;
      }}
      onError={(error) => {
        if (isDevelopment) {
          // Missing translations are expected and should only log an error
          console.warn(`[Dev Only] i18n error: ${error.message}`);
        }
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
