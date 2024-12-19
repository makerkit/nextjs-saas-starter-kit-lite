import { forwardRef } from 'react';

import { cn } from '../../lib/utils';
import { Heading } from '../../shadcn/heading';

interface SecondaryHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  pill?: React.ReactNode;
  heading: React.ReactNode;
  subheading: React.ReactNode;
}

export const SecondaryHero = forwardRef<HTMLDivElement, SecondaryHeroProps>(
  function SecondaryHeroComponent(
    { className, pill, heading, subheading, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center space-y-6 text-center',
          className,
        )}
        {...props}
      >
        {pill}

        <div className="flex flex-col">
          <Heading level={2} className="tracking-tighter">
            {heading}
          </Heading>

          <h3 className="font-sans text-xl font-normal tracking-tight text-muted-foreground">
            {subheading}
          </h3>
        </div>

        {children}
      </div>
    );
  },
);