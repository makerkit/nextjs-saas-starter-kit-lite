import Link from 'next/link';

import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signUp'),
  };
};

const paths = {
  callback: pathsConfig.auth.callback,
  appHome: pathsConfig.app.home,
};

function SignUpPage() {
  return (
    <>
      <Heading level={5} className={'tracking-tight'}>
        <Trans i18nKey={'auth:signUpHeading'} />
      </Heading>

      <SignUpMethodsContainer
        providers={authConfig.providers}
        displayTermsCheckbox={authConfig.displayTermsCheckbox}
        paths={paths}
      />

      <div className={'justify-center flex'}>
        <Button asChild variant={'link'} size={'sm'}>
          <Link href={pathsConfig.auth.signIn}>
            <Trans i18nKey={'auth:alreadyHaveAnAccount'} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignUpPage);
