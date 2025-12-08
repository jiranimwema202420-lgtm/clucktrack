import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/header';
import Nav from '@/components/nav';

export const metadata: Metadata = {
  title: 'CluckHub',
  description: 'Modern full management for poultry',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
            </ThemeProvider>
          </FirebaseClientProvider>
          <Toaster />
      </body>
    </html>
  );
}
