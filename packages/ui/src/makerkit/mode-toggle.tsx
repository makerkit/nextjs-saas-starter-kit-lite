'use client';

import { useMemo } from 'react';

import { Computer, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '../lib/utils';
import { Button } from '../shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';
import { Trans } from './trans';

const MODES = ['light', 'dark', 'system'];

export function ModeToggle(props: { className?: string }) {
  const { setTheme, theme } = useTheme();

  const Items = useMemo(() => {
    return MODES.map((mode) => {
      const isSelected = theme === mode;

      return (
        <DropdownMenuItem
          className={cn('space-x-2', {
            'bg-muted': isSelected,
          })}
          key={mode}
          onClick={() => {
            setTheme(mode);
            setCookeTheme(mode);
          }}
        >
          <Icon theme={mode} />

          <span>
            <Trans i18nKey={`common.${mode}Theme`} />
          </span>
        </DropdownMenuItem>
      );
    });
  }, [setTheme, theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={props.className}>
          <Sun className="h-[0.9rem] w-[0.9rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[0.9rem] w-[0.9rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">{Items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SubMenuModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const MenuItems = useMemo(
    () =>
      MODES.map((mode) => {
        const isSelected = theme === mode;

        return (
          <DropdownMenuItem
            className={cn('flex cursor-pointer items-center space-x-2', {
              'bg-muted': isSelected,
            })}
            key={mode}
            onClick={() => {
              setTheme(mode);
              setCookeTheme(mode);
            }}
          >
            <Icon theme={mode} />

            <span>
              <Trans i18nKey={`common.${mode}Theme`} />
            </span>
          </DropdownMenuItem>
        );
      }),
    [setTheme, theme],
  );

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={
            'hidden w-full items-center justify-between gap-x-3 lg:flex'
          }
        >
          <span className={'flex space-x-2'}>
            <Icon theme={resolvedTheme} />

            <span>
              <Trans i18nKey={'common.theme'} />
            </span>
          </span>
        </DropdownMenuSubTrigger>

        <DropdownMenuSubContent>{MenuItems}</DropdownMenuSubContent>
      </DropdownMenuSub>

      <div className={'lg:hidden'}>
        <DropdownMenuLabel>
          <Trans i18nKey={'common.theme'} />
        </DropdownMenuLabel>

        {MenuItems}
      </div>
    </>
  );
}

function setCookeTheme(theme: string) {
  document.cookie = `theme=${theme}; path=/; max-age=31536000`;
}

function Icon({ theme }: { theme: string | undefined }) {
  switch (theme) {
    case 'light':
      return <Sun className="h-4" />;
    case 'dark':
      return <Moon className="h-4" />;
    case 'system':
      return <Computer className="h-4" />;
  }
}
