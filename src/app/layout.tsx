
'use client';

import type { ReactNode } from 'react';
import { usePathname, redirect } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/header';
import Nav from '@/components/nav';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const publicRoutes = ['/login'];

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();
  const isLandingPage = pathname === '/';

  if (isUserLoading && !isLandingPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  // If loading is finished and user is logged in, redirect from landing or public routes
  if (!isUserLoading && user && (isLandingPage || isPublicRoute)) {
    redirect('/dashboard');
  }
  
  // If loading is finished and user is not logged in, redirect from protected routes
  if (!isUserLoading && !user && !isPublicRoute && !isLandingPage) {
    redirect('/login');
  }
  
  // For landing and login pages, render them without the main app layout
  // also show landing page if user is loading
  if (isLandingPage || isPublicRoute) {
    return <div className="bg-background">{children}</div>;
  }

  // Render the full app layout for authenticated users on protected routes
  if (user) {
    return (
      <SidebarProvider>
        <Sidebar className='bg-card/60 backdrop-blur-lg border-r border-border/20'>
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

  // Fallback for edge cases (should not be reached with current logic)
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-sans antialiased relative min-h-screen")}>
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
        <div className="absolute inset-0 -z-20 h-full w-full bg-gradient-to-br from-primary/10 via-background to-background"></div>
        <FirebaseClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppLayout>{children}</AppLayout>
          </ThemeProvider>
        </FirebaseClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
