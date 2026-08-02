import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Database } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { useUpdateAccountData } from '../hooks/use-update-account';
import { AccountDetailsSchema } from '../schema/account-details.schema';

type UpdateUserDataParams = Database['public']['Tables']['accounts']['Update'];

export function UpdateAccountDetailsForm({
  displayName,
  onUpdate,
  userId,
}: {
  displayName: string;
  userId: string;
  onUpdate: (user: Partial<UpdateUserDataParams>) => void;
}) {
  const updateAccountMutation = useUpdateAccountData(userId);
  const t = useTranslations('account');

  const form = useForm({
    resolver: zodResolver(AccountDetailsSchema),
    defaultValues: {
      displayName,
    },
  });

  const onSubmit = ({ displayName }: { displayName: string }) => {
    const data = { name: displayName };

    const promise = updateAccountMutation.mutateAsync(data).then(() => {
      onUpdate(data);
    });

    return toast.promise(() => promise, {
      success: t(`updateProfileSuccess`),
      error: t(`updateProfileError`),
      loading: t(`updateProfileLoading`),
    });
  };

  return (
    <div className={'flex flex-col space-y-8'}>
      <Form {...form}>
        <form
          data-test={'update-account-name-form'}
          className={'flex flex-col space-y-4'}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            name={'displayName'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account.name'} />
                </FormLabel>

                <FormControl>
                  <Input
                    data-test={'account-display-name'}
                    minLength={2}
                    placeholder={''}
                    maxLength={100}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button disabled={updateAccountMutation.isPending}>
              <Trans i18nKey={'account.updateProfileSubmitLabel'} />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
