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
      <Heading level={5} className={'tracking-tight'}>
        <Trans i18nKey={'auth.passwordResetLabel'} />
      </Heading>

      <div className={'flex flex-col space-y-4'}>
        <PasswordResetRequestContainer redirectPath={redirectPath} />

        <div className={'flex justify-center text-xs'}>
          <Button asChild variant={'link'} size={'sm'}>
            <Link href={signIn}>
              <Trans i18nKey={'auth.passwordRecoveredQuestion'} />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export default PasswordResetPage;
