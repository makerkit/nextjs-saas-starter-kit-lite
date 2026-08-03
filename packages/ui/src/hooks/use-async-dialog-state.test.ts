import { describe, expect, it } from 'vitest';

import { createAsyncDialogState } from './use-async-dialog-state';

describe('createAsyncDialogState', () => {
  it('starts idle for a closed dialog', () => {
    const state = createAsyncDialogState();

    expect(state.getSessionId()).toBe(0);
    expect(state.isPending()).toBe(false);
    expect(state.isCurrentSession(0)).toBe(true);
  });

  it('tracks pending state for the active session', () => {
    const state = createAsyncDialogState(true);
    const sessionId = state.getSessionId();

    state.setPending(sessionId, true);

    expect(state.isPending()).toBe(true);

    state.setPending(sessionId, false);

    expect(state.isPending()).toBe(false);
  });

  it('keeps pending true until all overlapping requests settle', () => {
    const state = createAsyncDialogState(true);
    const sessionId = state.getSessionId();

    state.setPending(sessionId, true);
    state.setPending(sessionId, true);

    expect(state.isPending()).toBe(true);

    state.setPending(sessionId, false);

    expect(state.isPending()).toBe(true);

    state.setPending(sessionId, false);

    expect(state.isPending()).toBe(false);
  });

  it('ignores extra false transitions', () => {
    const state = createAsyncDialogState(true);
    const sessionId = state.getSessionId();

    state.setPending(sessionId, false);

    expect(state.isPending()).toBe(false);
  });

  it('creates a new session when reopening the dialog', () => {
    const state = createAsyncDialogState(true);
    const firstSessionId = state.getSessionId();

    state.syncOpen(false);
    state.syncOpen(true);

    expect(state.getSessionId()).toBe(firstSessionId + 1);
    expect(state.isCurrentSession(firstSessionId)).toBe(false);
  });

  it('ignores stale pending updates from an older session after reopen', () => {
    const state = createAsyncDialogState(true);
    const firstSessionId = state.getSessionId();

    state.setPending(firstSessionId, true);
    state.syncOpen(false);
    state.syncOpen(true);

    expect(state.isPending()).toBe(false);

    state.setPending(firstSessionId, false);

    expect(state.isPending()).toBe(false);
  });

  it('allows new session requests after a reopen even if the old one was pending', () => {
    const state = createAsyncDialogState(true);
    const firstSessionId = state.getSessionId();

    state.setPending(firstSessionId, true);
    state.syncOpen(false);
    state.syncOpen(true);

    const secondSessionId = state.getSessionId();

    state.setPending(secondSessionId, true);

    expect(state.isPending()).toBe(true);

    state.setPending(firstSessionId, false);

    expect(state.isPending()).toBe(true);

    state.setPending(secondSessionId, false);

    expect(state.isPending()).toBe(false);
  });

  it('does not bump the session id for repeated syncs with the same open value', () => {
    const state = createAsyncDialogState();

    state.syncOpen(false);
    expect(state.getSessionId()).toBe(0);

    state.syncOpen(true);
    const openSessionId = state.getSessionId();

    state.syncOpen(true);

    expect(state.getSessionId()).toBe(openSessionId);
  });
});
