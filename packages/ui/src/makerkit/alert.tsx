// Project-specific Alert variants. Apply via `className` so that
// `shadcn/alert.tsx` stays upstream-equivalent and CLI-replaceable, e.g.:
//   <Alert className={alertExtras.success}>...</Alert>

export const alertExtras = {
  info: 'border-blue-600/20 text-blue-600 *:data-[slot=alert-description]:text-blue-600/90 *:[svg]:text-blue-600 dark:text-blue-400 dark:border-blue-400/30 dark:*:data-[slot=alert-description]:text-blue-400/90 dark:*:[svg]:text-blue-400',
  success:
    'border-green-600/20 text-green-600 *:data-[slot=alert-description]:text-green-600/90 *:[svg]:text-green-600 dark:text-green-400 dark:border-green-400/30 dark:*:data-[slot=alert-description]:text-green-400/90 dark:*:[svg]:text-green-400',
  warning:
    'border-yellow-600/30 text-yellow-700 *:data-[slot=alert-description]:text-yellow-700/90 *:[svg]:text-yellow-600 dark:text-yellow-400 dark:border-yellow-400/30 dark:*:data-[slot=alert-description]:text-yellow-400/90 dark:*:[svg]:text-yellow-400',
} as const;

export type AlertExtraVariant = keyof typeof alertExtras;
