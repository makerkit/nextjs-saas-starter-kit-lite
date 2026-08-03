'use client';

import { useUser } from '@kit/supabase/hooks/use-user';
import { Alert } from '@kit/ui/alert';
import { alertExtras } from '@kit/ui/alert-extras';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';

import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  // `email` is optional on the claims type, and the form requires one
  if (!user?.email) {
    return null;
  }

  // `amr` widened to `string[] | AMREntry[]`, so handle both shapes
  const canUpdatePassword = user.amr?.some((item) =>
    typeof item === 'string' ? item === 'password' : item.method === 'password',
  );

  if (!canUpdatePassword) {
    return <WarnCannotUpdatePasswordAlert />;
  }

  return (
    <UpdatePasswordForm
      callbackPath={props.callbackPath}
      userEmail={user.email}
    />
  );
}

function WarnCannotUpdatePasswordAlert() {
  return (
    <Alert className={alertExtras.warning}>
      <Trans i18nKey={'account.cannotUpdatePassword'} />
    </Alert>
  );
}
