'use client';

import { useCallback, useState } from 'react';

import { cn } from '../../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../../shadcn/alert';
import { Heading } from '../../shadcn/heading';
import { Spinner } from '../spinner';
import { NewsletterSignup } from './newsletter-signup';

interface NewsletterSignupContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSignup: (email: string) => Promise<void>;
  heading?: string;
  description?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function NewsletterSignupContainer({
  onSignup,
  heading = 'Subscribe to our newsletter',
  description = 'Get the latest updates and offers directly to your inbox.',
  successMessage = 'Thank you for subscribing!',
  errorMessage = 'An error occurred. Please try again.',
  className,
  ...props
}: NewsletterSignupContainerProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = useCallback(
    async (data: { email: string }) => {
      setStatus('loading');

      try {
        await onSignup(data.email);

        setStatus('success');
      } catch (error) {
        console.error('Newsletter signup error:', error);
        setStatus('error');
      }
    },
    [onSignup],
  );

  return (
    <div
      className={cn('flex flex-col items-center space-y-4', className)}
      {...props}
    >
      <div className="text-center">
        <Heading level={4}>{heading}</Heading>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {status === 'idle' && <NewsletterSignup onSignup={handleSubmit} />}

      {status === 'loading' && (
        <div className="flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {status === 'success' && (
        <div>
          <Alert variant="success">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {status === 'error' && (
        <div>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
