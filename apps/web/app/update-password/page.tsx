import { Suspense } from 'react';

import { UpdatePasswordForm } from '@kit/auth/password-reset';
import { AuthLayoutShell } from '@kit/auth/shared';

import { AppLogo } from '~/components/app-logo';
import { AuthFormSkeleton } from '~/components/skeletons/page-skeletons';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('auth:updatePassword'),
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

export default withI18n(UpdatePasswordPage);
