import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageHeader } from '@kit/ui/page';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <PageHeader description={<AppBreadcrumbs />} />

      {props.children}
    </>
  );
}

export default UserSettingsLayout;
