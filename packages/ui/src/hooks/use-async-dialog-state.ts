interface AsyncDialogState {
  getSessionId: () => number;
  isCurrentSession: (sessionId: number) => boolean;
  isPending: () => boolean;
  setPending: (sessionId: number, pending: boolean) => void;
  syncOpen: (open: boolean) => void;
}

export function createAsyncDialogState(initialOpen = false): AsyncDialogState {
  let isOpen = initialOpen;
  let sessionId = initialOpen ? 1 : 0;
  const pendingCountBySession = new Map<number, number>();

  const getPendingCount = () => pendingCountBySession.get(sessionId) ?? 0;

  return {
    getSessionId: () => sessionId,
    isCurrentSession: (candidateSessionId) => candidateSessionId === sessionId,
    isPending: () => getPendingCount() > 0,
    setPending: (targetSessionId, pending) => {
      if (targetSessionId !== sessionId) return;

      const currentPendingCount =
        pendingCountBySession.get(targetSessionId) ?? 0;
      const nextPendingCount = pending
        ? currentPendingCount + 1
        : Math.max(0, currentPendingCount - 1);

      if (nextPendingCount === 0) {
        pendingCountBySession.delete(targetSessionId);
        return;
      }

      pendingCountBySession.set(targetSessionId, nextPendingCount);
    },
    syncOpen: (nextOpen) => {
      if (nextOpen === isOpen) return;

      isOpen = nextOpen;

      if (nextOpen) {
        sessionId += 1;
      }
    },
  };
}
