import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { SiteHeader } from '~/(marketing)/_components/site-header';

export const generateMetadata = async () => {
  const t = await getTranslations();
  const title = t('common.notFound');

  return {
    title,
  };
};

const NotFoundPage = () => {
  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <SiteHeader />

      <div
        className={
          'container m-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-12'}>
          <div>
            <h1 className={'font-heading text-8xl font-extrabold xl:text-9xl'}>
              <Trans i18nKey={'common.pageNotFoundHeading'} />
            </h1>
          </div>

          <div className={'flex flex-col items-center space-y-8'}>
            <div className={'flex flex-col items-center space-y-2.5'}>
              <div>
                <Heading level={1}>
                  <Trans i18nKey={'common.pageNotFound'} />
                </Heading>
              </div>

              <p className={'text-muted-foreground'}>
                <Trans i18nKey={'common.pageNotFoundSubHeading'} />
              </p>
            </div>

            <Button
              nativeButton={false}
              render={<Link href={'/'} />}
              variant={'outline'}
            >
              <ArrowLeft className={'mr-2 h-4'} />

              <Trans i18nKey={'common.backToHomePage'} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
