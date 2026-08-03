import React from 'react';

import { cn } from '../../lib/utils';

interface EcosystemShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: React.ReactNode;
  description?: React.ReactNode;
  textPosition?: 'left' | 'right';
}

export const EcosystemShowcase: React.FC<EcosystemShowcaseProps> =
  function EcosystemShowcaseComponent({
    className,
    heading,
    description,
    textPosition = 'left',
    children,
    ...props
  }) {
    return (
      <div
        className={cn(
          'bg-muted/50 flex flex-1 flex-col space-y-8 rounded-md p-6 lg:space-y-0 lg:space-x-16',
          className,
          {
            'lg:flex-row': textPosition === 'left',
            'lg:flex-row-reverse': textPosition === 'right',
          },
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-col items-start gap-y-4 text-left lg:w-1/3',
            {
              'text-right': textPosition === 'right',
            },
          )}
        >
          <h2 className="text-secondary-foreground text-3xl font-normal tracking-tight">
            {heading}
          </h2>

          {description && (
            <p className="text-muted-foreground mt-2 text-base lg:text-lg">
              {description}
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex w-full lg:w-2/3',
            textPosition === 'right' && 'm-0 text-right',
          )}
        >
          {children}
        </div>
      </div>
    );
  };
