'use client';

import { useMemo } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDown } from 'lucide-react';

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

  const items = useMemo(
    function MenuItems() {
      return Object.values(links).map((link) => {
        return (
          <DropdownMenuItem key={link.path}>
            <Link
              className={'flex h-full w-full items-center'}
              href={link.path}
            >
              <Trans i18nKey={link.label} defaults={link.label} />
            </Link>
          </DropdownMenuItem>
        );
      });
    },
    [links],
  );

  const currentPathName = useMemo(() => {
    return Object.values(links).find((link) => link.path === path)?.label ?? '';
  }, [links, path]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={'w-full'}>
        <div
          className={
            'Button dark:ring-dark-700 w-full justify-start ring-2 ring-gray-100'
          }
        >
          <span
            className={
              'ButtonNormal flex w-full items-center justify-between space-x-2'
            }
          >
            <span>
              <Trans i18nKey={currentPathName} defaults={currentPathName} />
            </span>

            <ChevronDown className={'h-5'} />
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent>{items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MobileNavigationDropdown;
