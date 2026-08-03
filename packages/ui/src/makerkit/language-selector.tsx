'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';

import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@kit/i18n/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shadcn/select';

interface LanguageSelectorProps {
  locales?: string[];
  onChange?: (locale: string) => unknown;
}

const DEFAULT_STRATEGY = 'path';

export function LanguageSelector({
  locales = [],
  onChange,
}: LanguageSelectorProps) {
  const currentLocale = useLocale();
  const handleChangeLocale = useChangeLocale();
  const [value, setValue] = useState(currentLocale);

  const languageNames = useMemo(() => {
    return new Intl.DisplayNames([currentLocale], {
      type: 'language',
    });
  }, [currentLocale]);

  const languageChanged = useCallback(
    (locale: string | null) => {
      if (!locale) return;

      setValue(locale);

      if (onChange) {
        onChange(locale);
      }

      handleChangeLocale(locale);
    },
    [onChange, handleChangeLocale],
  );

  if (locales.length <= 1) {
    return null;
  }

  return (
    <Select value={value} onValueChange={languageChanged}>
      <SelectTrigger>
        <SelectValue className="capitalize">
          {(value) => (value ? languageNames.of(value) : value)}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {locales.map((locale) => {
          const label = languageNames.of(locale) ?? locale;

          return (
            <SelectItem value={locale} key={locale} className="capitalize">
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function useChangeLocale(strategy: `cookie` | `path` = DEFAULT_STRATEGY) {
  const changeLocaleViaPath = useChangeLocaleViaPath();
  const changeLocaleViaCookie = useChangeLocaleViaCookie();

  return useCallback(
    (locale: string) => {
      switch (strategy) {
        case 'cookie':
          return changeLocaleViaCookie(locale);
        case 'path':
          return changeLocaleViaPath(locale);
      }
    },
    [strategy, changeLocaleViaCookie, changeLocaleViaPath],
  );
}

function useChangeLocaleViaCookie() {
  const router = useRouter();

  return useCallback(
    (locale: string) => {
      document.cookie = `lang=${locale}; Path=/; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );
}

function useChangeLocaleViaPath() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return useCallback(
    (locale: string) => {
      startTransition(() => {
        router.replace(pathname, { locale });
      });
    },
    [router, pathname],
  );
}
