import { If } from './if';
import { LoadingOverlay } from './loading-overlay';
import { TopLoadingBarIndicator } from './top-loading-bar-indicator';

export function GlobalLoader({
  displayLogo = false,
  fullPage = false,
  displaySpinner = true,
  displayTopLoadingBar = true,
  children,
}: React.PropsWithChildren<{
  displayLogo?: boolean;
  fullPage?: boolean;
  displaySpinner?: boolean;
  displayTopLoadingBar?: boolean;
}>) {
  return (
    <>
      <If condition={displayTopLoadingBar}>
        <TopLoadingBarIndicator />
      </If>

      <If condition={displaySpinner}>
        <div
          className={
            'zoom-in-80 animate-in fade-in slide-in-from-bottom-12 flex flex-1 flex-col items-center justify-center duration-500 ease-out'
          }
        >
          <LoadingOverlay displayLogo={displayLogo} fullPage={fullPage} />

          {children}
        </div>
      </If>
    </>
  );
}
