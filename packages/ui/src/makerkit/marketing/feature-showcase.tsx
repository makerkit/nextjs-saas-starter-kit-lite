import React from 'react';

import { cn } from '../../lib/utils';

interface FeatureShowcaseProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: React.ReactNode;
  icon?: React.ReactNode;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> =
  function FeatureShowcaseComponent({
    className,
    heading,
    icon,
    children,
    ...props
  }) {
    return (
      <div
        className={cn('flex flex-col justify-between space-y-8', className)}
        {...props}
      >
        <div className="flex w-full flex-col gap-y-4">
          {icon && <div className="flex">{icon}</div>}
          <h3 className="text-3xl font-normal tracking-tight xl:text-5xl">
            {heading}
          </h3>
        </div>

        {children}
      </div>
    );
  };

export function FeatureShowcaseIconContainer(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  return (
    <div className={'flex'}>
      <div
        className={cn(
          'flex items-center justify-center space-x-2.5 font-medium',
          props.className,
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
