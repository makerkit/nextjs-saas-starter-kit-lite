'use client';

// Re-exports the upstream `Toaster` and pulls `toast` straight from `sonner`
// so that `shadcn/sonner.tsx` stays upstream-equivalent and can be replaced
// by the shadcn CLI (e.g. when switching themes).

export { toast } from 'sonner';
export { Toaster } from '../shadcn/sonner';
