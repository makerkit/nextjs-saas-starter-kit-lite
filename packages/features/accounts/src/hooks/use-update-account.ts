import { useMutation } from '@tanstack/react-query';

import { Database } from '@kit/supabase/database';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

type UpdateData = Database['public']['Tables']['accounts']['Update'];

export function useUpdateAccountData(accountId: string) {
  const client = useSupabase();

  const mutationKey = ['account.data', accountId];

  const mutationFn = async (data: UpdateData) => {
    const response = await client.from('accounts').update(data).match({
      id: accountId,
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
