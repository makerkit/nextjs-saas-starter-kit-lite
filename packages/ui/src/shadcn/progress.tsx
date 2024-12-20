'use client';

import * as React from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '../lib/utils';

const Progress: React.FC<
  React.ComponentProps<typeof ProgressPrimitive.Root>
> = ({ className, value, ...props }) => (
  <ProgressPrimitive.Root
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value ? value : 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };