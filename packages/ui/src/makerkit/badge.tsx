// Project-specific Badge variants. Apply via `className` so that
// `shadcn/badge.tsx` stays upstream-equivalent and CLI-replaceable, e.g.:
//   <Badge className={badgeExtras.success}>OK</Badge>

export const badgeExtras = {
  info: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
  success:
    'bg-green-600/10 text-green-600 dark:bg-green-600/20 [&>svg]:text-green-600',
  warning:
    'bg-transparent border-yellow-600 text-yellow-600 dark:border-yellow-600 [&>svg]:text-yellow-600',
} as const;

export type BadgeExtraVariant = keyof typeof badgeExtras;
