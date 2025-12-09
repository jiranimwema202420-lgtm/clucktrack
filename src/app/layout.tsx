
'use client';

import type { ReactNode } from 'react';
import { usePathname, redirect } from 'next/navigation';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/header';
import Nav from '@/components/nav';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/login'];

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const isLandingPage = pathname === '/';

  // If user is not logged in and trying to access a protected route
  if (!user && !isPublicRoute && !isLandingPage) {
    redirect('/login');
  }
  
  // If user is logged in and on a public route or landing page
  if (user && (isPublicRoute || isLandingPage)) {
    redirect('/dashboard');
  }
  
  // For landing and login pages, render them without the main app layout
  if (isLandingPage || isPublicRoute) {
    return <div className="bg-background">{children}</div>;
  }

  // Render the full app layout for authenticated users
  return (
    <SidebarProvider>
      <Sidebar>
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
      <body className="font-sans antialiased">
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
