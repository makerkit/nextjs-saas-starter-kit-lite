import { RadioGroup, RadioGroupItem } from '../shadcn/radio-group';

import { cn } from '#lib/utils';

function RadioGroupItemLabel({
  selected,
  className,
  children,
  ...props
}: React.PropsWithChildren<{
  selected?: boolean;
}> &
  React.LabelHTMLAttributes<unknown>) {
  return (
    <label
      data-selected={selected}
      className={cn(
        className,
        'flex cursor-pointer rounded-md' +
          ' border-input items-center space-x-4 border' +
          ' focus-within:border-primary active:bg-muted p-2.5 text-sm transition-all',
        {
          [`bg-muted/70`]: selected,
          [`hover:bg-muted/50`]: !selected,
        },
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export { RadioGroup, RadioGroupItem, RadioGroupItemLabel };
