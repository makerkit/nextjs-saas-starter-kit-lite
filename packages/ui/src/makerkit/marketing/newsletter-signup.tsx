'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '../../lib/utils';
import { Button } from '../../shadcn/button';
import { Input } from '../../shadcn/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../form';

const NewsletterFormSchema = z.object({
  email: z.email(),
});

type NewsletterFormValues = z.output<typeof NewsletterFormSchema>;

interface NewsletterSignupProps extends React.HTMLAttributes<HTMLDivElement> {
  onSignup: (data: NewsletterFormValues) => void;
  buttonText?: string;
  placeholder?: string;
}

export function NewsletterSignup({
  onSignup,
  buttonText = 'Subscribe',
  placeholder = 'Enter your email',
  className,
  ...props
}: NewsletterSignupProps) {
  const form = useForm({
    resolver: zodResolver(NewsletterFormSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <div className={cn('w-full max-w-sm', className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSignup)}
          className="flex flex-col gap-y-3"
        >
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl
                  render={<Input placeholder={placeholder} {...field} />}
                />

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
}
