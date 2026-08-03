import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

import { PasswordResetRequestContainer } from '@kit/auth/password-reset';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

export const generateMetadata = async () => {
  const t = await getTranslations();

  return {
    title: t('auth.passwordResetLabel'),
  };
};

const { callback, passwordUpdate, signIn } = pathsConfig.auth;
const redirectPath = `${callback}?next=${passwordUpdate}`;

function PasswordResetPage() {
  return (
    <>
      <div className={'flex flex-col items-center gap-1'}>
        <Heading level={2} className={'tracking-tight'}>
          <Trans i18nKey={'auth.passwordResetLabel'} />
        </Heading>

        <p className={'text-muted-foreground text-center text-sm'}>
          <Trans i18nKey={'auth.passwordResetSubheading'} />
        </p>
      </div>

      <div className={'flex flex-col space-y-4'}>
        <PasswordResetRequestContainer redirectPath={redirectPath} />

        <div className={'flex justify-center text-xs'}>
          <Button
            nativeButton={false}
            variant={'link'}
            size={'sm'}
            render={
              <Link href={signIn}>
                <Trans i18nKey={'auth.passwordRecoveredQuestion'} />
              </Link>
            }
          />
        </div>
      </div>
    </>
  );
}

export default PasswordResetPage;
