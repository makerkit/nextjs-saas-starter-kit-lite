'use client';

import { useCallback, useMemo, useReducer, useRef } from 'react';

import { createAsyncDialogState } from './use-async-dialog-state';

interface UseAsyncDialogOptions {
  /**
   * External controlled open state (optional).
   * If not provided, the hook manages its own internal state.
   */
  open?: boolean;
  /**
   * External controlled onOpenChange callback (optional).
   * If not provided, the hook manages its own internal state.
   */
  onOpenChange?: (open: boolean) => void;
}

interface UseAsyncDialogReturn {
  /** Whether the dialog is open */
  open: boolean;
  /** Programmatic control for the current dialog session */
  setOpen: (open: boolean) => void;
  /** Whether an async operation is in progress */
  isPending: boolean;
  /** Set pending state - call from action callbacks */
  setIsPending: (pending: boolean) => void;
  /** Props to spread on Dialog component */
  dialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disablePointerDismissal: true;
  };
}

/**
 * Hook for managing dialog state with async operation protection.
 *
 * Prevents dialog from closing via Escape or backdrop click while
 * an async operation is in progress. Programmatic updates remain tied
 * to the dialog session that created them, so stale async completions
 * do not close a newer reopened dialog.
 */
export function useAsyncDialog(
  options: UseAsyncDialogOptions = {},
): UseAsyncDialogReturn {
  const { open: externalOpen, onOpenChange: externalOnOpenChange } = options;

  const [, forceRender] = useReducer((value: number) => value + 1, 0);
  const [internalOpen, setInternalOpen] = useReducer(
    (_: boolean, next: boolean) => next,
    false,
  );
  const stateRef = useRef(createAsyncDialogState(Boolean(externalOpen)));

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  stateRef.current.syncOpen(open);

  const isPending = stateRef.current.isPending();
  const sessionId = stateRef.current.getSessionId();

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!stateRef.current.isCurrentSession(sessionId)) return;

      if (isControlled && externalOnOpenChange) {
        externalOnOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [externalOnOpenChange, isControlled, sessionId],
  );

  const setIsPending = useCallback(
    (pending: boolean) => {
      if (!stateRef.current.isCurrentSession(sessionId)) return;

      stateRef.current.setPending(sessionId, pending);
      forceRender();
    },
    [sessionId],
  );

  const guardedOnOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && stateRef.current.isPending()) return;

      setOpen(newOpen);
    },
    [setOpen],
  );

  const dialogProps = useMemo(
    () =>
      ({
        open,
        onOpenChange: guardedOnOpenChange,
        disablePointerDismissal: true,
      }) as const,
    [guardedOnOpenChange, open],
  );

  return {
    open,
    setOpen,
    isPending,
    setIsPending,
    dialogProps,
  };
}
