'use client';

import { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, TriangleAlert } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useFactorsMutationKey } from '@kit/supabase/hooks/use-user-factors-mutation-key';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@kit/ui/input-otp';
import { Trans } from '@kit/ui/trans';

import { refreshAuthSession } from '../../server/server-actions';

export function MultiFactorAuthSetupDialog(props: { userId: string }) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const onEnrollSuccess = useCallback(() => {
    setIsOpen(false);

    return toast.success(t(`account.multiFactorSetupSuccess`));
  }, [t]);

  return (
    <Dialog
      open={isOpen}
      /**
       * Enrollment is multi-step and the factor is only usable once verified, so
       * a stray click outside or an Escape press must not discard it. Base UI
       * replaces Radix's `onInteractOutside`/`onEscapeKeyDown` with a `reason` on
       * `onOpenChange`: ignoring the close leaves the controlled `open` as is.
       */
      onOpenChange={(open, eventDetails) => {
        const isAccidental =
          eventDetails.reason === 'outside-press' ||
          eventDetails.reason === 'escape-key';

        if (!open && isAccidental) {
          return;
        }

        setIsOpen(open);
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Trans i18nKey={'account.setupMfaButtonLabel'} />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'account.setupMfaButtonLabel'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'account.multiFactorAuthDescription'} />
          </DialogDescription>
        </DialogHeader>

        <div>
          <MultiFactorAuthSetupForm
            userId={props.userId}
            onCancel={() => setIsOpen(false)}
            onEnrolled={onEnrollSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MultiFactorAuthSetupForm({
  onEnrolled,
  onCancel,
  userId,
}: React.PropsWithChildren<{
  userId: string;
  onCancel: () => void;
  onEnrolled: () => void;
}>) {
  const verifyCodeMutation = useVerifyCodeMutation(userId);

  const verificationCodeForm = useForm({
    resolver: zodResolver(
      z.object({
        factorId: z.string().min(1),
        verificationCode: z.string().min(6).max(6),
      }),
    ),
    defaultValues: {
      factorId: '',
      verificationCode: '',
    },
  });

  const [state, setState] = useState({
    loading: false,
    error: '',
  });

  const factorId = useWatch({
    name: 'factorId',
    control: verificationCodeForm.control,
  });

  const onSubmit = useCallback(
    async ({
      verificationCode,
      factorId,
    }: {
      verificationCode: string;
      factorId: string;
    }) => {
      setState({
        loading: true,
        error: '',
      });

      try {
        await verifyCodeMutation.mutateAsync({
          factorId,
          code: verificationCode,
        });

        await refreshAuthSession();

        setState({
          loading: false,
          error: '',
        });

        onEnrolled();
      } catch (error) {
        const message = (error as Error).message || `Unknown error`;

        setState({
          loading: false,
          error: message,
        });
      }
    },
    [onEnrolled, verifyCodeMutation],
  );

  if (state.error) {
    return <ErrorAlert />;
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex justify-center'}>
        <FactorQrCode
          userId={userId}
          onCancel={onCancel}
          onSetFactorId={(factorId) =>
            verificationCodeForm.setValue('factorId', factorId)
          }
        />
      </div>

      <If condition={factorId}>
        <Form {...verificationCodeForm}>
          <form
            onSubmit={verificationCodeForm.handleSubmit(onSubmit)}
            className={'w-full'}
          >
            <div className={'flex flex-col space-y-8'}>
              <FormField
                render={({ field }) => {
                  return (
                    <FormItem
                      className={
                        'mx-auto flex flex-col items-center justify-center'
                      }
                    >
                      <FormControl>
                        <InputOTP {...field} maxLength={6} minLength={6}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>

                      <FormDescription>
                        <Trans
                          i18nKey={'account.verifyActivationCodeDescription'}
                        />
                      </FormDescription>

                      <FormMessage />
                    </FormItem>
                  );
                }}
                name={'verificationCode'}
              />

              <div className={'flex justify-end space-x-2'}>
                <Button type={'button'} variant={'ghost'} onClick={onCancel}>
                  <Trans i18nKey={'common.cancel'} />
                </Button>

                <Button
                  disabled={
                    !verificationCodeForm.formState.isValid || state.loading
                  }
                  type={'submit'}
                >
                  {state.loading ? (
                    <Trans i18nKey={'account.verifyingCode'} />
                  ) : (
                    <Trans i18nKey={'account.enableMfaFactor'} />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </If>
    </div>
  );
}

function FactorQrCode({
  onSetFactorId,
  onCancel,
  userId,
}: React.PropsWithChildren<{
  userId: string;
  onCancel: () => void;
  onSetFactorId: (factorId: string) => void;
}>) {
  const enrollFactorMutation = useEnrollFactor(userId);
  const t = useTranslations();
  const [error, setError] = useState<string>('');

  const form = useForm({
    resolver: zodResolver(
      z.object({
        factorName: z.string().min(1),
        qrCode: z.string().min(1),
      }),
    ),
    defaultValues: {
      factorName: '',
      qrCode: '',
    },
  });

  const factorName = useWatch({ name: 'factorName', control: form.control });

  if (error) {
    return (
      <div className={'flex w-full flex-col space-y-2'}>
        <Alert variant={'destructive'}>
          <TriangleAlert className={'h-4'} />

          <AlertTitle>
            <Trans i18nKey={'account.qrCodeErrorHeading'} />
          </AlertTitle>

          <AlertDescription>
            <Trans
              i18nKey={`auth.errors.${error}`}
              defaults={t('account.qrCodeErrorDescription')}
            />
          </AlertDescription>
        </Alert>

        <div>
          <Button variant={'outline'} onClick={onCancel}>
            <ArrowLeftIcon className={'h-4'} />
            <Trans i18nKey={`common.retry`} />
          </Button>
        </div>
      </div>
    );
  }

  if (!factorName) {
    return (
      <FactorNameForm
        onCancel={onCancel}
        onSetFactorName={async (name) => {
          const response = await enrollFactorMutation.mutateAsync(name);

          if (!response.success) {
            return setError(response.data as string);
          }

          const data = response.data;

          if (data.type === 'totp') {
            form.setValue('factorName', name);
            form.setValue('qrCode', data.totp.qr_code);
          }

          // dispatch event to set factor ID
          onSetFactorId(data.id);
        }}
      />
    );
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <p>
        <span className={'text-muted-foreground text-sm'}>
          <Trans i18nKey={'account.multiFactorModalHeading'} />
        </span>
      </p>

      <div className={'flex justify-center'}>
        <QrImage src={form.getValues('qrCode')} />
      </div>
    </div>
  );
}

function FactorNameForm(
  props: React.PropsWithChildren<{
    onSetFactorName: (name: string) => void;
    onCancel: () => void;
  }>,
) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1),
      }),
    ),
    defaultValues: {
      name: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'w-full'}
        onSubmit={form.handleSubmit((data) => {
          props.onSetFactorName(data.name);
        })}
      >
        <div className={'flex flex-col space-y-4'}>
          <FormField
            name={'name'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey={'account.factorNameLabel'} />
                  </FormLabel>

                  <FormControl>
                    <Input autoComplete={'off'} required {...field} />
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={'account.factorNameHint'} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className={'flex justify-end space-x-2'}>
            <Button type={'button'} variant={'ghost'} onClick={props.onCancel}>
              <Trans i18nKey={'common.cancel'} />
            </Button>

            <Button type={'submit'}>
              <Trans i18nKey={'account.factorNameSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function QrImage({ src }: { src: string }) {
  return (
    <img
      alt={'QR Code'}
      src={src}
      width={160}
      height={160}
      className={'bg-white p-2'}
    />
  );
}

function useEnrollFactor(userId: string) {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const mutationKey = useFactorsMutationKey(userId);

  const mutationFn = async (factorName: string) => {
    const response = await client.auth.mfa.enroll({
      friendlyName: factorName,
      factorType: 'totp',
    });

    if (response.error) {
      return {
        success: false as const,
        data: response.error.code,
      };
    }

    return {
      success: true as const,
      data: response.data,
    };
  };

  return useMutation({
    mutationFn,
    mutationKey,
    onSuccess() {
      return queryClient.refetchQueries({
        queryKey: mutationKey,
      });
    },
  });
}

function useVerifyCodeMutation(userId: string) {
  const mutationKey = useFactorsMutationKey(userId);
  const queryClient = useQueryClient();
  const client = useSupabase();

  const mutationFn = async (params: { factorId: string; code: string }) => {
    const challenge = await client.auth.mfa.challenge({
      factorId: params.factorId,
    });

    if (challenge.error) {
      throw challenge.error;
    }

    const challengeId = challenge.data.id;

    const verify = await client.auth.mfa.verify({
      factorId: params.factorId,
      code: params.code,
      challengeId,
    });

    if (verify.error) {
      throw verify.error;
    }

    return verify;
  };

  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: () => {
      return queryClient.refetchQueries({ queryKey: mutationKey });
    },
  });
}

function ErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <TriangleAlert className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account.multiFactorSetupErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account.multiFactorSetupErrorDescription'} />
      </AlertDescription>
    </Alert>
  );
}
