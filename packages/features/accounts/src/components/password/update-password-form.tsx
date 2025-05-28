'use client';

import { useState } from 'react';

import type { User } from '@supabase/supabase-js';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Trans } from '@kit/ui/trans';

import { PasswordUpdateSchema } from '../../schema/update-password.schema';

export const UpdatePasswordForm = ({
  user,
  callbackPath,
}: {
  user: User;
  callbackPath: string;
}) => {
  const { t } = useTranslation('account');
  const updateUserMutation = useUpdateUser();
  const [needsReauthentication, setNeedsReauthentication] = useState(false);

  const updatePasswordFromCredential = (password: string) => {
    const redirectTo = [window.location.origin, callbackPath].join('');

    const promise = updateUserMutation
      .mutateAsync({ password, redirectTo })
      .catch((error) => {
        if (
          typeof error === 'string' &&
          error?.includes('Password update requires reauthentication')
        ) {
          setNeedsReauthentication(true);
        } else {
          throw error;
        }
      });

    toast.promise(() => promise, {
      success: t(`updatePasswordSuccess`),
      error: t(`updatePasswordError`),
      loading: t(`updatePasswordLoading`),
    });
  };

  const updatePasswordCallback = async ({
    newPassword,
  }: {
    newPassword: string;
  }) => {
    const email = user.email;

    // if the user does not have an email assigned, it's possible they
    // don't have an email/password factor linked, and the UI is out of sync
    if (!email) {
      return Promise.reject(t(`cannotUpdatePassword`));
    }

    updatePasswordFromCredential(newPassword);
  };

  const form = useForm({
    resolver: zodResolver(
      PasswordUpdateSchema.withTranslation(t('passwordNotMatching')),
    ),
    defaultValues: {
      newPassword: '',
      repeatPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        data-test={'account-password-form'}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
      >
        <div className={'flex flex-col space-y-4'}>
          <If condition={updateUserMutation.data}>
            <SuccessAlert />
          </If>

          <If condition={needsReauthentication}>
            <NeedsReauthenticationAlert />
          </If>

          <FormField
            name={'newPassword'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>
                      <Trans i18nKey={'account:newPassword'} />
                    </Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'account-password-form-password-input'}
                      required
                      type={'password'}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name={'repeatPassword'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>
                      <Trans i18nKey={'account:repeatPassword'} />
                    </Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'account-password-form-repeat-password-input'}
                      required
                      type={'password'}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={'account:repeatPasswordDescription'} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div>
            <Button disabled={updateUserMutation.isPending}>
              <Trans i18nKey={'account:updatePasswordSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

function SuccessAlert() {
  return (
    <Alert variant={'success'}>
      <Check className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:updatePasswordSuccess'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account:updatePasswordSuccessMessage'} />
      </AlertDescription>
    </Alert>
  );
}

function NeedsReauthenticationAlert() {
  return (
    <Alert variant={'warning'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:needsReauthentication'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account:needsReauthenticationDescription'} />
      </AlertDescription>
    </Alert>
  );
}
