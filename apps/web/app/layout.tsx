import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { RootProviders } from '~/components/root-providers';
import appConfig from '~/config/app.config';
import { heading, sans } from '~/lib/fonts';
import { defaultLanguage } from '~/lib/i18n/i18n.settings';
import { generateRootMetadata } from '~/lib/root-metdata';

import '../styles/globals.css';

/**
 * The root layout is synchronous on purpose. Awaiting anything request-bound
 * here (the theme cookie, the language cookie, the session) makes every route
 * in the app dynamic, because nothing below it can prerender until it resolves.
 *
 * The theme and the language are resolved on the client instead: next-themes
 * runs a script before paint to apply the stored theme, and `I18nProvider`
 * initializes i18next with the user's language on hydration.
 * `suppressHydrationWarning` is required because next-themes writes the theme
 * class onto `<html>` before React hydrates.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={defaultLanguage}
      className={getClassName()}
      suppressHydrationWarning
    >
      <body>
        <RootProviders theme={appConfig.theme} lang={defaultLanguage}>
          {children}

          {/* inside the providers so it can follow next-themes reactively */}
          <Toaster richColors={true} position="top-center" />
        </RootProviders>
      </body>
    </html>
  );
}

function getClassName() {
  const font = [sans.variable, heading.variable].reduce<string[]>(
    (acc, curr) => {
      if (acc.includes(curr)) return acc;

      return [...acc, curr];
    },
    [],
  );

  return cn('bg-background min-h-screen antialiased', ...font);
}

export const generateMetadata = generateRootMetadata;
