'use client';

import { useRender } from '@base-ui/react/use-render';

import { cn } from '../../lib/utils';
import { GradientSecondaryText } from './gradient-secondary-text';

export const Pill: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & {
    label?: React.ReactNode;
    render?: React.ReactElement;
  }
> = function PillComponent({ className, render, label, children, ...props }) {
  const content = (
    <>
      {label && (
        <span
          className={
            'text-primary-foreground bg-primary h-[24px] rounded-2xl border-none px-2 py-0.5 text-xs font-semibold tracking-tight md:text-sm'
          }
        >
          {label}
        </span>
      )}
      <GradientSecondaryText
        className={'flex items-center gap-x-2 font-medium tracking-tight'}
      >
        {children}
      </GradientSecondaryText>
    </>
  );

  return useRender({
    render,
    defaultTagName: 'h3',
    props: {
      ...props,
      className: cn(
        'flex min-h-8.5 items-center gap-x-2 rounded-full border p-1 text-center text-xs font-medium text-transparent md:text-sm',
        className,
      ),
      children: content,
    },
  });
};

export const PillActionButton: React.FC<
  React.HTMLAttributes<HTMLButtonElement> & {
    render?: React.ReactElement;
  }
> = ({ render, children, className, ...props }) => {
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...props,
      className: cn(
        'text-secondary-foreground bg-input active:bg-primary active:text-primary-foreground hover:bg-muted rounded-full p-1 text-center text-xs font-medium ring ring-transparent transition-colors',
        className,
      ),
      children,
      'aria-label': 'Action button',
    },
  });
};
