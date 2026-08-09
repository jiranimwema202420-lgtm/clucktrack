
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

  /*
   * Show a loading screen while Firebase determines
   * whether the current user is authenticated.
   */
  if (isUserLoading && !isLandingPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  /*
   * Authenticated users should not remain on the
   * landing page or login page.
   */
  if (!isUserLoading && user && (isLandingPage || isPublicRoute)) {
    redirect('/dashboard');
  }
  
  /*
   * Unauthenticated users cannot access protected routes.
   */
  if (!isUserLoading && !user && !isPublicRoute && !isLandingPage) {
    redirect('/login');
  }
  
  /*
   * Landing page and public routes don't use
   * the authenticated application shell.
   */
  if (isLandingPage || isPublicRoute) {
    return <div className="bg-background">{children}</div>;
  }

  /*
   * Authenticated application layout.
   */
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

  /*
   * Fallback for unexpected authentication states.
   */
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('relative min-h-screen font-sans antialiased')}>
        {/* Background dot pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
        {/* Background gradient */}
        <div className="absolute inset-0 -z-20 h-full w-full bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <FirebaseClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppLayout>{children}</AppLayout>
          </ThemeProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
