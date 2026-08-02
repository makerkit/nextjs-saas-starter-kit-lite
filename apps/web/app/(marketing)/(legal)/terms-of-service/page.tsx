import { getTranslations } from 'next-intl/server';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('marketing.termsOfService'),
  };
}

async function TermsOfServicePage() {
  const t = await getTranslations();

  return (
    <div>
      <SitePageHeader
        title={t(`marketing.termsOfService`)}
        subtitle={t(`marketing.termsOfServiceDescription`)}
      />

      <div className={'container mx-auto py-8'}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;
