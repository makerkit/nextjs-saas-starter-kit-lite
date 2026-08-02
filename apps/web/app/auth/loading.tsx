import { AuthFormSkeleton } from '~/components/skeletons/page-skeletons';

/**
 * Rendered inside AuthLayoutShell, which already provides the centered card.
 * Every auth screen is a stack of inputs above a submit button, so the shape is
 * predictable enough to reproduce.
 */
export default function AuthLoading() {
  return <AuthFormSkeleton />;
}
