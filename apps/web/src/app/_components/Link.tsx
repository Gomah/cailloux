'use client';

import { useProgressBar } from '@/hooks/useProgressBar';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, forwardRef, startTransition } from 'react';

export const Link = forwardRef<React.ElementRef<typeof NextLink>, ComponentProps<typeof NextLink>>(
  ({ ...props }, ref) => {
    const progress = useProgressBar();
    const router = useRouter();

    return (
      <NextLink
        ref={ref}
        {...props}
        onClick={(e) => {
          if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
          props?.onClick?.(e);
          e.preventDefault();
          progress.start();

          startTransition(() => {
            // @ts-expect-error
            router.push(props.href.toString());
            progress.done();
          });
        }}
      />
    );
  }
);
