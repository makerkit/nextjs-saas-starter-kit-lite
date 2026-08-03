'use client';

// Wraps the shadcn `FormMessage` to translate error messages via i18n.
// Lives outside `shadcn/form.tsx` so that file stays upstream-equivalent
// and can be replaced by the shadcn CLI (e.g. when switching themes).

import * as React from 'react';

import { cn } from '../lib/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  useFormField,
} from '../shadcn/form';
import { Trans } from './trans';

const FormMessage: React.FC<
  React.ComponentPropsWithRef<'p'> & { params?: Record<string, unknown> }
> = ({ className, children, params = {}, ...props }) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn('text-destructive text-[0.8rem] font-medium', className)}
      {...props}
    >
      {typeof body === 'string' ? (
        <Trans i18nKey={body} defaults={body} values={params} />
      ) : (
        body
      )}
    </p>
  );
};
FormMessage.displayName = 'FormMessage';

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
