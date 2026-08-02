import { cacheLife } from 'next/cache';

import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/config/app.config';

/**
 * The copyright year is an unstable value, and `<Suspense>` does not fix those,
 * only uncached data. It is the same for every visitor and changes once a year,
 * so caching it is the right tool. `await connection()` would also silence the
 * error, but it would make the footer render per request and take every
 * marketing page's static shell down with it.
 */
async function getCopyrightYear() {
  'use cache';

  cacheLife('days');

  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getCopyrightYear();

  return (
    <Footer
      logo={<AppLogo className="w-[85px] md:w-[95px]" />}
      description={<Trans i18nKey="marketing.footerDescription" />}
      copyright={
        <Trans
          i18nKey="marketing.copyright"
          values={{
            product: appConfig.name,
            year,
          }}
        />
      }
      sections={[
        {
          heading: 'Get Started',
          links: [
            {
              href: '/auth/sign-in',
              label: <Trans i18nKey="auth.signIn" />,
            },
            {
              href: '/auth/sign-up',
              label: <Trans i18nKey="auth.signUp" />,
            },
          ],
        },
        {
          heading: <Trans i18nKey="marketing.legal" />,
          links: [
            {
              href: '/terms-of-service',
              label: <Trans i18nKey="marketing.termsOfService" />,
            },
            {
              href: '/privacy-policy',
              label: <Trans i18nKey="marketing.privacyPolicy" />,
            },
            {
              href: '/cookie-policy',
              label: <Trans i18nKey="marketing.cookiePolicy" />,
            },
          ],
        },
      ]}
    />
  );
}
