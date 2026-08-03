import { useRender } from '@base-ui/react/use-render';

import { cn } from '../../lib/utils';

export const GradientSecondaryText: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & {
    render?: React.ReactElement;
  }
> = function GradientSecondaryTextComponent({
  className,
  render,
  children,
  ...props
}) {
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...props,
      className: cn(
        'dark:from-foreground/60 dark:to-foreground text-secondary-foreground dark:bg-linear-to-r dark:bg-clip-text dark:text-transparent',
        className,
      ),
      children,
    },
  });
};
