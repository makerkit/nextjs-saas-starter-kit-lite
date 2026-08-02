import { Suspense } from 'react';

import { getTranslations } from 'next-intl/server';

import { UpdatePasswordForm } from '@kit/auth/password-reset';
import { AuthLayoutShell } from '@kit/auth/shared';

import { AppLogo } from '~/components/app-logo';
import { AuthFormSkeleton } from '~/components/skeletons/page-skeletons';
import pathsConfig from '~/config/paths.config';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const t = await getTranslations();

  return {
    title: t('auth.updatePassword'),
  };
};

const Logo = () => <AppLogo href={''} />;

interface UpdatePasswordPageProps {
  searchParams: Promise<{
    callback?: string;
  }>;
}

/**
 * The shell renders immediately. The session check and the searchParams read
 * both happen inside the boundary.
 */
function UpdatePasswordPage(props: UpdatePasswordPageProps) {
  return (
    <AuthLayoutShell Logo={Logo}>
      <Suspense fallback={<AuthFormSkeleton />}>
        <UpdatePassword searchParams={props.searchParams} />
      </Suspense>
    </AuthLayoutShell>
  );
}

async function UpdatePassword(props: UpdatePasswordPageProps) {
  await requireUserInServerComponent();

  const { callback } = await props.searchParams;
  const redirectTo = callback ?? pathsConfig.app.home;

  return <UpdatePasswordForm redirectTo={redirectTo} />;
}

export default UpdatePasswordPage;
