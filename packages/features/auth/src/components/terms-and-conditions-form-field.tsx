import Link from 'next/link';

import { Checkbox } from '@kit/ui/checkbox';
import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

export function TermsAndConditionsFormField(
  props: {
    name?: string;
  } = {},
) {
  return (
    <FormField
      name={props.name ?? 'termsAccepted'}
      render={({ field }) => {
        return (
          <FormItem>
            <FormControl>
              <label className={'flex items-start space-x-2 py-2'}>
                <Checkbox required name={field.name} />

                <div className={'text-xs'}>
                  <Trans
                    i18nKey={'auth.acceptTermsAndConditions'}
                    components={{
                      TermsOfServiceLink: (
                        <Link
                          target={'_blank'}
                          className={'underline'}
                          href={'/terms-of-service'}
                        >
                          <Trans i18nKey={'auth.termsOfService'} />
                        </Link>
                      ),
                      PrivacyPolicyLink: (
                        <Link
                          target={'_blank'}
                          className={'underline'}
                          href={'/privacy-policy'}
                        >
                          <Trans i18nKey={'auth.privacyPolicy'} />
                        </Link>
                      ),
                    }}
                  />
                </div>
              </label>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
