'use client';

import { useProgressBar } from '@/hooks/useProgressBar';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, startTransition } from 'react';

export default function Link({ href, children, ...rest }: ComponentProps<typeof NextLink>) {
  const progress = useProgressBar();
  const router = useRouter();

  return (
    <NextLink
      href={href}
      onClick={(e) => {
        e.preventDefault();
        progress.start();

        startTransition(() => {
          // @ts-expect-error
          router.push(href.toString());
          progress.done();
        });
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
