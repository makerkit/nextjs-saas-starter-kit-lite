import { Suspense } from 'react';

import { getTranslations } from 'next-intl/server';

import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody } from '@kit/ui/page';
import { Skeleton } from '@kit/ui/skeleton';

import { Delayed } from '~/components/skeletons/page-skeletons';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

const callbackPath = pathsConfig.auth.callback;

const features = {
  enableAccountDeletion: true,
  enablePasswordUpdate: authConfig.providers.password,
};

const paths = {
  callback: callbackPath + `?next=${pathsConfig.app.profileSettings}`,
};

export const generateMetadata = async () => {
  const t = await getTranslations();
  const title = t('account.settingsTab');

  return {
    title,
  };
};

function PersonalAccountSettingsPage() {
  return (
    <PageBody>
      <div className={'flex w-full flex-1 flex-col lg:max-w-2xl'}>
        <Suspense fallback={<SettingsSkeleton />}>
          <AccountSettings />
        </Suspense>
      </div>
    </PageBody>
  );
}

async function AccountSettings() {
  const user = await requireUserInServerComponent();

  return (
    <PersonalAccountSettingsContainer
      userId={user.id}
      paths={paths}
      features={features}
    />
  );
}

function SettingsSkeleton() {
  return (
    <Delayed className={'flex flex-col gap-y-4'}>
      <Skeleton className={'h-40 w-full rounded-lg'} />
      <Skeleton className={'h-40 w-full rounded-lg'} />
      <Skeleton className={'h-40 w-full rounded-lg'} />
    </Delayed>
  );
}

export default PersonalAccountSettingsPage;
