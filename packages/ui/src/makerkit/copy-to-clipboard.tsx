'use client';

import { ReactNode, useCallback, useState } from 'react';

import { Check, Copy } from 'lucide-react';

import { cn } from '../lib/utils';
import { toast } from './sonner';

interface CopyToClipboardProps {
  children: ReactNode;
  value?: string;
  className?: string;
  tooltipText?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * A component that copies text to clipboard when clicked
 */
export function CopyToClipboard({
  children,
  className,
  value = undefined,
  tooltipText = 'Copy to clipboard',
  successMessage = 'Copied to clipboard',
  errorMessage = 'Failed to copy to clipboard',
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();

      const textToCopy = children?.toString() || '';

      navigator.clipboard
        .writeText(value ?? textToCopy)
        .then(() => {
          setCopied(true);
          toast.success(successMessage);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((error) => {
          console.error('Failed to copy text: ', error);
          toast.error(errorMessage);
        });
    },
    [children, value, successMessage, errorMessage],
  );

  if (typeof value === 'undefined') {
    return children;
  }

  return (
    <button
      title={tooltipText}
      onClick={handleCopy}
      className={cn(
        'group group/button -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 transition-colors hover:underline',
        className,
      )}
    >
      {children}

      <span className="text-muted-foreground transition-opacity">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
