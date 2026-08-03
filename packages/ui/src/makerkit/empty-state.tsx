import React from 'react';

import { VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { Button } from '../shadcn/button';

const EmptyStateHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn('text-lg font-medium tracking-tight', className)}
    {...props}
  />
);
EmptyStateHeading.displayName = 'EmptyStateHeading';

const EmptyStateText: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn('text-muted-foreground text-sm', className)} {...props} />
);
EmptyStateText.displayName = 'EmptyStateText';

const EmptyStateButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Button>
> = ({ className, ...props }) => (
  <Button className={cn('mt-4', className)} {...props} />
);

EmptyStateButton.displayName = 'EmptyStateButton';

const EmptyState: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);

  const heading = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyStateHeading,
  );

  const text = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyStateText,
  );

  const button = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyStateButton,
  );

  const media = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyMedia,
  );

  const cmps = [
    EmptyStateHeading,
    EmptyStateText,
    EmptyStateButton,
    EmptyMedia,
  ];

  const otherChildren = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      !cmps.includes(child.type as (typeof cmps)[number]),
  );

  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-xs',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        {media}
        {heading}
        {text}
        {button}
        {otherChildren}
      </div>
    </div>
  );
};
EmptyState.displayName = 'EmptyState';

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptyStateHeading,
  EmptyStateText,
  EmptyStateButton,
  EmptyMedia,
};
