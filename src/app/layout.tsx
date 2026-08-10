'use client';

import type { ReactNode } from 'react';
import { redirect, usePathname } from 'next/navigation';

import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import Header from '@/components/header';
import Nav from '@/components/nav';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const publicRoutes = ['/login'];

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();

  const isLandingPage = pathname === '/';
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isUserLoading && !isLandingPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isUserLoading && user && (isLandingPage || isPublicRoute)) {
    redirect('/dashboard');
  }

  if (!isUserLoading && !user && !isPublicRoute && !isLandingPage) {
    redirect('/login');
  }

  if (isLandingPage || isPublicRoute) {
    return <div className="bg-background">{children}</div>;
  }

  if (user) {
    return (
      <SidebarProvider>
        <Sidebar className="border-r border-border/20 bg-card/60 backdrop-blur-lg">
          <Nav />
        </Sidebar>

        <SidebarInset>
          <Header />

          <div className="p-4 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <link rel="manifest" href="/manifest.json" />

        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={cn(
          'relative min-h-screen font-sans antialiased'
        )}
      >
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]" />

        <div className="absolute inset-0 -z-20 h-full w-full bg-gradient-to-br from-primary/10 via-background to-background" />

        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <AppLayout>{children}</AppLayout>
          </ThemeProvider>
        </FirebaseClientProvider>

        <Toaster />
      </body>
    </html>
  );
}