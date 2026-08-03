import { cn } from '../../lib/utils';
import { If } from '../if';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  centered?: boolean;
}

export const Header: React.FC<HeaderProps> = function ({
  className,
  logo,
  navigation,
  actions,
  centered = true,
  ...props
}) {
  const grids = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  };

  const gridAmount = [logo, navigation, actions].filter(Boolean).length;

  const gridClassName = grids[gridAmount as keyof typeof grids];

  return (
    <div
      className={cn(
        'site-header bg-background/80 dark:bg-background/80 sticky top-0 z-10 w-full backdrop-blur-lg',
        className,
      )}
      {...props}
    >
      <div
        className={cn({
          'container mx-auto': centered,
        })}
      >
        <div className={cn('grid h-14 items-center', gridClassName)}>
          {logo}

          <If condition={navigation}>
            <div className="order-first md:order-none">{navigation}</div>
          </If>

          <If condition={actions}>
            <div className="flex items-center justify-end gap-x-2">
              {actions}
            </div>
          </If>
        </div>
      </div>
    </div>
  );
};
