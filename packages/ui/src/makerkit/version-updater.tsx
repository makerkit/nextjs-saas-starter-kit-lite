'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { RocketIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../shadcn/alert-dialog';
import { Button } from '../shadcn/button';
import { Trans } from './trans';

/**
 * Current version of the app that is running
 */
let version: string | null = null;

/**
 * Default interval time in seconds to check for new version
 * By default, it is set to 60 seconds
 */
const DEFAULT_REFETCH_INTERVAL = 60;

export function VersionUpdater(props: { intervalTimeInSecond?: number }) {
  const { data } = useVersionUpdater(props);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  if (data?.didChange && !dismissed && !open) {
    setOpen(true);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={'flex items-center gap-x-2'}>
            <RocketIcon className={'h-4'} />
            <span>
              <Trans i18nKey="common.newVersionAvailable" />
            </span>
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey="common.newVersionAvailableDescription" />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setDismissed(true);
            }}
          >
            <Trans i18nKey="common.back" />
          </AlertDialogCancel>

          <Button onClick={() => window.location.reload()}>
            <Trans i18nKey="common.newVersionSubmitButton" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function useVersionUpdater(props: { intervalTimeInSecond?: number } = {}) {
  const intervalEnv =
    process.env.NEXT_PUBLIC_VERSION_UPDATER_REFETCH_INTERVAL_SECONDS;

  const interval = intervalEnv ? Number(intervalEnv) : DEFAULT_REFETCH_INTERVAL;

  const refetchInterval = (props.intervalTimeInSecond ?? interval) * 1000;

  // start fetching new version after half of the interval time
  const staleTime = refetchInterval / 2;

  return useQuery({
    queryKey: ['version-updater'],
    staleTime,
    gcTime: refetchInterval,
    refetchIntervalInBackground: true,
    refetchInterval,
    initialData: null,
    queryFn: async () => {
      const response = await fetch('/api/version');
      const currentVersion = await response.text();
      const oldVersion = version;

      version = currentVersion;

      const didChange = oldVersion !== null && currentVersion !== oldVersion;

      return {
        currentVersion,
        oldVersion,
        didChange,
      };
    },
  });
}
