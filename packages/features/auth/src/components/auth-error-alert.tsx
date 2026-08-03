import { TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Trans } from '@kit/ui/trans';

/**
 * @name AuthErrorAlert
 * @param error This error comes from Supabase as the code returned on errors
 * This error is mapped from the translation auth:errors.{error}
 * To update the error messages, please update the translation file
 * https://github.com/supabase/gotrue-js/blob/master/src/lib/errors.ts
 * @constructor
 */
export function AuthErrorAlert({
  error,
}: {
  error: Error | null | undefined | string;
}) {
  if (!error) {
    return null;
  }

  const DefaultError = <Trans i18nKey="auth.errors.default" />;
  const errorCode = error instanceof Error ? error.message : error;

  return (
    <Alert variant={'destructive'}>
      <TriangleAlert className={'w-4'} />

      <AlertTitle>
        <Trans i18nKey={`auth.errorAlertHeading`} />
      </AlertTitle>

      <AlertDescription data-test={'auth-error-message'}>
        <Trans
          i18nKey={`auth.errors.${errorCode}`}
          defaults={'<DefaultError />'}
          components={{ DefaultError }}
        />
      </AlertDescription>
    </Alert>
  );
}
