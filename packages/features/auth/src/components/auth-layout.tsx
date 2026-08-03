import { cn } from '@kit/ui/utils';

export function AuthLayoutShell({
  children,
  className,
  Logo,
  contentClassName,
}: React.PropsWithChildren<{
  Logo?: React.ComponentType;
  className?: string;
  contentClassName?: string;
}>) {
  return (
    <>
      <div
        className={cn(
          'animate-in fade-in slide-in-from-top-16 zoom-in-95 flex h-screen flex-col items-center justify-center gap-y-8 duration-1000',
          className,
        )}
      >
        <div
          className={cn(
            'bg-background flex w-full max-w-[23rem] flex-col gap-y-4 md:w-8/12 lg:w-5/12 xl:w-4/12',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>

      <div className="absolute top-8 left-0 flex w-full justify-center lg:top-6 lg:left-8 lg:w-auto">
        {Logo ? <Logo /> : null}
      </div>
    </>
  );
}
