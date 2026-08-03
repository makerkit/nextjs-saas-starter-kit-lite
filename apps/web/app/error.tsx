'use client';

import Link from 'next/link';

import { ArrowLeft, MessageCircle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { SiteHeader } from '~/(marketing)/_components/site-header';

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  console.error(error);

  return (
    <div className={'flex h-screen flex-1 flex-col'}>
      <SiteHeader />

      <div
        className={
          'container m-auto flex w-full flex-1 flex-col items-center justify-center'
        }
      >
        <div className={'flex flex-col items-center space-y-8'}>
          <div>
            <h1 className={'font-heading text-9xl font-semibold'}>
              <Trans i18nKey={'common.errorPageHeading'} />
            </h1>
          </div>

          <div className={'flex flex-col items-center space-y-8'}>
            <div
              className={
                'flex max-w-xl flex-col items-center space-y-1 text-center'
              }
            >
              <div>
                <Heading level={2}>
                  <Trans i18nKey={'common.genericError'} />
                </Heading>
              </div>

              <p className={'text-muted-foreground text-lg'}>
                <Trans i18nKey={'common.genericErrorSubHeading'} />
              </p>
            </div>

            <div className={'flex space-x-4'}>
              <Button className={'w-full'} variant={'default'} onClick={reset}>
                <ArrowLeft className={'mr-2 h-4'} />

                <Trans i18nKey={'common.goBack'} />
              </Button>

              <Button
                nativeButton={false}
                render={<Link href={'/contact'} />}
                className={'w-full'}
                variant={'outline'}
              >
                <MessageCircle className={'mr-2 h-4'} />

                <Trans i18nKey={'common.contactUs'} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
