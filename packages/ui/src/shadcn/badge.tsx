import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent shadow-xs',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent shadow-xs',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-50 text-green-500 hover:bg-green-50 dark:bg-green-500/20 dark:hover:bg-green-500/20',
        warning:
          'border-transparent bg-orange-50 text-orange-500 hover:bg-orange-50 dark:bg-orange-500/20 dark:hover:bg-orange-500/20',
        info: 'border-transparent bg-blue-50 text-blue-500 hover:bg-blue-50 dark:bg-blue-500/20 dark:hover:bg-blue-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
