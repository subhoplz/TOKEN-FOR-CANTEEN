import './globals.css';
import { CanteenPassProvider } from '@/hooks/use-canteen-pass';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import ClientLayout from './client-layout';
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: 'CanteenPass',
  description: 'Manage your canteen tokens with ease.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={cn("h-full font-body antialiased", "bg-background")}>
        <CanteenPassProvider>
          <ClientLayout>{children}</ClientLayout>
        </CanteenPassProvider>
        <Script id="service-worker-registration">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                  console.log('SW registered: ', registration);
                }).catch(registrationError => {
                  console.log('SW registration failed: ', registrationError);
                });
              });
            }
          `}
        </Script>
        <SpeedInsights />
      </body>
    </html>
  );
}
