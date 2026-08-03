import { cn } from '../../lib/utils';
import { Heading } from '../../shadcn/heading';

interface SecondaryHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  pill?: React.ReactNode;
  heading: React.ReactNode;
  subheading: React.ReactNode;
}

export const SecondaryHero: React.FC<SecondaryHeroProps> =
  function SecondaryHeroComponent({
    className,
    pill,
    heading,
    subheading,
    children,
    ...props
  }) {
    return (
      <div
        className={cn(
          'flex flex-col items-center space-y-4 text-center',
          className,
        )}
        {...props}
      >
        {pill}

        <div className="flex flex-col">
          <Heading level={2} className="tracking-tighter">
            {heading}
          </Heading>

          <h3 className="text-secondary-foreground/70 text-center font-sans text-xl font-medium tracking-tight">
            {subheading}
          </h3>
        </div>

        {children}
      </div>
    );
  };
