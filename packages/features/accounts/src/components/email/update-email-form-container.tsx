'use client';

import { useUser } from '@kit/supabase/hooks/use-user';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { UpdateEmailForm } from './update-email-form';

export function UpdateEmailFormContainer(props: { callbackPath: string }) {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  // `email` is optional on the claims type, and the form requires one
  if (!user?.email) {
    return null;
  }

  return (
    <UpdateEmailForm callbackPath={props.callbackPath} userEmail={user.email} />
  );
}
