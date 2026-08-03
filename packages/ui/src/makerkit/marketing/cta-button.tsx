import { cn } from '../../lib/utils';
import { Button } from '../../shadcn/button';

export const CtaButton: React.FC<React.ComponentProps<typeof Button>> =
  function CtaButtonComponent({ className, children, render, ...props }) {
    return (
      <Button
        size="lg"
        className={cn(className, {
          ['dark:shadow-primary/30 transition-all hover:shadow-xl']:
            props.variant === 'default' || !props.variant,
        })}
        render={render}
        {...props}
      >
        {children}
      </Button>
    );
  };
