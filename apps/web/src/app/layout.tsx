import { env } from '@/env';
import { TRPCReactProvider } from '@/trpc/react';
import { Toaster } from '@acme/ui/sonner';
import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { ProgressBar } from './_components/providers/ProgressBarProvider';
import { ThemeProvider } from './_components/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Acme',
  description: 'App starter',
};

let NextCacheToolbar: React.ComponentType = () => null;
let TailwindIndicator: React.ComponentType = () => null;

if (env.NODE_ENV === 'development') {
  NextCacheToolbar = dynamic(() => import('./_components/providers/CacheToolbar'));
  TailwindIndicator = dynamic(() => import('./_components/providers/TailwindIndicator'));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProgressBar className="fixed top-0 h-1 bg-gradient-to-r from-10% from-indigo-500 via-30% via-sky-500 to-90% to-emerald-500">
            <TRPCReactProvider>
              {children}
              <TailwindIndicator />
            </TRPCReactProvider>
            <NextCacheToolbar />
            <Toaster />
          </ProgressBar>
        </ThemeProvider>
      </body>
    </html>
  );
}
