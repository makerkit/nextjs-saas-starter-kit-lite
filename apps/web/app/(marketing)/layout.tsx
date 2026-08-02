import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';

/**
 * Synchronous on purpose. This layout used to await the session so the header
 * could render the signed-in state, which put user data into the server HTML of
 * every marketing page and forced them out of shared caches. The header now
 * reads the session on the client, so this response is identical for everyone.
 */
function SiteLayout(props: React.PropsWithChildren) {
  return (
    <div className={'flex min-h-[100vh] flex-col'}>
      <SiteHeader />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default SiteLayout;
