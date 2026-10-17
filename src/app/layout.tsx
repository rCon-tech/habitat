import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Providers } from '@/components/Providers';
import { THEME_INIT } from '@/components/ThemeToggle';
import { appUrl } from '@/env';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: 'Habitat', template: '%s · Habitat' },
  description:
    'A private home online for you and your friends, built from the pieces you choose together.',
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: 'Habitat', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1017' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
