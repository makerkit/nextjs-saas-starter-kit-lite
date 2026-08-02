'use client';

import { useMemo } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDown } from 'lucide-react';

import { Button } from '../shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';
import { Trans } from './trans';

function MobileNavigationDropdown({
  links,
}: {
  links: {
    path: string;
    label: string;
  }[];
}) {
  const path = usePathname();

  const currentPathName = useMemo(() => {
    return Object.values(links).find((link) => link.path === path)?.label ?? '';
  }, [links, path]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'secondary'} className={'w-full'}>
          <span
            className={'flex w-full items-center justify-between space-x-2'}
          >
            <span>
              <Trans i18nKey={currentPathName} defaults={currentPathName} />
            </span>

            <ChevronDown className={'h-5'} />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={
          'dark:divide-dark-700 w-screen divide-y divide-gray-100' +
          ' rounded-none'
        }
      >
        {Object.values(links).map((link) => {
          return (
            <DropdownMenuItem asChild key={link.path}>
              <Link
                className={'flex h-12 w-full items-center'}
                href={link.path}
              >
                <Trans i18nKey={link.label} defaults={link.label} />
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MobileNavigationDropdown;
