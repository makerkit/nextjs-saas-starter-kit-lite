'use client';

import { useCallback, useMemo, useState } from 'react';

import { useLocale } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shadcn/select';

const LOCALE_COOKIE_NAME = 'lang';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * @name LanguageSelector
 * @description Lets the user pick a locale from the supported ones.
 *
 * This kit has no `[locale]` route segment, so there is no route param to
 * switch. The selection is stored in the `lang` cookie and the page is
 * reloaded.
 *
 * Out of the box that reload changes nothing: `apps/web/i18n/request.ts`
 * resolves the locale statically so that routes can prerender, and the kit ships
 * a single locale, so this component is never rendered — the settings page gates
 * it on there being more than one. If you add locales, decide there how you want
 * the locale resolved, and this selector follows. Reading the cookie in
 * `request.ts` is the smallest change, at the cost of making every route that
 * renders a translation request-bound.
 */
export function LanguageSelector({
  locales = [],
  onChange,
}: {
  locales?: string[];
  onChange?: (locale: string) => unknown;
}) {
  const currentLocale = useLocale();
  const [value, setValue] = useState(currentLocale);

  const languageNames = useMemo(() => {
    return new Intl.DisplayNames([currentLocale], {
      type: 'language',
    });
  }, [currentLocale]);

  const languageChanged = useCallback(
    (locale: string) => {
      setValue(locale);

      if (onChange) {
        onChange(locale);
      }

      document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`;

      // the messages are rendered by the server, so a reload is what applies them
      window.location.reload();
    },
    [onChange],
  );

  if (locales.length <= 1) {
    return null;
  }

  return (
    <Select value={value} onValueChange={languageChanged}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {locales.map((locale) => {
          const label = capitalize(languageNames.of(locale) ?? locale);

          const option = {
            value: locale,
            label,
          };

          return (
            <SelectItem value={option.value} key={option.value}>
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function capitalize(lang: string) {
  return lang.slice(0, 1).toUpperCase() + lang.slice(1);
}
