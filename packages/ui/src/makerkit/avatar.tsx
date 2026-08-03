'use client';

// Wraps the shadcn `Avatar` primitives to apply the app's avatar shape — a
// rounded square rather than the upstream circle — to every avatar, whether it
// represents a person or a workspace. Lives outside `shadcn/avatar.tsx` so that
// file stays upstream-equivalent and can be replaced by the shadcn CLI (e.g.
// when switching themes).
//
// The shape covers all four surfaces the primitive rounds independently: the
// root, its `after:` border ring, the image and the fallback. Call sites can
// still override by passing their own rounding class.

import { cn } from '../lib/utils';
import {
  Avatar as AvatarPrimitive,
  AvatarBadge,
  AvatarFallback as AvatarFallbackPrimitive,
  AvatarGroup,
  AvatarGroupCount as AvatarGroupCountPrimitive,
  AvatarImage as AvatarImagePrimitive,
} from '../shadcn/avatar';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive>) {
  return (
    <AvatarPrimitive
      className={cn('rounded-md after:rounded-md', className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarImagePrimitive>) {
  return (
    <AvatarImagePrimitive className={cn('rounded-md', className)} {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarFallbackPrimitive>) {
  return (
    <AvatarFallbackPrimitive
      className={cn('rounded-md', className)}
      {...props}
    />
  );
}

// the overflow counter sits in the same row as the avatars it summarises, so
// it follows the same shape. `AvatarBadge` stays round — it is a status dot.
function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<typeof AvatarGroupCountPrimitive>) {
  return (
    <AvatarGroupCountPrimitive
      className={cn('rounded-md', className)}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
