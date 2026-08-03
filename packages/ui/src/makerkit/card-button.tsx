import * as React from 'react';

import { useRender } from '@base-ui/react/use-render';
import { ChevronRight } from 'lucide-react';

import { cn } from '#utils';

export const CardButton: React.FC<
  {
    render?: React.ReactElement;
    className?: string;
    children?: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = function CardButton({ className, render, children, ...props }) {
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...props,
      className: cn(
        'group hover:bg-secondary/20 active:bg-secondary active:bg-secondary/50 dark:shadow-primary/20 relative flex h-36 flex-col rounded-lg border transition-all hover:shadow-xs active:shadow-lg',
        className,
      ),
      children,
    },
  });
};

export const CardButtonTitle: React.FC<
  {
    render?: React.ReactElement;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonTitle({ className, render, children, ...props }) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      className: cn(
        className,
        'text-muted-foreground group-hover:text-secondary-foreground text-left align-super text-sm font-medium transition-colors',
      ),
      children,
    },
  });
};

export const CardButtonHeader: React.FC<
  {
    children: React.ReactNode;
    render?: React.ReactElement;
    displayArrow?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonHeader({
  className,
  render,
  displayArrow = true,
  children,
  ...props
}) {
  const content = (
    <>
      {children}

      <ChevronRight
        className={cn(
          'text-muted-foreground group-hover:text-secondary-foreground absolute top-4 right-2 h-4 transition-colors',
          {
            hidden: !displayArrow,
          },
        )}
      />
    </>
  );

  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      className: cn(className, 'p-4'),
      children: content,
    },
  });
};

export const CardButtonContent: React.FC<
  {
    render?: React.ReactElement;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonContent({ className, render, children, ...props }) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      className: cn(className, 'flex flex-1 flex-col px-4'),
      children,
    },
  });
};

export const CardButtonFooter: React.FC<
  {
    render?: React.ReactElement;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonFooter({ className, render, children, ...props }) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: {
      ...props,
      className: cn(
        className,
        'mt-auto flex h-0 w-full flex-col justify-center border-t px-4',
      ),
      children,
    },
  });
};
