import { Suspense } from 'react';

import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { getTranslations } from 'next-intl/server';

import { MultiFactorChallengeContainer } from '@kit/auth/mfa';
import { checkRequiresMultiFactorAuthentication } from '@kit/supabase/check-requires-mfa';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { AuthFormSkeleton } from '~/components/skeletons/page-skeletons';
import pathsConfig from '~/config/paths.config';

interface Props {
  searchParams: Promise<{
    next?: string;
  }>;
}

export const generateMetadata = async () => {
  const t = await getTranslations();

  return {
    title: t('auth.signIn'),
  };
};

/**
 * The redirects stay inside the boundary. redirect() works from a suspended
 * child, so the guard does not have to run before anything can render.
 */
function VerifyPage(props: Props) {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} />}>
      <VerifyChallenge searchParams={props.searchParams} />
    </Suspense>
  );
}

async function VerifyChallenge(props: Props) {
  // per-request: the Supabase server client seeds a value with Math.random(),
  // which <Suspense> does not fix the way it fixes uncached data
  await connection();

  const client = getSupabaseServerClient();

  const { data } = await client.auth.getClaims();

  if (!data?.claims) {
    redirect(pathsConfig.auth.signIn);
  }

  const needsMfa = await checkRequiresMultiFactorAuthentication(client);

  if (!needsMfa) {
    redirect(pathsConfig.auth.signIn);
  }

  const nextPath = (await props.searchParams).next;
  const redirectPath = nextPath ?? pathsConfig.app.home;

  return (
    <MultiFactorChallengeContainer
      userId={data.claims.sub}
      paths={{
        redirectPath,
      }}
    />
  );
}

export default VerifyPage;
