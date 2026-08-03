import { Suspense } from 'react';

import Link from 'next/link';

import type { AuthError } from '@supabase/supabase-js';

import { ResendAuthLinkForm } from '@kit/auth/resend-email-link';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { alertExtras } from '@kit/ui/alert-extras';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { AuthFormSkeleton } from '~/components/skeletons/page-skeletons';
import pathsConfig from '~/config/paths.config';

interface AuthCallbackErrorPageProps {
  searchParams: Promise<{
    error: string;
    callback?: string;
    email?: string;
    code?: AuthError['code'];
  }>;
}

/**
 * Synchronous on purpose, and the promise goes down unawaited.
 *
 * Awaiting searchParams here would not fail the build, and the page would load
 * fine on a direct hit. It only surfaces as an insight on a client-side
 * navigation, which makes this the easiest kind to miss.
 */
function AuthCallbackErrorPage(props: AuthCallbackErrorPageProps) {
  return (
    <div className={'flex flex-col space-y-4 py-4'}>
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <AuthCallbackError searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function AuthCallbackError(props: AuthCallbackErrorPageProps) {
  const { error, callback, code } = await props.searchParams;
  const signInPath = pathsConfig.auth.signIn;
  const redirectPath = callback ?? pathsConfig.auth.callback;

  return (
    <>
      <Alert className={alertExtras.warning}>
        <AlertTitle>
          <Trans i18nKey={'auth.authenticationErrorAlertHeading'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={error ?? 'auth.authenticationErrorAlertBody'} />
        </AlertDescription>
      </Alert>

      <AuthCallbackForm
        code={code}
        signInPath={signInPath}
        redirectPath={redirectPath}
      />
    </>
  );
}

function AuthCallbackForm(props: {
  signInPath: string;
  redirectPath?: string;
  code?: AuthError['code'];
}) {
  switch (props.code) {
    case 'otp_expired':
      return <ResendAuthLinkForm redirectPath={props.redirectPath} />;
    default:
      return <SignInButton signInPath={props.signInPath} />;
  }
}

function SignInButton(props: { signInPath: string }) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={props.signInPath} />}
      className={'w-full'}
    >
      <Trans i18nKey={'auth.signIn'} />
    </Button>
  );
}

export default AuthCallbackErrorPage;
