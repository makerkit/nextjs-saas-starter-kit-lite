import { Skeleton } from '@kit/ui/skeleton';
import { cn } from '@kit/ui/utils';

/**
 * Shared loading blocks.
 *
 * These are used twice: by `loading.tsx` files while a route segment loads, and
 * as `<Suspense>` fallbacks for the data-dependent regions inside a page. Using
 * the same block in both places means the shape does not change as a navigation
 * hands off from one to the other.
 *
 * Match the fallback to how predictable the shape is. A confident guess that
 * turns out wrong is worse than reserved empty space, because the layout jumps
 * when the real content arrives.
 */

/**
 * Fades a fallback in after a short delay so a fast response never flashes a
 * skeleton. `fill-mode-both` applies the animation's initial state during the
 * delay, which keeps it invisible until the delay elapses.
 */
export function Delayed({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'animate-in fade-in fill-mode-both delay-200 duration-300',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <Delayed className={'flex flex-col gap-y-2 px-4 py-6'}>
      <Skeleton className={'h-7 w-48'} />
      <Skeleton className={'h-4 w-64'} />
    </Delayed>
  );
}

/**
 * Mirrors the dashboard grid in `dashboard-demo-charts`, breakpoints included,
 * so the cards land where the skeletons were.
 */
export function ChartCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Delayed
      className={
        'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
      }
      data-testid={'chart-cards-skeleton'}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton className={'h-52 w-full rounded-lg'} key={index} />
      ))}
    </Delayed>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Delayed className={'flex flex-col gap-y-2'}>
      <Skeleton className={'h-10 w-full rounded-md'} />

      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton className={'h-12 w-full rounded-md'} key={index} />
      ))}
    </Delayed>
  );
}

/**
 * For auth routes. Every auth screen is a stack of inputs and a submit button
 * inside the same shell, so the shape is worth reproducing.
 */
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <Delayed className={'flex w-full flex-col gap-y-4'}>
      {Array.from({ length: fields }).map((_, index) => (
        <div className={'flex flex-col gap-y-2'} key={index}>
          <Skeleton className={'h-4 w-20'} />
          <Skeleton className={'h-10 w-full rounded-md'} />
        </div>
      ))}

      <Skeleton className={'h-10 w-full rounded-md'} />
    </Delayed>
  );
}

/**
 * For routes whose content shape is not predictable, such as marketing pages.
 * Reserves vertical space so the footer does not jump up, and shows nothing
 * else rather than guessing at a layout.
 */
export function ContentFallback({ className }: { className?: string }) {
  return <div className={cn('min-h-[60vh] w-full', className)} />;
}
