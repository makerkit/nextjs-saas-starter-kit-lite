import { Loader2Icon } from 'lucide-react';

import { cn } from '../lib/utils/cn';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('text-muted-foreground size-6 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
